import "server-only";
import type { DeltaResult } from "./delta";

export async function notifyIfChanged(params: {
  userId: string;
  brandName: string;
  delta: DeltaResult;
}): Promise<boolean> {
  const { delta, brandName } = params;

  if (!delta.mentionGained && !delta.mentionLost) {
    return false;
  }

  // TODO(week-2): send via Resend once email templates are ready
  const direction = delta.mentionGained ? "GAINED" : "LOST";
  console.log(
    `[notify] Brand "${brandName}" ${direction} mention. ` +
      `Rate: ${delta.previousMentionRate?.toFixed(2) ?? "n/a"} → ${delta.currentMentionRate.toFixed(2)}`,
  );

  return true;
}
