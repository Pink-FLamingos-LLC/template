import { enqueue } from "./outbound-queue";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  body: string;
};

export async function sendEmail({ to, subject, body, html }: SendEmailParams) {
  console.log("[email] Enqueuing email to:", to);
  await enqueue({ type: "email", to, subject, body, html });
}
