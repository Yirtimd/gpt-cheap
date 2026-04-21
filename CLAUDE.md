# ChatGPT.cheap

AEO-мониторинг для SMB за $9/мес. Отслеживает упоминания бренда в ответах ChatGPT и Gemini.

---

## Контекст и продуктовые решения

### ICP
Фрилансеры, соло-фаундеры, малый бизнес, блогеры с personal brand, мини-агентства. Сегмент, который Profound/Peec/AthenaHQ не обслуживают из-за неэкономичности.

### Ключевые решения (зафиксированы)

| Решение | Выбор | Причина |
|---|---|---|
| LLM mode | **web-search везде** (не knowledge) | ICP — новые бренды, их нет в training data до следующего ретрейна |
| Провайдеры в MVP | **OpenAI + Gemini** | 2 провайдера покрывают 80%+ рынка; Claude и Perplexity добавляются после launch |
| Free tier | **нет** | Защита бюджета до первого revenue |
| Billing | **только месячный** | Annual добавляем на месяце 3+ после замера churn |
| Judge-парсинг | **отдельный LLM-вызов** (gemini-2.5-flash structured output) | Надёжнее regex. Gemini Flash дешевле gpt-4o-mini на сопоставимом качестве и быстрее отвечает. |
| Volatility | **replication ×N** в зависимости от тира | Majority vote по `mentioned` снижает шум |
| Run triggering | **единая функция** `triggerBrandRun(source)` с 3 источниками: `cron` / `onboarding` / `manual` | Одна точка входа в pipeline упрощает rate-limit и аналитику |
| First-run UX | **авто-триггер после онбординга** + «Run now» кнопка на dashboard | Нельзя показывать новому юзеру пустой дашборд. Manual rate-limit 24ч, cap-aware. |
| Cap-skipped runs | **сохраняем placeholder-строку** в `results` с маркером `[SKIPPED: ...]` | Без неё count не достигает expectedTotal → run залипает в `running` |

### Pricing (зафиксирован)

| Tier | $/мес | Queries | Providers | Freq | Replication |
|---|---|---|---|---|---|
| Starter | $9 | 5 | OpenAI + Gemini | weekly | 1× |
| Growth | $19 | 15 | OpenAI + Gemini | daily | 2× |
| Pro | $29 | 30 (3 brands) | OpenAI + Gemini | daily | 3× |

### Unit economics (Starter, target)

```
Revenue:           $9.00
Stripe fee:       -$0.56
LLM (80 calls):   -$0.64  # gpt-4o-mini + Gemini Flash, web_search on
Judge parsing:    -$0.04
Hosting:          -$0.10
Email:            -$0.01
─────────────────────────
Net margin:        $7.65  ≈ 85%
```

Любые изменения в pipeline сверяй с этой таблицей. Если маржа падает ниже 70% на Starter — блокер.

---

## Tech stack

| Слой | Выбор | Версия |
|---|---|---|
| Runtime | Next.js App Router | 15.x |
| DB + Auth | Supabase (Postgres + Auth + RLS) | latest |
| Scheduler / Queue | Inngest | latest |
| LLM: OpenAI | Responses API + `web_search` tool | gpt-4o-mini |
| LLM: Gemini | GenAI SDK + Google Search grounding | gemini-2.5-flash |
| Payments | Stripe Checkout + Customer Portal | latest |
| Email | Resend + React Email | latest |
| Errors | Sentry | free tier |
| Analytics | PostHog | free tier |
| UI | Tailwind + shadcn/ui | latest |
| Hosting | Vercel (app) + Supabase (db) | - |
| Lang | TypeScript strict | - |

---

## Модель данных

```sql
-- auth.users — из Supabase Auth

profiles
  id (uuid, pk, ref auth.users)
  plan (enum: starter, growth, pro)
  stripe_customer_id
  monthly_cost_cents_used   -- для daily cap
  billing_period_start
  created_at

brands
  id, user_id, name, domain, description
  created_at

queries
  id, brand_id, prompt_text, is_active
  created_at

runs
  id, brand_id, scheduled_at, completed_at
  status (enum: pending, running, done, failed)
  triggered_by (enum: cron, onboarding, manual)
  total_cost_cents
  created_at

results
  id, run_id, query_id
  provider (enum: openai, gemini)
  replication_index (int)           -- 0..N-1
  raw_response (text)
  mentioned (bool)
  position (int, nullable)
  sentiment (enum: positive, neutral, negative, nullable)
  recommendation_strength (enum)
  context_quote (text)
  citations (jsonb)
  competitors_mentioned (jsonb)
  cost_cents (int)
  created_at

alerts
  id, user_id, type, payload (jsonb)
  dedupe_key (unique per user)
  sent_at
  created_at
```

