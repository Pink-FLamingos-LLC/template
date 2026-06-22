import type { ErrorEvent, EventHint } from "@sentry/sveltekit";

const SENSITIVE_HEADERS = new Set(["authorization", "x-api-key", "cookie"]);

const SENSITIVE_KEYS =
  /password|token|secret|api[_-]?key|accessToken|refreshToken|idToken|authorization|bearer/i;

const SENSITIVE_QUERY_PARAMS = /password|token|secret|key|api_key|code/i;

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(
      /(password|token|secret|api_key|authorization)(\s*[:=]\s*['"]?)[^\s,;'"}\]]+/gi,
      "$1$2[REDACTED]",
    );
  }
  return value;
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.test(key)) {
      result[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = sanitizeValue(value);
    }
  }
  return result;
}

export function sentryBeforeSend(event: ErrorEvent, _hint: EventHint): ErrorEvent | null {
  if (event.request) {
    if (event.request.headers) {
      for (const header of Object.keys(event.request.headers)) {
        if (SENSITIVE_HEADERS.has(header.toLowerCase())) {
          event.request.headers[header] = "[REDACTED]";
        }
      }
    }

    if (event.request.url) {
      const url = new URL(event.request.url);
      let changed = false;
      for (const [key] of url.searchParams) {
        if (SENSITIVE_QUERY_PARAMS.test(key)) {
          url.searchParams.set(key, "[REDACTED]");
          changed = true;
        }
      }
      if (changed) event.request.url = url.toString();
    }

    if (event.request.data && typeof event.request.data === "object") {
      event.request.data = sanitizeObject(event.request.data as Record<string, unknown>);
    }
  }

  if (event.exception?.values) {
    for (const exc of event.exception.values) {
      if (exc.value) {
        exc.value = exc.value.replace(
          /(password|token|secret|api_key|authorization)(\s*[:=]\s*['"]?)[^\s,;'"}\]]+/gi,
          "$1$2[REDACTED]",
        );
      }
    }
  }

  return event;
}
