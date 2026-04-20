# Сессия 2026-04-20 — внутренние app-экраны + preview deploy

Третья сессия в Cowork. Сначала подняли Vercel preview, потом доработали внутренние экраны под дизайн Claude Design.

## Vercel

- CLI v51.7.0 залогинен (`yirtimd`, team `yirtimdvoknaps-projects`).
- Локальная папка слинкована с существующим проектом `chatgpt-cheap` (`.vercel/` git-ignored).
- Preview deploy: https://chatgpt-cheap-m1ajikxla-yirtimdvoknaps-projects.vercel.app (401 в curl — это стандартная Deployment Protection на preview-URL, в браузере под Vercel-аккаунтом открывается).
- Prod на https://chatgpt-cheap.vercel.app пока не обновлялся — ждём команды пользователя.
- Env vars на prod проверены: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `MAX_GLOBAL_COST_CENTS_PER_DAY` — есть. `OPENAI_API_KEY`, `STRIPE_*`, `INNGEST_*`, `RESEND_API_KEY`, `SENTRY_*`, `POSTHOG_*`, `UPSTASH_*` — отсутствуют; приложение запускается, но pipeline/billing/alerts без них не работают.

## Дизайн app-части

### Общие штуки

- `app/globals.css` — добавлены `.quote` (brand-border callout для цитат) и `.wordmark-cheap` (gradient-вариант wordmark). `mark`-highlight пока остаётся inline в query-detail — через Tailwind utilities, в централизованную CSS-утилиту не выносили, чтобы не плодить одноразовое.
- `app/layout.tsx` — подключён `<Toaster />` из `components/ui/sonner.tsx`. Без него `toast.success()` в BrandEditor молча игнорировались.

### Sidebar (`components/app-sidebar.tsx`)

- Wordmark `ChatGPT.cheap` с брендовым `.cheap` в tone с marketing-хедером.
- `{plan} plan` caption в mono-uppercase с трекингом (`font-mono text-[11px] uppercase tracking-[0.15em]`).
- Nav-ссылки `Dashboard` / `Settings` теперь с `lucide`-иконками (`LayoutDashboard`, `Settings`).
- `BRANDS` секция: mono-caption, каждый бренд с иконкой `Tag`.
- Нижний блок: отдельная карточка "Signed in / email" в `bg-muted/50`, под ней `Sign out` с иконкой `LogOut` + `ThemeToggle` справа.

### Dashboard (`app/(app)/dashboard/*`)

- Новый `loading.tsx` — shimmer-скелетоны для H1, KPI-ряда, чарта и таблицы. Next.js автоматически показывает его во время Supabase-запросов.
- `page.tsx` — добавлен empty state: карточка с `Clock`-иконкой в `bg-brand-soft` и копией "No runs yet. Your first monitoring run will appear here within 24 hours." Показывается, когда у пользователя нет ни одного run.
- KPI-карточки: caption в mono-uppercase, крупный `tracking-tight` заголовок.
- `components/mention-chart.tsx` — area-chart переведён с `hsl(var(--primary))` (чёрный) на `var(--brand)` (indigo) + gradient fill через `<linearGradient id="mentionGradient">`. Оси без `axisLine/tickLine`, тултип с `var(--popover)` фоном.

### Query detail (`app/(app)/dashboard/query/[queryId]/page.tsx`)

- Breadcrumb `Dashboard > Query detail` с `ChevronRight`.
- Заголовок 3xl tracking-tight + `brand.name · brand.domain` subline.
- Card "Prompt" с mono-caption.
- Result-карточка: ряд `Badge`-ов (provider / Mentioned / #position / sentiment / recommendation) + cost справа в mono-font. Sentiment мапится на варианты: positive → default, negative → destructive, остальное → secondary.
- "Context quote" — новая `.quote` utility (brand-border + brand-soft).
- "Full response" — `max-h-64` скролл с `border bg-muted/30` и `<mark>`-подсветкой бренда (yellow-200 / yellow-900/60).
- Competitors — теперь pill-ряд из `Badge variant="secondary"` вместо запятой-разделённой строки.

### Settings (`app/(app)/settings/page.tsx` + компоненты)

- **Account card** — 3 колонки: Email (truncate), Plan (brand badge), Usage this period (mono-font).
- **BrandEditor** (`components/brand-editor.tsx`) — объединён в одну карточку с `<Separator />` между brand-info и queries. Локальный `message`-state заменён на `sonner`-тосты. Queries имеют мини-статистику "N active / M total", кнопки Pause/Resume/Delete с lucide-иконками. Кнопка "Add" с `Plus`.
- **BillingSection** (`components/billing-section.tsx`) — обёрнут в одну Card с табами `Plans` / `Invoices`. Invoices-таб: если есть `stripe_customer_id` — карточка с Receipt-иконкой и CTA "Open customer portal"; иначе — "No invoices yet".
- **PlanCard** (`components/plan-card.tsx`) — `Current plan` badge в углу активного тира (бренд-окрашенный), рамка `border-brand`. Кнопка на другие тиры меняет лейбл между "Upgrade to X" и "Downgrade to X" в зависимости от порядка (`starter < growth < pro`); downgrade через `variant="outline"`, upgrade через default. Features теперь с `Check`-иконкой вместо плюсика.

## Верификация

- `pnpm exec biome check .` → **Checked 97 files in 30ms. No fixes applied.**
- `tsc --noEmit` → **exit 0**.
- Dev smoke на живом браузере не прогоняли — оставили пользователю.

## Файлы

**Созданы:**
- `app/(app)/dashboard/loading.tsx`
- `docs/sessions/2026-04-20-app-screens.md` (этот файл)

**Изменены:**
- `app/globals.css` (`.quote`, `.wordmark-cheap`)
- `app/layout.tsx` (подключён `<Toaster />`)
- `app/(app)/dashboard/page.tsx` (empty state, mono-captions)
- `app/(app)/dashboard/query/[queryId]/page.tsx` (breadcrumb, Badge-ряд, `.quote`, competitor pills)
- `app/(app)/settings/page.tsx` (3-col Account)
- `components/app-sidebar.tsx` (wordmark, иконки, email-callout)
- `components/brand-editor.tsx` (unified, sonner, icon actions)
- `components/billing-section.tsx` (Plans/Invoices tabs)
- `components/plan-card.tsx` (Current-plan badge, upgrade/downgrade)
- `components/mention-chart.tsx` (brand gradient)

Marketing-файлы (`app/(marketing)/blog/page.tsx`, `app/(marketing)/layout.tsx`, `app/(marketing)/page.tsx`, `components/marketing/dashboard-preview.tsx`) тоже попали в коммит — только переформатирование biome (перенос строк), ничего семантического.

## Что осталось

- **Мобильные вариации.** Drawer-сайдбар и мобильные dashboard-карточки из `App · Mobile` в дизайне пока не делали. Сейчас сайдбар 256px жёстко; на мобильных рендерится как есть.
- **Results table** — функционально ок, визуально не переделывали. Если хочется полной пиксель-точности, табличные стили `.table` из дизайна можно портировать отдельной итерацией.
- **Prod deploy.** Preview задеплоен и стоит на паузе; когда подтвердишь визуал — `vercel deploy --prod` из `/Users/nomads_dm/Desktop/chatgpt-cheap`.

## Контекст для следующей сессии

Ветка: `feat/app-screens`. Базируется на `main` (`7fc5672`). Все изменения — сверху design-import, не ломают маркетинг.

Если дальше идём в mobile-вариации — лучше **той же веткой**. Если другая задача — смерджить в main и с чистого листа.
