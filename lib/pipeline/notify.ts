import "server-only";
import { sendMentionAlert } from "@/lib/email/send-alert";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DeltaResult } from "./delta";

export async function notifyIfChanged(params: {
  userId: string;
  brandName: string;
  delta: DeltaResult;
}): Promise<boolean> {
  const { userId, brandName, delta } = params;

  if (!delta.mentionGained && !delta.mentionLost) {
    return false;
  }

  const db = createSupabaseAdminClient();
  const { data: user } = await db.auth.admin.getUserById(userId);
  const email = user?.user?.email;

  if (!email) {
    console.log(`[notify] No email found for user ${userId}, skipping alert`);
    return false;
  }

  const direction = delta.mentionGained ? "gained" : "lost";

  const dedupeKey = `mention-${direction}-${brandName}-${new Date().toISOString().slice(0, 10)}`;
  const { error: dedupeError } = await db.from("alerts").insert({
    user_id: userId,
    type: `mention_${direction}`,
    payload: {
      brandName,
      previousRate: delta.previousMentionRate,
      currentRate: delta.currentMentionRate,
    },
    dedupe_key: dedupeKey,
  });

  if (dedupeError) {
    console.log(`[notify] Alert already sent (dedupe): ${dedupeKey}`);
    return false;
  }

  const sent = await sendMentionAlert({
    to: email,
    brandName,
    direction,
    previousRate: delta.previousMentionRate,
    currentRate: delta.currentMentionRate,
  });

  if (sent) {
    await db
      .from("alerts")
      .update({ sent_at: new Date().toISOString() })
      .eq("dedupe_key", dedupeKey)
      .eq("user_id", userId);
  }

  return sent;
}
