import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

const AUTH_ROUTE_PREFIXES = ["/api/auth/"];
const EXCLUDED_PREFIXES = ["/api/webhooks/"];

export function isRateLimited(pathname: string): boolean {
  if (!pathname.startsWith("/api/")) return false;
  return !EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));
}

function getRateLimitKey(event: RequestEvent): string {
  const authHeader = event.request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    return `apikey_${token.slice(0, 32)}`;
  }

  if (event.locals.user?.id) {
    return `user_${event.locals.user.id}`;
  }

  const ip = event.request.headers.get("cf-connecting-ip");
  if (ip) return `ip_${ip}`;

  return "unknown";
}

export async function checkRateLimit(
  event: RequestEvent,
  rateLimiter: { limit: (opts: { key: string }) => Promise<{ success: boolean }> },
  authRateLimiter: { limit: (opts: { key: string }) => Promise<{ success: boolean }> },
): Promise<Response | null> {
  const pathname = event.url.pathname;
  const isAuthRoute = AUTH_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));
  const limiter = isAuthRoute ? authRateLimiter : rateLimiter;
  const key = getRateLimitKey(event);

  const { success } = await limiter.limit({ key });

  if (!success) {
    return json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "retry-after": "60",
        },
      },
    );
  }

  return null;
}
