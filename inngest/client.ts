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
    brandId: string;
    userId: string;
    provider: "openai" | "gemini";
    replicationIndex: number;
  }>(),
});

export const inngest = new Inngest({
  id: "chatgpt-cheap",
});
