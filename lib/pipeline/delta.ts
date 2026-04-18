import "server-only";
import { getLatestCompletedRun, getRunResults } from "@/lib/db/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type DeltaResult = {
  hasPreviousRun: boolean;
  mentionGained: boolean;
  mentionLost: boolean;
  previousMentionRate: number | null;
  currentMentionRate: number;
};

export async function detectDelta(params: {
  runId: string;
  brandId: string;
  currentMentionRate: number;
}): Promise<DeltaResult> {
  const { runId, brandId, currentMentionRate } = params;
  const db = createSupabaseAdminClient();

  const prevRun = await getLatestCompletedRun(db, brandId, runId);
  if (!prevRun) {
    return {
      hasPreviousRun: false,
      mentionGained: false,
      mentionLost: false,
      previousMentionRate: null,
      currentMentionRate,
    };
  }

  const prevResults = await getRunResults(db, prevRun.id);
  const prevMentionCount = prevResults.filter((r) => r.mentioned).length;
  const previousMentionRate = prevResults.length > 0 ? prevMentionCount / prevResults.length : 0;

  const wasMentioned = previousMentionRate > 0.5;
  const isMentioned = currentMentionRate > 0.5;

  return {
    hasPreviousRun: true,
    mentionGained: !wasMentioned && isMentioned,
    mentionLost: wasMentioned && !isMentioned,
    previousMentionRate,
    currentMentionRate,
  };
}
