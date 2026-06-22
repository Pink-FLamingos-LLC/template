import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { getDb } from "$lib/server/db";
import { stripeSubscription } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

const AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
]);

const PUBLIC_PATHS = new Set(["/", "/privacy", "/terms"]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return pathname.startsWith("/api/demo");
}

export const load: LayoutServerLoad = async ({ url, locals, platform }) => {
  if (!locals.user && !AUTH_PATHS.has(url.pathname) && !isPublicPath(url.pathname)) {
    return redirect(302, "/login");
  }

  if (locals.user && AUTH_PATHS.has(url.pathname)) {
    return redirect(302, "/");
  }

  let subscription: {
    status: string;
    priceId: string | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    paymentMethodBrand: string | null;
    paymentMethodLast4: string | null;
  } | null = null;

  if (locals.user && platform?.env?.DB) {
    const db = getDb(platform.env.DB);
    const [sub] = await db
      .select()
      .from(stripeSubscription)
      .where(eq(stripeSubscription.userId, locals.user.id))
      .limit(1);
    if (sub) {
      subscription = {
        status: sub.status,
        priceId: sub.priceId,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
        paymentMethodBrand: sub.paymentMethodBrand,
        paymentMethodLast4: sub.paymentMethodLast4,
      };
    }
  }

  return {
    user: locals.user,
    subscription,
  };
};
