import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, RunStatus } from "./types";

type AdminClient = SupabaseClient<Database>;

export async function createRun(db: AdminClient, brandId: string) {
  const { data, error } = await db
    .from("runs")
    .insert({ brand_id: brandId, status: "pending" as RunStatus })
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
