-- Tracks why a run was created so we can enforce manual rate-limits,
-- attribute cost to cron vs onboarding vs user actions, and audit.

create type run_trigger_source as enum ('cron', 'onboarding', 'manual');

alter table runs
  add column triggered_by run_trigger_source not null default 'cron';

-- Partial index powers the "last manual run per user" lookup used for the
-- 24h rate-limit on the Run-now button.
create index runs_manual_lookup_idx
  on runs (brand_id, created_at desc)
  where triggered_by = 'manual';

-- Active-run lookup: one run per brand may be in flight (pending or running).
-- Button is disabled while such a run exists.
create index runs_active_status_idx
  on runs (brand_id)
  where status in ('pending', 'running');
