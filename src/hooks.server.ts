import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { building } from "$app/environment";
import { PUBLIC_SENTRY_DSN } from "$env/static/public";
import { handleErrorWithSentry, sentryHandle, initCloudflareSentryHandle } from "@sentry/sveltekit";
import { sentryBeforeSend } from "$lib/server/sentry-sanitize";
import { createAuth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { isRateLimited, checkRateLimit } from "$lib/server/rate-limit";
import { getDb } from "$lib/server/db";
import { user as userTable } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_ORIGINS = [/^https?:\/\/localhost(:\d+)?$/];

const VERIFICATION_EXEMPT_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
  "/auth/verification-success",
  "/",
]);
const VERIFICATION_EXEMPT_PREFIXES = ["/api/auth"];

function isVerificationExempt(pathname: string): boolean {
  if (VERIFICATION_EXEMPT_PATHS.has(pathname)) return true;
  return VERIFICATION_EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((pattern) => pattern.test(origin));
}

function addCorsHeaders(request: Request, response: Response): Response {
  const origin = request.headers.get("origin");
  if (!origin || !isOriginAllowed(origin)) return response;

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  headers.set("Access-Control-Max-Age", "86400");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const myErrorHandler = ({
  error,
  status,
  message,
}: {
  error: unknown;
  status: number;
  message: string;
}) => {
  const errorId = crypto.randomUUID().slice(0, 8);

  console.error(
    JSON.stringify({
      errorId,
      status,
      message,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack?.slice(0, 1000) : undefined,
    }),
  );

  return {
    message:
      status === 404 || status === 401 || status === 403 ? message : "An unexpected error occurred",
    errorId,
  };
};

export const handleError = handleErrorWithSentry(myErrorHandler);

async function authenticate(event: Parameters<Handle>[0]["event"]) {
  if (!event.platform?.env?.DB) {
    // When building, D1 binding might not be present.
    if (building) return;
    throw new Error('D1 binding "DB" not found - are you running with wrangler?');
  }

  event.locals.auth = createAuth(event.platform.env.DB);
  const { auth } = event.locals;

  const session = await auth.api.getSession({ headers: event.request.headers });
  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
    return;
  }

  const authHeader = event.request.headers.get("Authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token.length >= 16) {
      try {
        type ApiKeyPlugin = {
          verifyApiKey: (opts: { body: { key: string }; headers: Headers }) => Promise<{
            valid: boolean;
            key?: { userId: string };
          }>;
        };
        const result = await (auth.api as unknown as ApiKeyPlugin).verifyApiKey({
          body: { key: token },
          headers: event.request.headers,
        });
        if (result.valid && result.key?.userId) {
          const db = getDb(event.platform.env.DB);
          const [userRow] = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, result.key.userId))
            .limit(1);
          if (userRow) {
            event.locals.user = userRow;
          }
        }
      } catch {
        /* API key verification failed */
      }
    }
  }
}

const handleBetterAuth: Handle = async ({ event, resolve }) => {
  await authenticate(event);

  if (event.locals.user && !event.locals.user.emailVerified) {
    const pathname = event.url.pathname;
    if (!isVerificationExempt(pathname)) {
      if (pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ message: "Email verification required." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(null, {
        status: 302,
        headers: { Location: "/confirm-email" },
      });
    }
  }

  if (building || !event.locals.auth) {
    return resolve(event);
  }

  const response = await svelteKitHandler({ event, resolve, auth: event.locals.auth, building });
  return response;
};

const appHandle: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;

  if (isRateLimited(pathname) && event.platform?.env) {
    const { API_RATE_LIMITER, AUTH_RATE_LIMITER } = event.platform.env as any;
    if (API_RATE_LIMITER && AUTH_RATE_LIMITER) {
      const response = await checkRateLimit(event, API_RATE_LIMITER, AUTH_RATE_LIMITER);
      if (response) return response;
    }
  }

  const isApiRoute = pathname.startsWith("/api/");

  if (isApiRoute && event.request.method === "OPTIONS") {
    const origin = event.request.headers.get("origin");
    if (origin && isOriginAllowed(origin)) {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
    return new Response(null, { status: 204 });
  }

  const response = await handleBetterAuth({ event, resolve });

  if (isApiRoute) {
    return addCorsHeaders(event.request, response);
  }

  return response;
};

export const handle = sequence(
  initCloudflareSentryHandle({
    dsn: PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    beforeSend: sentryBeforeSend,
  }),
  sentryHandle(),
  appHandle,
);
