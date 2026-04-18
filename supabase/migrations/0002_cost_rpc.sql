-- Atomic increment of monthly_cost_cents_used.
-- Runs with service_role bypassing RLS; callable via supabase.rpc().
-- Billing period rollover is handled separately in the Stripe webhook flow.

create or replace function public.increment_monthly_cost(
  p_user_id uuid,
  p_delta_cents integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_delta_cents <= 0 then
    return;
  end if;

  update profiles
    set monthly_cost_cents_used = monthly_cost_cents_used + p_delta_cents
    where id = p_user_id;
end;
$$;

revoke all on function public.increment_monthly_cost(uuid, integer) from public;
revoke all on function public.increment_monthly_cost(uuid, integer) from anon, authenticated;
grant execute on function public.increment_monthly_cost(uuid, integer) to service_role;
