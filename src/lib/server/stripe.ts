import { env } from "$env/dynamic/private";
import { getDb } from "$lib/server/db";
import {
  user as userTable,
  stripeSubscription as stripeSubscriptionTable,
} from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

let _stripe: import("stripe").default | null = null;

function getStripe(): import("stripe").default | null {
  if (_stripe) return _stripe;
  if (!env.STRIPE_SECRET_KEY) return null;

  const Stripe = require("stripe").default ?? require("stripe");
  _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-05-27.dahlia",
  });
  return _stripe;
}

export type StripeSubscriptionCache =
  | {
      subscriptionId: string | null;
      status: string;
      priceId: string | null;
      currentPeriodStart: number | null;
      currentPeriodEnd: number | null;
      cancelAtPeriodEnd: boolean;
      paymentMethod: {
        brand: string | null;
        last4: string | null;
      } | null;
    }
  | {
      status: "none";
    };

export class StripeNotConfiguredError extends Error {
  constructor() {
    super("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
}

export async function ensureStripeCustomer(
  user: { id: string; email: string; name: string | null },
  d1: D1Database,
): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new StripeNotConfiguredError();

  const db = getDb(d1);

  const [row] = await db.select().from(userTable).where(eq(userTable.id, user.id)).limit(1);
  if (row?.stripeCustomerId) return row.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId: user.id },
  });

  await db
    .update(userTable)
    .set({ stripeCustomerId: customer.id })
    .where(eq(userTable.id, user.id));

  return customer.id;
}

export async function syncStripeDataToKV(
  d1: D1Database,
  customerId: string,
): Promise<StripeSubscriptionCache> {
  const stripe = getStripe();
  if (!stripe) return { status: "none" };

  const db = getDb(d1);

  const [userRow] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.stripeCustomerId, customerId))
    .limit(1);
  if (!userRow) return { status: "none" };

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: "all",
    expand: ["data.default_payment_method"],
  });

  if (subscriptions.data.length === 0) {
    await db.delete(stripeSubscriptionTable).where(eq(stripeSubscriptionTable.userId, userRow.id));
    return { status: "none" };
  }

  const sub = subscriptions.data[0];
  const currentPeriodStart = (sub as any).current_period_start ?? null;
  const currentPeriodEnd = (sub as any).current_period_end ?? null;
  const cancelAtPeriodEnd = (sub as any).cancel_at_period_end ?? false;

  const paymentMethod =
    sub.default_payment_method && typeof sub.default_payment_method !== "string"
      ? {
          brand: sub.default_payment_method.card?.brand ?? null,
          last4: sub.default_payment_method.card?.last4 ?? null,
        }
      : null;

  const data = {
    userId: userRow.id,
    stripeCustomerId: customerId,
    status: sub.status,
    priceId: sub.items.data[0]?.price.id ?? null,
    currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : null,
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
    cancelAtPeriodEnd,
    paymentMethodBrand: paymentMethod?.brand ?? null,
    paymentMethodLast4: paymentMethod?.last4 ?? null,
  };

  await db
    .insert(stripeSubscriptionTable)
    .values({ id: sub.id, ...data, createdAt: new Date(), updatedAt: new Date() })
    .onConflictDoUpdate({ target: stripeSubscriptionTable.id, set: data });

  return {
    subscriptionId: sub.id,
    status: sub.status,
    priceId: sub.items.data[0]?.price.id ?? null,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    paymentMethod,
  };
}
