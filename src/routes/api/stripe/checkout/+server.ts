import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ensureStripeCustomer, StripeNotConfiguredError } from "$lib/server/stripe";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ locals, platform }) => {
  const user = locals.user;
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });
  if (!platform?.env?.DB) return json({ error: "No database" }, { status: 500 });

  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(env.STRIPE_SECRET_KEY!);

    const customerId = await ensureStripeCustomer(user, platform.env.DB);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${env.BETTER_AUTH_URL}/api/stripe/success`,
      cancel_url: `${env.BETTER_AUTH_URL}/`,
    });

    return json({ url: session.url! });
  } catch (error) {
    if (error instanceof StripeNotConfiguredError) {
      return json({ error: "Stripe is not configured" }, { status: 400 });
    }
    console.error("[stripe-checkout] Unexpected error:", error);
    return json({ error: "Payment processing error" }, { status: 500 });
  }
};
