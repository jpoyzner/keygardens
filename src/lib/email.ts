import { Resend } from "resend";

// Server-only Resend client + transactional email senders. Falls back to a
// no-op (logs instead of sending) if RESEND_API_KEY isn't configured, so local
// dev without Resend set up doesn't crash server actions.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const CONTACT_INBOX_EMAIL = process.env.CONTACT_INBOX_EMAIL;

async function sendEmail(options: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.warn(`RESEND_API_KEY not set — skipping email "${options.subject}" to ${options.to}`);
    return;
  }
  const { error } = await resend.emails.send({ from: FROM_EMAIL, ...options });
  if (error) {
    console.error(`Failed to send email "${options.subject}" to ${options.to}:`, error);
  }
}

export async function sendContactNotification(submission: {
  name: string;
  email: string;
  message: string;
}) {
  if (!CONTACT_INBOX_EMAIL) {
    console.warn("CONTACT_INBOX_EMAIL not set — skipping contact form notification email");
    return;
  }
  await sendEmail({
    to: CONTACT_INBOX_EMAIL,
    subject: `New contact form message from ${submission.name}`,
    html: `
      <p><strong>From:</strong> ${submission.name} (${submission.email})</p>
      <p>${submission.message.replace(/\n/g, "<br />")}</p>
    `,
  });
}

export async function sendSubscriptionConfirmation(email: string) {
  await sendEmail({
    to: email,
    subject: "You're subscribed to Keygardens",
    html: `<p>Thanks for subscribing! We'll email you when new products and updates go live.</p>`,
  });
}

export async function sendOrderStatusEmail(order: {
  id: string;
  contactEmail: string;
  status: "shipped" | "delivered";
}) {
  const statusLabel = order.status === "shipped" ? "shipped" : "delivered";
  await sendEmail({
    to: order.contactEmail,
    subject: `Your Keygardens order has ${statusLabel}`,
    html: `<p>Good news! Your order #${order.id.slice(0, 8)} has been ${statusLabel}.</p>`,
  });
}
