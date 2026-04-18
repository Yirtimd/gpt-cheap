import crypto from "node:crypto";
import { checkUserCap, incrementUserCost } from "@/lib/cost/cap";
import { PLANS } from "@/lib/cost/plans";
import {
  countRunResults,
  createRun,
  getActiveQueries,
  getBrandWithUser,
  getUserPlan,
  insertResult,
  updateRunStatus,
} from "@/lib/db/queries";
import type { Provider } from "@/lib/db/types";
import { judgeMention } from "@/lib/parsing/mention-judge";
import { aggregateRun } from "@/lib/pipeline/aggregate";
import { detectDelta } from "@/lib/pipeline/delta";
import { notifyIfChanged } from "@/lib/pipeline/notify";
import { ACTIVE_PROVIDERS, getProvider } from "@/lib/providers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { brandScheduled, inngest, queryExecute, runCompleted } from "./client";

// ---------------------------------------------------------------------------
// Function 1: schedule a brand run → fan-out query×provider×replication events
// ---------------------------------------------------------------------------
const scheduleBrandRun = inngest.createFunction(
  { id: "schedule-brand-run", triggers: [brandScheduled] },
  async ({ event, step }) => {
    const { brandId, userId } = event.data as { brandId: string; userId: string };

    const db = createSupabaseAdminClient();

    const brand = await step.run("get-brand", () => getBrandWithUser(db, brandId));
    const profile = await step.run("get-profile", () => getUserPlan(db, userId));
    const queries = await step.run("get-queries", () => getActiveQueries(db, brandId));

    if (queries.length === 0) return { skipped: true, reason: "no active queries" };

    const plan = PLANS[profile.plan];
    const expectedTotal = queries.length * ACTIVE_PROVIDERS.length * plan.replication;

    const run = await step.run("create-run", () => createRun(db, brandId));

    const events = queries.flatMap((q) =>
      ACTIVE_PROVIDERS.flatMap((provider) =>
        Array.from({ length: plan.replication }, (_, i) => ({
          name: "run/query.execute" as const,
          data: {
            runId: run.id,
            queryId: q.id,
            promptText: q.prompt_text,
            brandId,
            brandName: brand.name,
            brandDomain: brand.domain ?? "",
            userId,
            provider,
            replicationIndex: i,
            expectedTotal,
          },
        })),
      ),
    );

    await step.run("update-status-running", () => updateRunStatus(db, run.id, "running"));
    await step.sendEvent("fan-out", events);

    return { runId: run.id, fanOutCount: events.length };
  },
);

// ---------------------------------------------------------------------------
// Function 2: execute a single query → call provider → judge → save result
// ---------------------------------------------------------------------------
const executeQuery = inngest.createFunction(
  {
    id: "execute-query",
    triggers: [queryExecute],
    retries: 2,
    concurrency: [{ limit: 5 }],
  },
  async ({ event, step }) => {
    const d = event.data as {
      runId: string;
      queryId: string;
      promptText: string;
      brandId: string;
      brandName: string;
      brandDomain: string;
      userId: string;
      provider: Provider;
      replicationIndex: number;
      expectedTotal: number;
    };

    const capCheck = await step.run("check-cap", () =>
      checkUserCap({ userId: d.userId, provider: d.provider }),
    );
    if (!capCheck.ok) {
      console.log(`[execute-query] cap reached for user ${d.userId}: ${capCheck.reason}`);
      return { skipped: true, reason: capCheck.reason };
    }

    const providerResult = await step.run("call-provider", async () => {
      const provider = getProvider(d.provider);
      return provider.query(d.promptText);
    });

    const judgeResult = await step.run("judge", async () => {
      if (providerResult.stub) {
        return {
          result: {
            mentioned: false,
            position: null,
            sentiment: null,
            recommendation_strength: "dismissed" as const,
            context_quote: "",
            competitors_mentioned: [] as string[],
            cited_domains: [] as string[],
          },
          costCents: 0,
        };
      }
      return judgeMention({
        brandName: d.brandName,
        brandDomain: d.brandDomain,
        rawResponse: providerResult.text,
      });
    });

    const totalCostCents = providerResult.costCents + judgeResult.costCents;

    const idempotencyKey = crypto
      .createHash("sha256")
      .update(`${d.runId}|${d.queryId}|${d.provider}|${d.replicationIndex}`)
      .digest("hex");

    const db = createSupabaseAdminClient();

    await step.run("save-result", async () => {
      await insertResult(db, {
        run_id: d.runId,
        query_id: d.queryId,
        provider: d.provider,
        replication_index: d.replicationIndex,
        raw_response: providerResult.text,
        mentioned: judgeResult.result.mentioned,
        position: judgeResult.result.position,
        sentiment: judgeResult.result.sentiment,
        recommendation_strength: judgeResult.result.recommendation_strength,
        context_quote: judgeResult.result.context_quote,
        citations: providerResult.citations,
        competitors_mentioned: judgeResult.result.competitors_mentioned,
        cost_cents: totalCostCents,
        idempotency_key: idempotencyKey,
      });

      await incrementUserCost({ userId: d.userId, costCents: totalCostCents });
    });

    const count = await step.run("check-completion", () => countRunResults(db, d.runId));

    if (count >= d.expectedTotal) {
      await step.sendEvent("run-completed", {
        name: "run/completed",
        data: {
          runId: d.runId,
          brandId: d.brandId,
          brandName: d.brandName,
          userId: d.userId,
        },
      });
    }

    return {
      costCents: totalCostCents,
      mentioned: judgeResult.result.mentioned,
      stub: providerResult.stub ?? false,
      resultsCompleted: count,
      expectedTotal: d.expectedTotal,
    };
  },
);

// ---------------------------------------------------------------------------
// Function 3: aggregate completed run → delta detect → notify
// ---------------------------------------------------------------------------
const completeRun = inngest.createFunction(
  { id: "complete-run", triggers: [runCompleted] },
  async ({ event, step }) => {
    const d = event.data as {
      runId: string;
      brandId: string;
      brandName: string;
      userId: string;
    };

    const aggregated = await step.run("aggregate", () => aggregateRun(d.runId));

    const delta = await step.run("detect-delta", () =>
      detectDelta({
        runId: d.runId,
        brandId: d.brandId,
        currentMentionRate: aggregated.mentionRate,
      }),
    );

    const notified = await step.run("notify", () =>
      notifyIfChanged({
        userId: d.userId,
        brandName: d.brandName,
        delta,
      }),
    );

    return {
      ...aggregated,
      delta,
      notified,
    };
  },
);

export const functions = [scheduleBrandRun, executeQuery, completeRun];
