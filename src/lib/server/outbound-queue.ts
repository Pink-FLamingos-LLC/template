import { getRequestEvent } from "$app/server";

export type OutboundEmailMessage = {
  type: "email";
  to: string;
  subject: string;
  body: string;
  html: string;
};

export type OutboundMessage = OutboundEmailMessage;

export async function enqueue(msg: OutboundMessage): Promise<void> {
  try {
    const event = getRequestEvent();
    const queue = event?.platform?.env?.OUTBOUND_QUEUE as
      | { send: (msg: OutboundMessage) => Promise<void> }
      | undefined;
    if (!queue) {
      console.warn(
        "[outbound-queue] OUTBOUND_QUEUE binding not available. Logged message:",
        JSON.stringify(msg, null, 2),
      );
      return;
    }
    await queue.send(msg);
  } catch (cause) {
    console.error("[outbound-queue] Failed to enqueue message:", cause);
    throw cause;
  }
}
