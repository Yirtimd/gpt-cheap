import "server-only";
import { getRunResults, updateRunStatus } from "@/lib/db/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AggregatedRun = {
  runId: string;
  totalCostCents: number;
  mentionedByMajority: boolean;
  mentionRate: number;
  resultCount: number;
};

export async function aggregateRun(runId: string): Promise<AggregatedRun> {
  const db = createSupabaseAdminClient();
  const results = await getRunResults(db, runId);

  const totalCostCents = results.reduce((sum, r) => sum + r.cost_cents, 0);
  const mentionedCount = results.filter((r) => r.mentioned).length;
  const mentionRate = results.length > 0 ? mentionedCount / results.length : 0;
  const mentionedByMajority = mentionRate > 0.5;

  await updateRunStatus(db, runId, "done", totalCostCents);

  return {
    runId,
    totalCostCents,
    mentionedByMajority,
    mentionRate,
    resultCount: results.length,
  };
}
