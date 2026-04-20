# ChatGPT.cheap — Design Brief

A copy-paste prompt for Claude Code Design (or any UI-generation tool) to align a design system with the actual functionality already built in this repo. Paste everything between the START / END markers as a single prompt.

---

## START PROMPT

You are designing the UI for **ChatGPT.cheap**, a SaaS product that is already built end-to-end in Next.js 15 (App Router) + Tailwind + shadcn/ui. Your task is to produce the visual design — screens, components, design system — for the existing functionality below. **Do not invent new features.** Match what is described here so the design can be imported directly into the codebase without functional changes.

### 1. Product positioning

- **What it is:** AEO (Answer Engine Optimization) monitoring tool. It tracks whether and how a user's brand is mentioned in answers from ChatGPT and Gemini.
- **Who it is for:** freelancers, solo founders, small businesses, personal-brand bloggers, mini-agencies. Budget-conscious SMB segment that enterprise tools (Profound, Peec, AthenaHQ) ignore because the unit economics don't work for them.
- **Core promise:** "Know when ChatGPT recommends your brand." Weekly or daily reports on how AI answers questions about the user's market.
- **Tone of voice:** practical, founder-friendly, no enterprise jargon, no AI-hype. Confident and minimal. English UI only.

### 2. Brand & visual direction

- Modern IT-company aesthetic: clean, generous whitespace, soft gradients, subtle dot grid patterns, radial blurs as background accents.
- Single accent color called `brand` (currently a saturated indigo/violet — keep flexible). Use `bg-brand`, `text-brand`, `bg-brand-soft` (very light tint), `text-brand-foreground`.
- Cards have rounded corners (`rounded-2xl` for marketing, `rounded-xl` for app).
- Typography: tight tracking on headlines (`tracking-tight`), normal for body. Sans-serif (system / Inter-class).
- Light mode is primary. Dark mode should be supported via Tailwind `dark:` classes (the codebase already uses `dark:bg-yellow-800` etc.).
- Iconography: `lucide-react` only. Examples already used: `Sparkles`, `ArrowRight`, `Check`.
- Component library: **shadcn/ui only.** Do not introduce a custom design system. Allowed primitives in repo today: `Button`, `Card` (Header/Title/Description/Content/Footer), `Input`, `Label`, `Textarea`, `Badge`, `Avatar`, `Separator`, `Tabs`, `Accordion`, `Sonner` toast.

### 3. Information architecture

The app has three top-level zones, each with its own layout:

1. **Marketing** (public, unauthenticated) — `/`, `/blog`, `/blog/[slug]`, `/legal/privacy`, `/legal/terms`, `/legal/refund`.
2. **Auth** — `/login` (magic link only — no password, no social login).
3. **App** (authenticated, requires Supabase session) — `/onboarding`, `/dashboard`, `/dashboard/query/[queryId]`, `/settings`.

Auth gating: if a user with no brands hits `/dashboard` they are redirected to `/onboarding`. If a logged-in user hits `/`, they are redirected to `/dashboard`.

### 4. Screens to design (with exact data shown)

#### 4.1 Landing page (`/`)

One-scroll page composed of these sections in order:

1. **Hero** — small pill badge "AEO monitoring from $9/month" with a Sparkles icon. Big headline: "Know when ChatGPT **recommends your brand.**" (the second line in the brand gradient). Subhead about weekly reports for solo founders, freelancers, small teams. Two CTAs: primary "Start monitoring" → `/login`, secondary "See pricing" → `#pricing`. Microcopy underneath: "No free tier · Monthly billing · Cancel anytime". Below the hero: a stylized **dashboard preview** illustration.
2. **Stats band** — four numbers with labels on a muted background:
   - 79% — "net margin on Starter"
   - 2¢ — "per provider call"
   - 2 — "AI providers out of the box"
   - ~14m — "avg run duration"
