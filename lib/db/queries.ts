import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Plan, RunStatus, RunTriggerSource } from "./types";

type AdminClient = SupabaseClient<Database>;

export async function createRun(
  db: AdminClient,
  brandId: string,
  triggeredBy: RunTriggerSource = "cron",
) {
  const { data, error } = await db
    .from("runs")
    .insert({ brand_id: brandId, status: "pending" as RunStatus, triggered_by: triggeredBy })
    .select("id")
    .single();
  if (error) throw new Error(`createRun: ${error.message}`);
  return data;
}

export async function updateRunStatus(
  db: AdminClient,
  runId: string,
  status: RunStatus,
  totalCostCents?: number,
) {
  const update: Database["public"]["Tables"]["runs"]["Update"] = { status };
  if (status === "done" || status === "failed") {
    update.completed_at = new Date().toISOString();
  }
  if (totalCostCents !== undefined) {
    update.total_cost_cents = totalCostCents;
  }
  const { error } = await db.from("runs").update(update).eq("id", runId);
  if (error) throw new Error(`updateRunStatus: ${error.message}`);
}

export async function getActiveQueries(db: AdminClient, brandId: string) {
  const { data, error } = await db
    .from("queries")
    .select("id, prompt_text")
    .eq("brand_id", brandId)
    .eq("is_active", true);
  if (error) throw new Error(`getActiveQueries: ${error.message}`);
  return data;
}

export async function getBrandWithUser(db: AdminClient, brandId: string) {
  const { data, error } = await db
    .from("brands")
    .select("id, user_id, name, domain")
    .eq("id", brandId)
    .single();
  if (error) throw new Error(`getBrandWithUser: ${error.message}`);
  return data;
}

export async function getUserPlan(db: AdminClient, userId: string) {
  const { data, error } = await db
    .from("profiles")
    .select("plan, monthly_cost_cents_used")
    .eq("id", userId)
    .single();
  if (error) throw new Error(`getUserPlan: ${error.message}`);
  return data;
}

export async function insertResult(
  db: AdminClient,
  result: Database["public"]["Tables"]["results"]["Insert"],
) {
  const { error } = await db.from("results").upsert(result, { onConflict: "idempotency_key" });
  if (error) throw new Error(`insertResult: ${error.message}`);
}

export async function getRunResults(db: AdminClient, runId: string) {
  const { data, error } = await db
    .from("results")
    .select("mentioned, provider, replication_index, cost_cents")
    .eq("run_id", runId);
  if (error) throw new Error(`getRunResults: ${error.message}`);
  return data;
}

export async function countRunResults(db: AdminClient, runId: string) {
  const { count, error } = await db
    .from("results")
    .select("id", { count: "exact", head: true })
    .eq("run_id", runId);
  if (error) throw new Error(`countRunResults: ${error.message}`);
  return count ?? 0;
}

export async function getLatestCompletedRun(
  db: AdminClient,
  brandId: string,
  excludeRunId: string,
) {
  const { data, error } = await db
    .from("runs")
    .select("id")
    .eq("brand_id", brandId)
    .eq("status", "done" as RunStatus)
    .neq("id", excludeRunId)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLatestCompletedRun: ${error.message}`);
  return data;
}

// Cron helpers ---------------------------------------------------------------

// Returns (userId, brandId) pairs for every active brand whose owner is on
// one of the given plans. Service-role client only — bypasses RLS.
export async function getBrandsForPlans(db: AdminClient, plans: Plan[]) {
  const { data: profiles, error: pErr } = await db
    .from("profiles")
    .select("id")
    .in("plan", plans);
  if (pErr) throw new Error(`getBrandsForPlans: ${pErr.message}`);
  if (!profiles || profiles.length === 0) return [];

  const userIds = profiles.map((p) => p.id);
  const { data: brands, error: bErr } = await db
    .from("brands")
    .select("id, user_id")
    .in("user_id", userIds);
  if (bErr) throw new Error(`getBrandsForPlans: ${bErr.message}`);

  return (brands ?? []).map((b) => ({ brandId: b.id, userId: b.user_id }));
}

// Manual-trigger helpers -----------------------------------------------------

// Most recent manual run across every brand owned by this user.
// Used to enforce the 24h cooldown on the Run-now button.
export async function getLastManualRunForUser(db: AdminClient, userId: string) {
  const { data: brands, error: bErr } = await db
    .from("brands")
    .select("id")
    .eq("user_id", userId);
  if (bErr) throw new Error(`getLastManualRunForUser: ${bErr.message}`);
  if (!brands || brands.length === 0) return null;

  const { data, error } = await db
    .from("runs")
    .select("created_at")
    .in(
      "brand_id",
      brands.map((b) => b.id),
    )
    .eq("triggered_by", "manual" as RunTriggerSource)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLastManualRunForUser: ${error.message}`);
  return data;
}

// A run is "active" if it is pending or running. While any brand has one,
// the manual button stays disabled to avoid double-spend.
export async function getActiveRunForBrand(db: AdminClient, brandId: string) {
  const { data, error } = await db
    .from("runs")
    .select("id, status, created_at")
    .eq("brand_id", brandId)
    .in("status", ["pending", "running"] as RunStatus[])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getActiveRunForBrand: ${error.message}`);
  return data;
}

// Existence check used by onboarding to decide whether to skip rate-limit.
// If the user has zero runs ever, the first trigger is the onboarding run.
export async function userHasAnyRun(db: AdminClient, userId: string) {
  const { data: brands, error: bErr } = await db
    .from("brands")
    .select("id")
    .eq("user_id", userId);
  if (bErr) throw new Error(`userHasAnyRun: ${bErr.message}`);
  if (!brands || brands.length === 0) return false;

  const { count, error } = await db
    .from("runs")
    .select("id", { count: "exact", head: true })
    .in(
      "brand_id",
      brands.map((b) => b.id),
    );
  if (error) throw new Error(`userHasAnyRun: ${error.message}`);
  return (count ?? 0) > 0;
}