**RLS обязательна на всех таблицах с user_id с первого миграционного файла.**

---

## Архитектура pipeline

```
[Inngest cron]        weekly (Starter, Mon 09:00 UTC)
                       daily  (Growth, Pro, 09:00 UTC)
[Onboarding finish]   → POST /api/runs/trigger  (источник определяется автоматически)
[Run now кнопка]      → POST /api/runs/trigger  (rate-limit 24h, 409 если активный run)
        │
        └─► triggerBrandRun({brandId, userId, source})
              └─► inngest.send('run/brand.scheduled')
                    └─► createRun(triggered_by=source)
                          └─► fan-out: query × provider × replication
                                └─► [check user + global cost cap]
                                      ├─► если cap hit → save_skipped_result()
                                      └─► LLM call (retry, timeout)
                                            └─► judgeMention()          -- отдельный LLM-judge (gemini-2.5-flash)
                                                  └─► saveResult()
                                └─► if count >= expectedTotal:
                                      └─► aggregateRun()                -- majority vote
                                            └─► detectDelta()           -- сравнение с прошлым run
                                                  └─► notifyIfChanged() -- Resend email, dedupe per day
```

### Источники запуска

| Источник | Кто инициирует | Rate-limit | Когда |
|---|---|---|---|
| `cron` | Inngest cron | — | weekly/daily по тарифу |
| `onboarding` | `/api/runs/trigger` при `userHasAnyRun === false` | — | сразу после финиша wizard'а |
| `manual` | `/api/runs/trigger` при наличии прошлых runs | **1 раз в 24ч** per user; 409 при активном run | юзер жмёт Run now |

### Provider adapter (обязательный интерфейс)

```ts
interface LLMProvider {
  name: 'openai' | 'gemini'
  query(prompt: string): Promise<{
    text: string
    citations: Citation[]
    costCents: number
    rawResponse: unknown
  }>
}
```

Провайдер-специфичная логика не должна утекать за пределы `lib/providers/`.

### Judge (парсер упоминаний)

Вход: `{ brandName, brandDomain, rawResponse }`.
Выход (structured):
```ts
{
  mentioned: boolean
  position: number | null
  sentiment: 'positive' | 'neutral' | 'negative' | null
  recommendation_strength: 'recommended' | 'mentioned' | 'dismissed'
  context_quote: string
  competitors_mentioned: string[]
  cited_domains: string[]
}
```

Модель: `gpt-4o-mini` с JSON schema. Температура 0.

---

## Структура репо

```
/app
  /(marketing)/           landing, pricing, blog (SEO)
  /(app)/dashboard        авторизованная зона
  /api/webhooks/stripe
  /api/inngest            handler
/lib
  /providers              openai.ts, gemini.ts, index.ts (registry)
  /parsing                mention-judge.ts
  /pipeline               run.ts, aggregate.ts, delta.ts, notify.ts
  /cost                   cap.ts (проверка и инкремент)
  /db                     schema.ts, queries.ts, types.ts
/inngest                  cron.ts, workflows.ts
/emails                   alert.tsx, welcome.tsx
/supabase/migrations      SQL с RLS
```

Один Next.js-монорепо. Никаких микросервисов.

---

## План разработки — 3 недели

### Неделя 1 — Pipeline (без UI)

**День 1–2**
- [ ] `pnpm create next-app` + TypeScript strict
- [ ] Supabase проект + первая миграция: все таблицы + RLS
- [ ] Базовая конфигурация: env, typed DB client, biome/eslint
- [ ] Inngest dev server

**День 3–4**
- [ ] `lib/providers/openai.ts` — Responses API с `web_search` tool
- [ ] `lib/providers/gemini.ts` — Google Search grounding
- [ ] Unit-тесты адаптеров на реальный API (~$0.05 бюджет)
- [ ] `lib/cost/cap.ts` — проверка/инкремент `monthly_cost_cents_used`

**День 5–7**
- [ ] `lib/parsing/mention-judge.ts` — structured output
- [ ] Inngest workflow: `createRun → fanOut → queryProvider → judge → saveResult → aggregate`
- [ ] Ручной smoke-test: 1 бренд, 5 queries, 2 провайдера, проверка e2e
- [ ] Cost-reporting: убедиться что реальная стоимость ≤ $0.009/run на Starter

**Критерий готовности недели 1:** можно запустить run для тестового бренда одной командой, результаты сохраняются в БД корректно, cost cap работает.

### Неделя 2 — Product shell

