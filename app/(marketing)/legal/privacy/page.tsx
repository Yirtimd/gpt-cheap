import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ChatGPT.cheap",
  description: "How ChatGPT.cheap collects, uses, and protects your data.",
};

const LAST_UPDATED = "April 2026";

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-sm">Last updated: {LAST_UPDATED}</p>

      <h2>1. Who we are</h2>
      <p>
        ChatGPT.cheap ("we", "us", "the Service") provides AEO monitoring for brands by querying
        third-party AI assistants (ChatGPT via OpenAI, Gemini via Google) on your behalf and
        analyzing the results.
      </p>

      <h2>2. What data we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> your email address (used for authentication via magic link)
          and account metadata provided by Supabase Auth.
        </li>
        <li>
          <strong>Monitoring configuration:</strong> brand name, domain, description, and the query
          prompts you configure.
        </li>
        <li>
          <strong>Monitoring results:</strong> raw text returned by AI providers, mention analysis,
          citations, and competitor lists extracted from those responses.
        </li>
        <li>
          <strong>Billing data:</strong> your Stripe customer ID and subscription status. Card
          details are handled by Stripe directly — we never see or store them.
        </li>
        <li>
          <strong>Usage analytics:</strong> aggregated product events (page views, feature usage)
          via PostHog to improve the product.
        </li>
        <li>
          <strong>Error tracking:</strong> stack traces and request metadata via Sentry when errors
          occur.
        </li>
      </ul>

      <h2>3. What we do with your data</h2>
      <p>
        We use your data to deliver the Service: run monitoring pipelines, bill your subscription,
        notify you of changes via email, and operate the application. We do not sell your data to
        third parties.
      </p>

      <h2>4. Third-party processors</h2>
      <ul>
        <li>Supabase (authentication + database) — eu-west-1 region</li>
        <li>Vercel (hosting)</li>
        <li>Stripe (payments)</li>
        <li>OpenAI (query processing)</li>
        <li>Google (Gemini query processing)</li>
        <li>Resend (transactional email)</li>
        <li>Inngest (background job scheduling)</li>
        <li>PostHog (product analytics)</li>
        <li>Sentry (error monitoring)</li>
        <li>Upstash (rate limiting)</li>
      </ul>
      <p>
        Each provider has its own privacy policy. Your query prompts and brand names are sent to
        OpenAI and Google as part of the monitoring process.
      </p>

      <h2>5. Data retention</h2>
      <ul>
        <li>Account data is retained while your account is active.</li>
        <li>
          Monitoring results are retained for the lifetime of your subscription. You can request
          deletion at any time.
        </li>
        <li>
          Backups are kept for up to 30 days by our database provider and are purged on a rolling
          basis.
        </li>
      </ul>

      <h2>6. Your rights</h2>
      <p>
        You can export or delete your data at any time. To exercise these rights, email us at
        support@chatgpt.cheap and we will respond within 30 days.
      </p>

      <h2>7. Cookies</h2>
      <p>
        We use strictly necessary cookies for authentication (Supabase session cookies). We do not
        use advertising cookies or share data with ad networks.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update this policy. Material changes will be announced via email to active users at
        least 7 days before taking effect.
      </p>

      <h2>9. Contact</h2>
      <p>Questions? Reach us at support@chatgpt.cheap.</p>
    </>
  );
}
