import { PUBLIC_SENTRY_DSN } from "$env/static/public";
import * as Sentry from "@sentry/sveltekit";
import { sentryBeforeSend } from "$lib/server/sentry-sanitize";

Sentry.init({
  dsn: PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  beforeSend: sentryBeforeSend,
});
