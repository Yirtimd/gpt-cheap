# Сессия 2026-04-20 — импорт дизайна из Claude Design и переключатель темы

Вторая сессия в Cowork. Занимались визуалкой: импорт дизайн-системы из Claude Design в код, добавление переключателя светлой/тёмной темы.

## Что сделано

### Дизайн-система (глобально)

- `app/layout.tsx` — шрифты переключены с Geist на **Inter + JetBrains Mono** (Google Fonts, next/font).
- `app/globals.css` — добавлены брендовые утилиты: `.pill-brand`, `.brand-gradient`, `.dot-grid`, `.hero-glow`, `.h1-hero`, `.h2-section`, `.lead-text`, `.eyebrow`. В `.dark` прописаны `--brand`, `--brand-foreground`, `--brand-soft` под indigo-акцент, чтобы брендовые цвета корректно работали в тёмной теме.

### Marketing-часть (публичный сайт)

- `app/(marketing)/layout.tsx` — header/footer переписаны под дизайн: wordmark `ChatGPT.cheap` с брендовой подсветкой `.cheap`, компактная навигация, 4-колоночный footer.
- `app/(marketing)/page.tsx` — лендинг целиком: pill в hero, градиентный H1, DashboardPreview под ним, **новая StatsBand секция** (79% / 2¢ / 2 / ~14m), центрированные «Features / How it works / Pricing / FAQ» с eyebrow-подписями, закруглённый gradient CTA-блок.
- `components/marketing/features-grid.tsx` — 6 фич из дизайна (Calendar / Bot / Target / Users / Link / Bell).
- `components/marketing/how-it-works.tsx` — 3 шага с крупным брендовым numbered badge.
- `components/marketing/pricing-cards.tsx` — «Most popular» как `.pill-brand` с Sparkles, приподнятая карточка Growth.
- `components/marketing/dashboard-preview.tsx` — браузерный chrome + KPI-карточки + mini-chart в стиле дизайна.
- `components/marketing/faq-accordion.tsx` — FAQ-контент из дизайн-брифа.
- `components/marketing/stats-band.tsx` — **новый компонент**.
- `app/(marketing)/blog/page.tsx` — заголовок и лента постов по стилю дизайна.

### Auth / Onboarding

- `app/(auth)/login/page.tsx` — wordmark, hero-glow фон, brand-CTA, состояния idle / loading / success / error с иконкой `Mail` в brand-soft.
- `app/(app)/onboarding/page.tsx` — прогресс-бар с брендовым цветом, mono-label `Step N of 3`, summary-блок на шаге 3, брендовые CTA.

### Переключатель темы

- `components/theme-provider.tsx` — обёртка над `next-themes` с настройками: только `light` / `dark` (без system), дефолт `light`, `disableTransitionOnChange`.
- `components/theme-toggle.tsx` — iconbutton Sun/Moon на **нативном `<button>`** (не shadcn Button — базовый `@base-ui/react/button` в этой версии перехватывал `onClick` и тема не переключалась).
- Подключён в root layout + marketing header + app sidebar. На `/login` и `/onboarding` тоггла нет — они не используют ни marketing-layout, ни sidebar.
- Добавлен `suppressHydrationWarning` на `<html>` для next-themes.

### Импорт артефакта дизайна

- Дизайн-бандл распакован во временную папку `/sessions/sweet-eager-goodall/design-import/`. В репо **не попадает** — это сырой прототип HTML/CSS/JS из Claude Design, мы пересобрали его под Next.js / Tailwind v4 / shadcn/ui.

## Верификация

- `tsc --noEmit` → **exit 0** на всех этапах.
- `pnpm dev` у пользователя поднялся, визуально всё отработало. Переключатель темы работает после фикса на нативный `<button>`.

## Файлы

**Изменены** (14): `app/layout.tsx`, `app/globals.css`, `app/(marketing)/layout.tsx`, `app/(marketing)/page.tsx`, `app/(marketing)/blog/page.tsx`, `app/(auth)/login/page.tsx`, `app/(app)/onboarding/page.tsx`, `components/app-sidebar.tsx`, `components/marketing/features-grid.tsx`, `components/marketing/how-it-works.tsx`, `components/marketing/pricing-cards.tsx`, `components/marketing/dashboard-preview.tsx`, `components/marketing/faq-accordion.tsx`.

