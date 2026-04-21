import "server-only";
import { brandScheduled, inngest } from "@/inngest/client";
import type { RunTriggerSource } from "@/lib/db/types";

export async function triggerBrandRun(params: {
  brandId: string;
  userId: string;
  source: RunTriggerSource;
}): Promise<void> {
  await inngest.send({
    name: brandScheduled.name,
    data: {
      brandId: params.brandId,
      userId: params.userId,
      source: params.source,
    },
  });
}
