import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDb } from "$lib/server/db";
import { user as userTable } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { syncStripeDataToKV } from "$lib/server/stripe";

export const GET: RequestHandler = async ({ locals, platform }) => {
  const user = locals.user;
  if (!user || !platform?.env?.DB) return redirect(302, "/login");

  const db = getDb(platform.env.DB);
  const [userRow] = await db.select().from(userTable).where(eq(userTable.id, user.id)).limit(1);

  if (userRow?.stripeCustomerId) {
    await syncStripeDataToKV(platform.env.DB, userRow.stripeCustomerId);
  }

  return redirect(302, "/");
};
