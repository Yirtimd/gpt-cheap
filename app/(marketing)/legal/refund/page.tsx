import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — ChatGPT.cheap",
  description: "Refund policy for ChatGPT.cheap subscriptions.",
};

const LAST_UPDATED = "April 2026";

export default function RefundPage() {
  return (
    <>
      <h1>Refund Policy</h1>
      <p className="text-sm">Last updated: {LAST_UPDATED}</p>

      <h2>Summary</h2>
      <p>
        If the Service does not meet your expectations within the first 14 days of your initial
        subscription, email us at support@chatgpt.cheap and we will refund the most recent payment.
        No questions asked.
      </p>

      <h2>Details</h2>
      <ul>
        <li>
          <strong>14-day window:</strong> full refund eligibility is available for the first 14 days
          after your first charge on a given plan.
        </li>
        <li>
          <strong>After 14 days:</strong> we do not issue prorated refunds for partially-used
          months. You can cancel to stop future billing.
        </li>
        <li>
          <strong>Plan downgrades:</strong> take effect at the start of the next billing period. The
          difference is not refunded.
        </li>
        <li>
          <strong>Service outages:</strong> if we cause an extended outage of the scheduled
          monitoring that prevents normal use, contact support and we will issue a proportional
          credit.
        </li>
      </ul>

      <h2>How to request a refund</h2>
      <p>
        Email support@chatgpt.cheap from the address on your account. Include your account email and
        the approximate date of the charge. Refunds are processed to the original payment method
        within 7 business days.
      </p>

      <h2>What is not eligible</h2>
      <ul>
        <li>Charges older than 14 days on the original subscription.</li>
        <li>Accounts that violated the acceptable-use policy in our Terms.</li>
        <li>LLM provider costs already incurred on your behalf.</li>
      </ul>
    </>
  );
}
