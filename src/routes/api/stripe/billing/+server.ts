import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { StripeNotConfiguredError } from "$lib/server/stripe";
import { getDb } from "$lib/server/db";
import { user as userTable } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ locals, platform }) => {
  const user = locals.user;
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });
  if (!platform?.env?.DB) return json({ error: "No database" }, { status: 500 });

  try {
    const db = getDb(platform.env.DB);
    const [userRow] = await db.select().from(userTable).where(eq(userTable.id, user.id)).limit(1);

    if (!userRow?.stripeCustomerId) {
      return json({ error: "No Stripe customer found" }, { status: 400 });
    }

    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(env.STRIPE_SECRET_KEY!);

    const session = await stripe.billingPortal.sessions.create({
      customer: userRow.stripeCustomerId,
      return_url: `${env.BETTER_AUTH_URL}/`,
    });

    return json({ url: session.url! });
  } catch (error) {
    if (error instanceof StripeNotConfiguredError) {
      return json({ error: "Stripe is not configured" }, { status: 400 });
    }
    throw error;
  }
};
