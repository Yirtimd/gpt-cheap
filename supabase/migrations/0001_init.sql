-- Extensions
create extension if not exists "pgcrypto";

-- ==========================================================================
-- Enums
-- ==========================================================================

create type plan_tier as enum ('starter', 'growth', 'pro');
create type run_status as enum ('pending', 'running', 'done', 'failed');
create type llm_provider as enum ('openai', 'gemini');
create type sentiment as enum ('positive', 'neutral', 'negative');
create type recommendation_strength as enum ('recommended', 'mentioned', 'dismissed');

-- ==========================================================================
-- profiles
-- Auto-created on new auth.users via trigger below.
-- ==========================================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan plan_tier not null default 'starter',
  stripe_customer_id text unique,
  monthly_cost_cents_used integer not null default 0 check (monthly_cost_cents_used >= 0),
  billing_period_start timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index profiles_stripe_customer_id_idx on profiles (stripe_customer_id)
  where stripe_customer_id is not null;

-- ==========================================================================
-- brands
-- ==========================================================================

create table brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(name) between 1 and 200),
  domain text check (length(domain) <= 255),
  description text check (length(description) <= 2000),
  created_at timestamptz not null default now()
);

create index brands_user_created_idx on brands (user_id, created_at desc);

-- ==========================================================================
-- queries
-- ==========================================================================

create table queries (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands (id) on delete cascade,
  prompt_text text not null check (length(prompt_text) between 1 and 2000),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index queries_brand_idx on queries (brand_id, created_at desc);
create index queries_brand_active_idx on queries (brand_id) where is_active;

-- ==========================================================================
-- runs
-- ==========================================================================

create table runs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands (id) on delete cascade,
  scheduled_at timestamptz not null default now(),
  completed_at timestamptz,
  status run_status not null default 'pending',
  total_cost_cents integer not null default 0 check (total_cost_cents >= 0),
  created_at timestamptz not null default now()
);

create index runs_brand_created_idx on runs (brand_id, created_at desc);
create index runs_status_idx on runs (status) where status in ('pending', 'running');

-- ==========================================================================
-- results
-- idempotency_key = sha256(run_id || query_id || provider || replication_index)
-- ==========================================================================

create table results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs (id) on delete cascade,
  query_id uuid not null references queries (id) on delete cascade,
  provider llm_provider not null,
  replication_index integer not null check (replication_index >= 0),
  raw_response text not null,
  mentioned boolean not null,
  position integer check (position is null or position >= 1),
  sentiment sentiment,
  recommendation_strength recommendation_strength,
  context_quote text,
  citations jsonb not null default '[]'::jsonb,
  competitors_mentioned jsonb not null default '[]'::jsonb,
  cost_cents integer not null default 0 check (cost_cents >= 0),
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create index results_run_idx on results (run_id, created_at desc);
create index results_query_idx on results (query_id, created_at desc);

-- ==========================================================================
-- alerts
-- ==========================================================================

create table alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (length(type) between 1 and 100),
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create index alerts_user_created_idx on alerts (user_id, created_at desc);

-- ==========================================================================
-- Auto-provision profile on signup
-- ==========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================================================
-- Row Level Security
-- ==========================================================================

alter table profiles enable row level security;
alter table brands enable row level security;
alter table queries enable row level security;
alter table runs enable row level security;
alter table results enable row level security;
alter table alerts enable row level security;

-- profiles: user reads/updates only own row. Inserts go through trigger.
create policy "profiles_select_self"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_update_self"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- brands: CRUD only own rows
create policy "brands_select_own"
  on brands for select
  using (auth.uid() = user_id);

create policy "brands_insert_own"
  on brands for insert
  with check (auth.uid() = user_id);

create policy "brands_update_own"
  on brands for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "brands_delete_own"
  on brands for delete
  using (auth.uid() = user_id);

-- queries: access through brand ownership
create policy "queries_select_own"
  on queries for select
  using (
    exists (select 1 from brands b where b.id = queries.brand_id and b.user_id = auth.uid())
  );

create policy "queries_insert_own"
  on queries for insert
  with check (
    exists (select 1 from brands b where b.id = queries.brand_id and b.user_id = auth.uid())
  );

create policy "queries_update_own"
  on queries for update
  using (
    exists (select 1 from brands b where b.id = queries.brand_id and b.user_id = auth.uid())
  )
  with check (
    exists (select 1 from brands b where b.id = queries.brand_id and b.user_id = auth.uid())
  );

create policy "queries_delete_own"
  on queries for delete
  using (
    exists (select 1 from brands b where b.id = queries.brand_id and b.user_id = auth.uid())
  );

-- runs: read-only for users, writes via service role
create policy "runs_select_own"
  on runs for select
  using (
    exists (select 1 from brands b where b.id = runs.brand_id and b.user_id = auth.uid())
  );

-- results: read-only for users, writes via service role
create policy "results_select_own"
  on results for select
  using (
    exists (
      select 1 from runs r
      join brands b on b.id = r.brand_id
      where r.id = results.run_id and b.user_id = auth.uid()
    )
  );

-- alerts: read-only for users, writes via service role
create policy "alerts_select_own"
  on alerts for select
  using (auth.uid() = user_id);