3. **Features** section — small label "Features", headline "Built for the long tail of AEO", grid of feature cards (FeaturesGrid component). Each card = icon + short title + 1–2 sentence description. Themes: weekly/daily monitoring, ChatGPT + Gemini coverage, sentiment + position parsing, competitor mentions, citation tracking, email alerts on changes.
4. **How it works** section — small label "How it works", headline "From signup to first report in 24 hours". Three numbered steps: 1) Add your brand and 5 queries, 2) We run them on ChatGPT and Gemini with web search, 3) You get a weekly report and email alerts on changes.
5. **Pricing** section (`#pricing`) — three plan cards (Starter/Growth/Pro), middle one ("Growth") highlighted as **Most popular** with a Sparkles pill on top, slightly elevated. Each card: plan name, price `$X /month`, audience subtitle, feature list with check marks, CTA button "Start with [Plan]". Exact data:
   - **Starter — $9/month** — "For solo founders and freelancers." Features: 5 queries · 2 providers (OpenAI + Gemini) · Weekly monitoring · Email alerts.
   - **Growth — $19/month** (Most popular) — "For growing brands and small teams." Features: 15 queries · 2 providers (OpenAI + Gemini) · Daily monitoring · 2x replication · Email alerts.
   - **Pro — $29/month** — "For mini-agencies managing multiple brands." Features: 30 queries (3 brands) · 2 providers (OpenAI + Gemini) · Daily monitoring · 3x replication · Priority email alerts.
6. **FAQ** section — accordion with 5–7 items. Themes the design should accommodate: "Why is this cheaper than Profound/Peec?", "How do you query ChatGPT — API or web?", "How often will I get alerts?", "What about Claude / Perplexity?", "Can I cancel anytime?", "Do you offer a free trial?" (answer: no), "Can I monitor more than one brand?".
7. **CTA band** — soft brand-colored gradient background with a radial blur. Headline: "See where your brand stands in AI answers." Subhead: "First report in 24 hours. $9/month. Cancel anytime." Single button "Get started" → `/login`.

Marketing layout has a top header (logo "ChatGPT.cheap" + nav: Features, Pricing, FAQ, Blog + "Sign in" button) and a footer (logo + tagline + nav columns: Product / Company / Legal / © year).

#### 4.2 Blog index (`/blog`)

Plain list of MDX posts. For each post: title, 1-line excerpt, publish date, reading time. Minimalist; same marketing header/footer.

#### 4.3 Blog post (`/blog/[slug]`)

Long-form prose layout. Max-width ~prose. Cover title, date, reading time. Body uses default MDX-rendered headings, paragraphs, lists, code blocks, blockquotes. Same marketing header/footer.

#### 4.4 Legal pages (`/legal/privacy`, `/legal/terms`, `/legal/refund`)

Static long-form text. Same marketing layout. Sidebar with section anchors is optional; keep it simple.

#### 4.5 Login (`/login`)

Centered single-card auth screen. Card title: "Sign in to ChatGPT.cheap". Description: "We'll email you a magic link. No passwords." Single email input + button "Send magic link". After submit: success state showing "Check your email — we sent a link to {email}". Error state: red helper text under the input. No "Sign up" link — magic link auto-creates accounts.

#### 4.6 Onboarding (`/onboarding`)

Centered card, max-width ~lg. Three steps with a slim progress bar at the top (3 segments, filled left-to-right):

- **Step 0 — Your Brand**: title "Your Brand", description "Tell us about the brand you want to monitor."
  - Required: Brand name (e.g. "Acme Corp")
  - Optional: Domain (e.g. "acme.com"), Description (textarea, 3 rows).
- **Step 1 — Monitoring Queries**: title "Monitoring Queries", description "What should ChatGPT and Gemini be asked about your brand?"
  - 5 input fields labeled Query 1 – Query 5. Placeholder example: `"Best {brandName} alternatives for small business"`.
  - Helper text under: "Fill at least 1 query. These are the prompts we will send to ChatGPT and Gemini."
