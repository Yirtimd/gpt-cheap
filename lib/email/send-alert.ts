import "server-only";
import { Resend } from "resend";
import MentionAlertEmail from "@/emails/mention-alert";
import { env } from "@/lib/env";

const FROM_EMAIL = "alerts@chatgpt.cheap";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function sendMentionAlert(params: {
  to: string;
  brandName: string;
  direction: "gained" | "lost";
  previousRate: number | null;
  currentRate: number;
}): Promise<boolean> {
  const { to, brandName, direction, previousRate, currentRate } = params;

  if (!env.RESEND_API_KEY) {
    console.log(
      `[email stub] Would send ${direction} alert for "${brandName}" to ${to}. ` +
        `Rate: ${previousRate ?? "n/a"}% → ${Math.round(currentRate * 100)}%`,
    );
    return false;
  }

  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${brandName} ${direction === "gained" ? "gained" : "lost"} mention in AI responses`,
    react: MentionAlertEmail({
      brandName,
      direction,
      previousRate: previousRate !== null ? `${Math.round(previousRate * 100)}%` : "N/A",
      currentRate: `${Math.round(currentRate * 100)}%`,
      dashboardUrl: `${SITE_URL}/dashboard`,
    }),
  });

  if (error) {
    console.error("[email] Failed to send mention alert:", error);
    return false;
  }

  return true;
}
