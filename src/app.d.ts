import type { User, Session } from "better-auth";
import { createAuth } from "$lib/server/auth";

declare global {
  namespace App {
    interface Error {
      message: string;
      errorId?: string;
    }

    interface Locals {
      user?: User;
      session?: Session;
      auth: ReturnType<typeof createAuth>;
    }

    interface Platform {
      env: {
        DB: D1Database;
        API_RATE_LIMITER: { limit: (opts: { key: string }) => Promise<{ success: boolean }> };
        AUTH_RATE_LIMITER: { limit: (opts: { key: string }) => Promise<{ success: boolean }> };
        STATE_DO: DurableObjectNamespace;
        OUTBOUND_QUEUE: Queue;
        DEMO_MODE?: string;
        STRIPE_SECRET_KEY?: string;
        STRIPE_PUBLISHABLE_KEY?: string;
        STRIPE_WEBHOOK_SECRET?: string;
        STRIPE_PRICE_ID?: string;
        STATE_DO_SECRET?: string;
        ALLOWED_ORIGINS?: string;
        CF_VERSION_METADATA?: { id: string };
      };
      context: ExecutionContext;
    }
  }
}

export {};