- **Step 2 — All Set**: title "All Set", description "Review and start monitoring." Shows a summary: Brand: name (domain) · Queries: N configured · Plan: Starter ($9/mo) — you can upgrade in Settings after setup. Footnote: "Your first monitoring run will start within 24 hours. Billing will be activated once Stripe is connected."

Footer of the card has Back (ghost) on the left and Continue / Start monitoring (primary) on the right. Inline error text in red appears at the bottom of the card content on failure. Loading state on the final button: "Saving...".

#### 4.7 App layout (used for `/dashboard`, `/dashboard/query/...`, `/settings`)

Two-pane layout: left **sidebar** (256px wide, muted background, right border) + main content area.

Sidebar contents top-to-bottom:
- Wordmark "ChatGPT.cheap" → links to `/dashboard`. Below: small caps text with the user's plan ("starter plan" / "growth plan" / "pro plan").
- Nav links: Dashboard, Settings. Active link uses `bg-accent` + accent-foreground + medium weight.
- Separator.
- "BRANDS" section header (uppercase, muted, very small). List of the user's brands as plain text rows (not links).
- Spacer pushes the bottom block down.
- Bottom block: separator + truncated user email + ghost "Sign out" button (left-aligned, full width).

#### 4.8 Dashboard (`/dashboard`)

Header: H1 "Dashboard".

Three KPI cards in a row (responsive grid `sm:grid-cols-3`):
- **Mention Rate** — big number "X%", microtext "{mentionedCount} / {totalResults} results".
- **Completed Runs** — big number "N", microtext "M in progress".
- **Brands** — big number with brand count, microtext listing brand names comma-separated.

Below the KPIs: a **MentionChart** card (Recharts area or line chart). X-axis = run dates (last 10 completed runs). Y-axis = mention rate %. Tooltip should show date, rate %, and `mentionedCount/totalResults`.

