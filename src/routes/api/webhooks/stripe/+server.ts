import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { syncStripeDataToKV, StripeNotConfiguredError } from "$lib/server/stripe";
import { env } from "$env/dynamic/private";

const ALLOWED_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.marked_uncollectible",
  "invoice.payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
]);

export const POST: RequestHandler = async ({ request, platform }) => {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !platform?.env?.DB) {
    return new Response("Bad Request", { status: 400 });
  }

  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
    });

    let event: ReturnType<typeof stripe.webhooks.constructEvent>;
    try {
      event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET!);
    } catch {
      return new Response("Invalid signature", { status: 400 });
    }

    if (!ALLOWED_EVENTS.has(event.type)) {
      return json({ received: true });
    }

    const customerId = (event.data.object as { customer: string }).customer;
    if (typeof customerId !== "string") {
      return json({ received: true });
    }

    await syncStripeDataToKV(platform.env.DB, customerId);
  } catch (error) {
    if (error instanceof StripeNotConfiguredError) {
      console.error("[stripe-webhook] Stripe not configured");
      return new Response("Stripe not configured", { status: 500 });
    }
    throw error;
  }

  return json({ received: true });
};
