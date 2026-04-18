import { eventType, Inngest, staticSchema } from "inngest";

export const brandScheduled = eventType("run/brand.scheduled", {
  schema: staticSchema<{
    brandId: string;
    userId: string;
  }>(),
});

export const queryExecute = eventType("run/query.execute", {
  schema: staticSchema<{
    runId: string;
    queryId: string;
    promptText: string;
    brandId: string;
    brandName: string;
    brandDomain: string;
    userId: string;
    provider: "openai" | "gemini";
    replicationIndex: number;
    expectedTotal: number;
  }>(),
});

export const runCompleted = eventType("run/completed", {
  schema: staticSchema<{
    runId: string;
    brandId: string;
    brandName: string;
    userId: string;
  }>(),
});

export const inngest = new Inngest({
  id: "chatgpt-cheap",
});
