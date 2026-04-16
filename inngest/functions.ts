import { brandScheduled, inngest } from "./client";

const healthCheck = inngest.createFunction(
  { id: "health-check", triggers: [brandScheduled] },
  async ({ event, step }) => {
    const result = await step.run("noop", () => ({
      brandId: event.data.brandId,
      userId: event.data.userId,
    }));
    return { ok: true, ...result };
  },
);

export const functions = [healthCheck];