Below the chart: **ResultsTable** — table of the latest 20 results with these columns:
- Query (the prompt text, truncated; click row → `/dashboard/query/{queryId}?run={runId}`)
- Provider (badge: "openai" or "gemini")
- Mentioned (green check / muted dash)
- Sentiment (text: positive / neutral / negative, colored accordingly)
- Position (#N or "—")
- Recommendation (badge: "recommended" / "mentioned" / "dismissed")
- Cost (e.g. "2¢")
- Completed at (relative time)

Empty state: if no runs yet, show a calm card: "No runs yet. Your first monitoring run will appear here within 24 hours."

#### 4.9 Query detail (`/dashboard/query/[queryId]`)

Header: H1 "Query Detail" + subtle subtitle line with the brand name.

Card 1 — **Prompt**: shows the raw prompt text the user configured.

Cards 2..N — **Result cards** (latest 20, optionally filtered by `?run=...`). Each card has:
- Header row (left → right): provider badge ("openai" / "gemini"), then either green "Mentioned" or muted "Not mentioned", optional "#position", optional sentiment label. On the right: cost in cents (e.g. "2¢").
- **Context quote** block — left-bordered callout with the quote pulled from the answer.
- Separator.
- **Full response** — heading "Full response", then a scrollable (max-h-64) muted box containing the full provider answer with brand-name occurrences highlighted (yellow `<mark>` style — light bg in light mode, darker in dark mode).
- Optional **Competitors** row — list of competitor names parsed by the judge.
- Optional **Citations** row — bulleted list of links (title or URL) opening in new tab.

Empty state: "No results for this query yet."

#### 4.10 Settings (`/settings`)

H1 "Settings". A vertical stack of cards separated by `<Separator />`:

1. **Account card** — title "Account", description "Your account details". Body shows: Email, Plan (capitalized), Usage this period (in cents).
2. **Brand editor** (BrandEditor component) — edit brand name, domain, description; below it a list of the brand's queries with the ability to edit text, toggle `is_active`, add new query, delete query. Save button. Show success/error toasts via Sonner.
3. **Billing section** (BillingSection component) — three plan cards (PlanCard component) for Starter/Growth/Pro with the same data as the marketing pricing. The user's current plan is visually marked ("Current plan" badge) and its CTA is disabled. Other plans show a CTA "Upgrade" / "Downgrade" that triggers Stripe Checkout. If `hasStripeCustomer` is true, also show a "Manage billing" link that opens the Stripe Customer Portal.

#### 4.11 Email templates (out of scope for screen design but list for context)

Two transactional email templates exist in `/emails`: `welcome.tsx` (sent after signup), `alert.tsx` (sent when a delta is detected — e.g. mention rate dropped, new competitor appeared). Style should match the brand: light, single column, plain typography, one CTA button per email.

### 5. Component-level requirements

When designing components, please cover these specific shadcn/ui-compatible pieces (do not invent new variants outside shadcn norms):

- **Button** — variants: `default`, `outline`, `ghost`, `destructive`. Sizes: `default`, `sm`, `lg`, `icon`.
- **Card** — used everywhere. Header / Title / Description / Content / Footer slots.
- **Input / Textarea / Label** — standard shadcn forms. Error state via red helper text under field.
- **Badge** — small pill used for plan name, provider name, recommendation strength, status.
- **Tabs** — used in BillingSection or any settings sub-tabs.
- **Accordion** — landing FAQ.
- **Separator** — horizontal dividers in Settings, sidebar.
- **Sonner toast** — for save success/error in BrandEditor.
- **Avatar** — sidebar user block (optional, currently we just show email).

Custom domain components to design (these wrap shadcn primitives — keep them composable):
- `AppSidebar` — see 4.7.
- `MentionChart` — Recharts chart, props: `data: { date, mentionRate, totalResults, mentionedCount }[]`. Show a card around it with a small title "Mention rate over time" and the chart inside.
- `ResultsTable` — see 4.8.
- `BrandEditor` — see 4.10.
- `BillingSection` + `PlanCard` — see 4.10.
- Marketing-only: `DashboardPreview` (illustrated mock of the dashboard for the hero), `FeaturesGrid`, `HowItWorks`, `PricingCards`, `FaqAccordion`.

### 6. Hard constraints (do NOT design)

These are explicitly out of scope for MVP. Do not include UI for them — even as "coming soon":

- Competitor analysis dashboards (only competitor *names* appear in result cards).
- Content recommendations.
- CMS / CRM integrations.
- Teams, roles, permissions, SSO.
- White-label or agency multi-tenant UI.
- Slack / Telegram alerts (only email).
- Zapier integrations.
- Free tier / trial UI.
- Annual billing toggle.
- Claude / Perplexity provider toggles (roadmap, not MVP).
- Chrome extension UI (roadmap).

### 7. Deliverables expected from the design tool

For each screen listed in section 4, produce:
- Desktop layout (≥1280px wide).
- Mobile layout (≤640px wide), including a collapsed sidebar pattern (off-canvas drawer triggered by a hamburger in a top bar that appears only on mobile).
- Empty states where mentioned.
- Loading state for any async action (button "Saving...", skeleton cards on Dashboard).
- Error state (inline red helper text under inputs; toast for global failures).

The design must remain implementable with shadcn/ui + Tailwind utility classes only — no custom CSS systems, no Figma-only effects that can't be expressed in Tailwind.

## END PROMPT

---

## How to use

1. Open Claude Code Design.
2. Paste everything between the START PROMPT and END PROMPT markers above.
3. Iterate on individual screens by referencing the section numbers, e.g. "redo section 4.8 (Dashboard) with a sticky KPI row".
4. When importing the design back into this repo, keep mapping 1:1 to the existing component file paths in `/components` and `/components/marketing`.