**Созданы** (4): `components/marketing/stats-band.tsx`, `components/theme-provider.tsx`, `components/theme-toggle.tsx`, `docs/sessions/2026-04-20-design-import.md` (этот файл).

## На что обратить внимание в следующих сессиях

### 1. Точечное выравнивание под макет — внутренняя часть сайта (приоритет)

Внутренние экраны (`app/(app)/...`) обновлены только на уровне дизайн-токенов (шрифт, цвета). Пиксельное выравнивание под макет из Claude Design ещё не сделано. Что нужно:

- **Sidebar (`components/app-sidebar.tsx`)** — переделать под дизайн: wordmark в шапке, `STARTER PLAN` caption в mono-стиле, `BRANDS` секция с иконкой + именем бренда, отдельная выноска email внизу перед Sign out.
- **Dashboard (`app/(app)/dashboard/page.tsx`)** — три варианта из дизайна: `populated` (KPI grid + MentionChart + ResultsTable), `empty` (карточка с Clock-иконкой «No runs yet»), `loading` (скелетоны). Сейчас, скорее всего, только populated, и визуально не совпадает.
- **Query Detail (`app/(app)/dashboard/query/[queryId]/page.tsx`)** — breadcrumb, Prompt-карточка, per-provider карточки с badge-рядом (provider / Mentioned / #position / sentiment), quote-блок (`.quote` utility в globals.css нужно будет ещё перенести — сейчас не портирован), full response со скроллом, competitors и citations.
- **Settings (`app/(app)/settings/page.tsx`)** — Account-карточка с 3 колонками, BrandEditor с queries list и pause/delete actions, BillingSection с табами Plans/Invoices, «Current plan» бейдж на текущем тире.

### 2. Доделать app-экраны — мобильные вариации

В дизайне есть отдельная группа `App · Mobile`:

- **Mobile dashboard** — topbar с hamburger + title, вертикальные KPI, мини-чарт, компактные карточки результатов.
- **Mobile drawer** — off-canvas сайдбар с overlay, навигация + brands + sign out.

Сейчас на мобильных разрешениях наш dashboard просто сжимается сеткой. Нужно решить: делать отдельный `<Drawer>` компонент или менять layout через responsive Tailwind.

### 3. Мелочи, которые заметились по ходу

- **`.quote` utility** из дизайна (`border-left: 3px solid brand; padding; background: brand-soft`) не портирован в `globals.css`. Понадобится для Query Detail.
- **`mark` highlight** из дизайна (жёлтый на light, тёмно-жёлтый на dark) тоже не портирован. Нужен для подсветки упоминаний бренда в raw response.
- **Табличные стили** (`.table` в дизайне) — в проекте нет единого стиля таблицы; когда будем делать Results Table, либо портируем утилиту, либо используем shadcn Table.
- **Onboarding при авторизации** — сейчас редиректит в Supabase. На нём тоже хочется тоггл темы, но layout он не делит с marketing/app. Решение — либо добавить кнопку прямо в сам компонент login/onboarding, либо вынести `ThemeToggle` в отдельный плавающий bottom-right tab-bar (как в дизайне TweaksPanel, но без accent-свитчера).

## Контекст для следующей сессии

Ветка: **`feat/design-import`**. Коммит: `Apply Claude Design system to marketing, auth, and onboarding`.

Если следующая задача — доделать app-экраны (пункты 1–2 выше), лучше начать в **той же ветке**: дизайн ещё не смёржен в main, и все изменения можно ревьюить одним PR. Если задача другая — смерджить эту ветку и начать с чистого `main`.

Дизайн-бриф и сырой бандл Claude Design в репо не лежат. При необходимости можно повторно заpfetchить: `https://api.anthropic.com/v1/design/h/qPiCcaVvmTHUovt2bFi-8Q?open_file=index.html` — это tar-gzipped архив.
