import "server-only";
import type { Provider } from "@/lib/db/types";
import { env } from "@/lib/env";
import { captureServerEvent } from "@/lib/posthog-server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PLANS, predictCostCents } from "./plans";

export type CapCheckResult =
  | { ok: true; remainingCents: number }
  | {
      ok: false;
      reason: "user_not_found" | "monthly_cap_reached" | "global_cap_reached";
      usedCents?: number;
      capCents?: number;
    };

export async function checkGlobalCap(): Promise<
  { ok: true } | { ok: false; spentCents: number; capCents: number }
> {
  const capCents = env.MAX_GLOBAL_COST_CENTS_PER_DAY;
  const supabase = createSupabaseAdminClient();

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("results")
    .select("cost_cents")
    .gte("created_at", since.toISOString());

  if (error) {
    throw new Error(`checkGlobalCap: ${error.message}`);
  }

  const spentCents = (data ?? []).reduce((sum, r) => sum + r.cost_cents, 0);

  if (spentCents >= capCents) {
    return { ok: false, spentCents, capCents };
  }

  return { ok: true };
}

export async function checkUserCap(params: {
  userId: string;
  provider: Provider;
}): Promise<CapCheckResult> {
  const { userId, provider } = params;

  const global = await checkGlobalCap();
  if (!global.ok) {
    await captureServerEvent({
      distinctId: userId,
      event: "global_cap_reached",
      properties: { spentCents: global.spentCents, capCents: global.capCents },
    });
    return {
      ok: false,
      reason: "global_cap_reached",
      usedCents: global.spentCents,
      capCents: global.capCents,
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan, monthly_cost_cents_used")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(`checkUserCap: failed to fetch profile: ${error.message}`);
  if (!profile) return { ok: false, reason: "user_not_found" };

  const plan = PLANS[profile.plan];
  const predicted = predictCostCents(provider);
  const projected = profile.monthly_cost_cents_used + predicted;

  if (projected > plan.monthlyCostCapCents) {
    await captureServerEvent({
      distinctId: userId,
      event: "cost_cap_reached",
      properties: {
        plan: profile.plan,
        usedCents: profile.monthly_cost_cents_used,
        capCents: plan.monthlyCostCapCents,
      },
    });
    return {
      ok: false,
      reason: "monthly_cap_reached",
      usedCents: profile.monthly_cost_cents_used,
      capCents: plan.monthlyCostCapCents,
    };
  }

  return { ok: true, remainingCents: plan.monthlyCostCapCents - projected };
}

export async function incrementUserCost(params: {
  userId: string;
  costCents: number;
}): Promise<void> {
  const { userId, costCents } = params;
  if (costCents <= 0) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc("increment_monthly_cost", {
    p_user_id: userId,
    p_delta_cents: costCents,
  });

  if (error) throw new Error(`incrementUserCost: ${error.message}`);
}
