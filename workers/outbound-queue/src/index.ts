type OutboundEmailMessage = {
  type: "email";
  to: string;
  subject: string;
  body: string;
  html: string;
};

type OutboundMessage = OutboundEmailMessage;

interface Env {
  EMAIL?: {
    send(msg: {
      to: string;
      from: { email: string; name?: string };
      subject: string;
      html: string;
      text: string;
    }): Promise<{ messageId: string }>;
  };
  EMAIL_FROM_ADDRESS: string;
}

async function sendMail(env: Env, msg: OutboundEmailMessage): Promise<void> {
  if (env.EMAIL) {
    await env.EMAIL.send({
      to: msg.to,
      from: { email: env.EMAIL_FROM_ADDRESS, name: "App Template" },
      subject: msg.subject,
      html: msg.html,
      text: msg.body,
    });
    console.log("[outbound-queue] Email successfully sent to:", msg.to);
  } else {
    console.log("[outbound-queue] EMAIL binding not configured. Mock sending message:");
    console.log(JSON.stringify(msg, null, 2));
  }
}

export default {
  async queue(batch: MessageBatch<OutboundMessage>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const msg = message.body;
      try {
        if (msg.type === "email") {
          await sendMail(env, msg);
        }
        message.ack();
      } catch (cause) {
        console.error(
          `[outbound-queue] Failed to process message for ${msg.to}:`,
          cause instanceof Error ? cause.message : cause,
        );
        message.retry({ delaySeconds: 10 });
      }
    }
  },
};
