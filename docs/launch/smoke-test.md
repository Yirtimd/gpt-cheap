# Launch Smoke-Test Runbook

Manual end-to-end test script to run on production (https://chatgpt-cheap.vercel.app) before Product Hunt. Do this once with all env variables set, then repeat every time a critical piece is deployed.

## Prerequisites (env variables on Vercel)

Verify these are set on the Vercel project for Production before running:

| Variable | Required for | Can be empty? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | everything | no |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | auth | no |
| `SUPABASE_SERVICE_ROLE_KEY` | pipeline writes | no |
| `GEMINI_API_KEY` | provider calls | no (for real runs) |
| `OPENAI_API_KEY` | provider calls | yes (runs in stub mode) |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | checkout | yes (stub mode) |
| `STRIPE_PRICE_STARTER/GROWTH/PRO` | checkout | yes (stub) |
| `RESEND_API_KEY` | email alerts | yes (stub) |
| `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` | background runs | yes (no runs) |
| `UPSTASH_REDIS_REST_URL` + `_TOKEN` | rate limit | yes (no limit) |
| `POSTHOG_API_KEY` + `NEXT_PUBLIC_POSTHOG_KEY` | analytics | yes |
| `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` | error tracking | yes |

Block launch until at minimum Supabase + Gemini + Stripe are all set.

## Test script

### 1. Landing → SEO

- [ ] Visit `/` in incognito. Hero renders, pricing cards visible.
- [ ] Inspect page source: `<title>` is "ChatGPT.cheap — AEO monitoring for SMB from $9/mo". JSON-LD `SoftwareApplication` present.
- [ ] `/sitemap.xml` returns valid XML with at least 4 URLs.
- [ ] `/robots.txt` disallows `/dashboard`, `/api/`, `/auth/`.
- [ ] `/opengraph-image` returns a PNG (1200×630). Preview with https://metatags.io/.
- [ ] `/blog` lists the launch post. `/blog/introducing-chatgpt-cheap` renders full article.
- [ ] `/legal/privacy`, `/legal/terms`, `/legal/refund` all return 200 with content.

### 2. Auth — magic link

- [ ] `/login` form renders. Input and button visible.
- [ ] Submit invalid email ("foo") → 400 error displayed.
- [ ] Submit real email. Check inbox within 30s. Link uses the `token_hash` template (`/auth/confirm?token_hash=...`), NOT the default PKCE template.
- [ ] Click link. Should arrive at `/dashboard`. If no brands exist, redirects to `/onboarding`.
- [ ] Submit magic link 6 times rapidly (if Upstash configured): 6th should return 429.

### 3. Onboarding

- [ ] Step 1: enter brand name ("Acme") + domain + description. "Continue" enabled after name.
- [ ] Step 2: fill 3 queries.
- [ ] Step 3: see summary. Click "Start monitoring".
- [ ] Redirect to `/dashboard`. Sidebar shows "Acme" under Brands.
- [ ] Supabase: `brands` and `queries` rows exist linked to the user.
- [ ] PostHog (if configured): `brand_created` + `queries_created` events visible within 1 min.

### 4. Dashboard (no runs yet)

- [ ] Dashboard renders with 0% mention rate, 0 runs.
- [ ] Empty-state card "No runs yet".
- [ ] Sidebar shows plan badge ("starter").

### 5. Run the pipeline manually

Prerequisite: Inngest dev URL is registered at https://app.inngest.com/env/production with our `/api/inngest` endpoint.

Option A — via Inngest dashboard:
- [ ] Inngest → `run/brand.scheduled` → Send test event with `{ brandId, userId }` filled from Supabase Studio.

Option B — via smoke-test script (local):
- [ ] Run `pnpm tsx scripts/smoke-test.ts` from local machine with `.env.local` pointing to production DB. Creates a throwaway user + brand + run.

Either way, verify:
- [ ] Within 15 minutes, `runs.status = 'done'` in Supabase.
- [ ] `results` rows created: queries × providers × replication.
- [ ] Dashboard now shows mention rate, chart, results table.
- [ ] Click a result → `/dashboard/query/[id]` renders raw response with brand highlighted.
- [ ] `profiles.monthly_cost_cents_used` incremented (should be under the plan cap).

### 6. Email alert

- [ ] Force a "mention gained" transition by running 2 runs with intentionally different mention rates.
- [ ] Email arrives from `alerts@chatgpt.cheap` within 2 minutes.
- [ ] Subject line contains the brand name and "gained"/"lost".
- [ ] `alerts` row created with `sent_at` populated.

### 7. Checkout

- [ ] Settings → click "Upgrade to Growth".
- [ ] Redirected to Stripe Checkout URL.
- [ ] Use test card `4242 4242 4242 4242`.
- [ ] Redirect back to `/dashboard?checkout=success`.
- [ ] `profiles.plan` updated to "growth". Sidebar badge reflects it.
- [ ] PostHog: `checkout_completed` event.

### 8. Customer portal

- [ ] Settings → "Open Customer Portal".
- [ ] Stripe portal opens. Cancel subscription.
- [ ] Return to Settings. `profiles.plan` downgrades to "starter" within ~30s (webhook).

### 9. Cost caps

- [ ] With `MAX_GLOBAL_COST_CENTS_PER_DAY=100` temporarily, trigger enough runs to exceed.
- [ ] New `run/query.execute` events should log `global_cap_reached` and return early.
- [ ] PostHog: `global_cap_reached` event fires.
- [ ] Reset env var after the test.

### 10. Error tracking

- [ ] Force a server error (e.g. temporarily break an API route).
- [ ] Sentry (if DSN set): event appears in dashboard within 30s, with stacktrace.

## Gates

Launch readiness = all 10 steps pass. If any step is blocked on env not yet configured, mark it as `BLOCKED` and document the reason in the sprint board. Don't promote to Product Hunt until Steps 1–7 all green.

## Rollback plan

If a production issue appears post-launch:
1. `vercel promote <previous-deployment-url>` to revert.
2. Supabase → pause Inngest cron in Dashboard to stop runs.
3. Stripe → pause new signups (toggle on `/api/stripe/checkout` via env `STRIPE_DISABLED=1` — currently not implemented; add if needed).
