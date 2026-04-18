import "server-only";
import type { Provider } from "@/lib/db/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PLANS, predictCostCents } from "./plans";

export type CapCheckResult =
  | { ok: true; remainingCents: number }
  | {
      ok: false;
      reason: "user_not_found" | "monthly_cap_reached";
      usedCents?: number;
      capCents?: number;
    };

export async function checkUserCap(params: {
  userId: string;
  provider: Provider;
}): Promise<CapCheckResult> {
  const { userId, provider } = params;
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
