import { env } from "$env/dynamic/private";
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { bearer, apiKey } from "better-auth/plugins";
import { getRequestEvent } from "$app/server";
import { getDb } from "./db";
import { sendEmail } from "./email";

const verificationEmailHtml = (url: string) => `
  <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; color: #111827;">Verify your email address</h1>
    <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">Thank you for registering. Please click the button below to verify your email address and activate your account.</p>
    <a href="${url}" style="display: inline-block; margin: 24px 0; padding: 14px 32px; background: #2563eb; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Verify Email</a>
    <p style="font-size: 14px; color: #9ca3af;">This link expires in 1 hour. If you did not request this account, please ignore this email.</p>
  </div>`;

const passwordResetEmailHtml = (url: string) => `
  <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; color: #111827;">Reset your password</h1>
    <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">Click the button below to reset your account password. This link expires in 1 hour.</p>
    <a href="${url}" style="display: inline-block; margin: 24px 0; padding: 14px 32px; background: #2563eb; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
    <p style="font-size: 14px; color: #9ca3af;">If you did not request this, please ignore this email.</p>
  </div>`;

const programmaticSignup = {
  id: "programmatic-signup",
  init: () => ({
    options: {
      emailVerification: {
        sendVerificationEmail: async ({
          user,
          url,
        }: {
          user: { id: string; email: string };
          url: string;
        }) => {
          await sendEmail({
            to: user.email,
            subject: "Verify your email address",
            body: `Verify your email by clicking: ${url}`,
            html: verificationEmailHtml(url),
          });
        },
      },
    },
  }),
};

const authConfig = {
  baseURL: env.BETTER_AUTH_URL || "http://localhost:5173",
  secret: env.BETTER_AUTH_SECRET || "development_secret_only",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        body: `Reset your password here: ${url}`,
        html: passwordResetEmailHtml(url),
      });
    },
  },
  plugins: [sveltekitCookies(getRequestEvent), bearer(), apiKey(), programmaticSignup],
} satisfies Omit<Parameters<typeof betterAuth>[0], "database">;

export const createAuth = (d1: D1Database) =>
  betterAuth({
    ...authConfig,
    database: drizzleAdapter(getDb(d1), { provider: "sqlite" }),
  });

/**
 * DO NOT USE!
 *
 * This instance is used by the `better-auth` CLI for schema generation ONLY.
 * To access `auth` at runtime, use `event.locals.auth`.
 */
export const auth = createAuth(null!);