**День 8–9**
- [ ] Supabase Auth (magic link) + RLS-политики сквозные
- [ ] Onboarding wizard (3 шага): brand info → 5 queries → checkout
- [ ] Layout: sidebar + главная зона, shadcn/ui

**День 10–11**
- [ ] Stripe Checkout integration (Starter/Growth/Pro)
- [ ] Webhook: `checkout.completed` → `profiles.plan`, `subscription.deleted` → downgrade
- [ ] Customer Portal link в settings

**День 12–14**
- [ ] Dashboard: график упоминаний (Recharts), таблица последних results
- [ ] Страница query — raw ответы провайдеров с подсветкой упоминаний
- [ ] Settings: brand, queries edit, billing
- [ ] Resend: alert template (React Email), delta detection triggers

**Критерий готовности недели 2:** новый пользователь может пройти signup → checkout → onboarding → увидеть первый run в dashboard без вмешательства.

### Неделя 3 — Launch readiness

**День 15–17**
- [ ] Landing (one-scroll): hero, проблема, демо-скрин, pricing, FAQ, CTA
- [ ] SEO: meta, OG, sitemap, robots, JSON-LD
- [ ] Shell для блога (MDX) — 1 post на launch

**День 18–19**
- [ ] Sentry wiring (client + server + Inngest)
- [ ] PostHog (signup funnel events)
- [ ] Rate limit на signup (Upstash)
- [ ] Global cost cap (kill switch если monthly spend > $N)

**День 20–21**
- [ ] Legal: privacy policy, terms, refund policy
- [ ] 10 ручных онбордингов через X/Reddit
- [ ] Product Hunt assets (gallery, tagline, first comment)
- [ ] Final smoke-test full funnel на prod

---

## Правила разработки

### Принципы
1. **Minimalism first.** Отрезанная фича = ниже цена. Перед любым PR спросить: "это нужно для $9-клиента или это overengineering?"
2. **Solo-maintainable.** Если компонент нельзя дебагить в 3 ночи без внешней помощи — не внедряем.
3. **Cost awareness.** Каждый LLM-вызов проходит через `cost/cap.ts`. Нет исключений.
4. **Reversible actions.** Deploy через Vercel preview → prod. Никаких прямых правок в prod БД.

### Код
- TypeScript strict, `any` запрещён (используй `unknown` + narrowing)
- Server Components по умолчанию; `"use client"` только когда нужна интерактивность
- Никаких комментариев, объясняющих *что* делает код. Только *почему*, если неочевидно
- shadcn/ui компоненты, без своей дизайн-системы
- Zod для валидации всех боундари (API, webhooks, env)
- Никаких классов где хватит функций
- Провайдер-специфичная логика не утекает из `lib/providers/`

### Безопасность
- RLS на каждой таблице с `user_id` — миграция без RLS не мержится
- Stripe webhook: проверка подписи обязательна
- Все env через `lib/env.ts` с Zod — crash at boot если что-то отсутствует
- `SUPABASE_SERVICE_ROLE_KEY` только в server-side коде, никогда в client bundle

### База данных
- Все миграции в `/supabase/migrations`, именование `NNNN_description.sql`
- Никаких ручных изменений через Supabase Studio в prod
- Индексы на `(user_id, created_at)` и `(brand_id, created_at)` для частых выборок
- `idempotency_key` на вставках в `results` — безопасные retry

### Cost controls
- Default LLM: `gpt-4o-mini` и `gemini-2.5-flash`. Премиум-модели запрещены на Starter
- Daily cap per user: `monthly_cost_cents_used + predicted_cost > plan.limit` → abort + email
- Global cap в env (`MAX_GLOBAL_COST_CENTS_PER_DAY`), при превышении Inngest приостанавливает cron
- Прогнозная стоимость рассчитывается до вызова, не после

### Коммуникация
- Общение и документация на русском
- Код, идентификаторы, commits, PR-description — на английском
- Не добавляй emoji в файлы без явной просьбы

---

## Открытые вопросы (решить по ходу)

- [ ] Web ChatGPT vs API discrepancy — как коммуницировать клиенту на landing
- [ ] Параметры промпта для judge — откалибровать на 20 ручных примерах после недели 1
- [ ] Annual billing discount (planning month 3+)
- [ ] Claude + Perplexity как providers (roadmap month 2)
- [ ] Chrome extension (roadmap month 4+)

---

## Что НЕ входит в MVP

- Конкурентный анализ
- Рекомендации по контенту
- CMS/CRM интеграции
- Команды, роли, permissions
- White-label, API для агентств
- Slack/Telegram алерты (только email)
- Zapier

Добавление любого пункта = явное изменение scope и обновление unit economics.
