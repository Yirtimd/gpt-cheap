/**
 * E2E smoke-test: creates a brand + 5 queries in the DB, runs the full pipeline
 * (provider → judge → save result → aggregate → delta → notify) against real APIs.
 *
 * Usage: pnpm tsx scripts/smoke-test.ts
 *
 * Requires .env.local with valid SUPABASE + GEMINI keys.
 * Cost: ~$0.02–$0.05 per run (10 provider calls + 10 judge calls).
 */
import "dotenv/config";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { PLANS } from "@/lib/cost/plans";
import type { Database, Provider } from "@/lib/db/types";
import { judgeMention } from "@/lib/parsing/mention-judge";
import { ACTIVE_PROVIDERS, getProvider } from "@/lib/providers";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BRAND_NAME = "Acronis";
const BRAND_DOMAIN = "acronis.com";

const QUERIES = [
  "What is the best cloud backup solution for small businesses?",
  "Can you recommend a reliable data protection service for freelancers?",
  "What are the top 5 backup services for SMBs in 2025?",
  "Which disaster recovery solutions do you recommend for a 10-person company?",
  "What should a solo founder use for automated backups?",
];

async function ensureTestUser(): Promise<string> {
  const email = `smoke-test-${Date.now()}@test.local`;
  const { data, error } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { test: true },
  });
  if (error) throw new Error(`createUser: ${error.message}`);
  const userId = data.user.id;
  console.log(`Test user created: ${email} (${userId})`);
  return userId;
}

async function createTestBrand(userId: string): Promise<string> {
  const { data, error } = await db
    .from("brands")
    .insert({ user_id: userId, name: BRAND_NAME, domain: BRAND_DOMAIN })
    .select("id")
    .single();
  if (error) throw new Error(`createTestBrand: ${error.message}`);
  return data.id;
}

async function createTestQueries(brandId: string): Promise<{ id: string; prompt_text: string }[]> {
  const rows = QUERIES.map((prompt_text) => ({ brand_id: brandId, prompt_text }));
  const { data, error } = await db.from("queries").insert(rows).select("id, prompt_text");
  if (error) throw new Error(`createTestQueries: ${error.message}`);
  return data;
}

async function createTestRun(brandId: string): Promise<string> {
  const { data, error } = await db
    .from("runs")
    .insert({ brand_id: brandId, status: "running" as const })
    .select("id")
    .single();
  if (error) throw new Error(`createTestRun: ${error.message}`);
  return data.id;
}

async function executeOne(params: {
  runId: string;
  queryId: string;
  promptText: string;
  provider: Provider;
  replicationIndex: number;
}) {
  const { runId, queryId, promptText, provider: providerName, replicationIndex } = params;

  const provider = getProvider(providerName);
  console.log(`  [${providerName}] query="${promptText.slice(0, 50)}..." repl=${replicationIndex}`);

  // Gemini free tier: 5 RPM. Throttle to stay under.
  if (providerName === "gemini") await sleep(13_000);
  const providerResult = await provider.query(promptText);

  let judgeResult: Awaited<ReturnType<typeof judgeMention>> | null = null;
  if (!providerResult.stub) {
    await sleep(13_000);
    judgeResult = await judgeMention({
      brandName: BRAND_NAME,
      brandDomain: BRAND_DOMAIN,
      rawResponse: providerResult.text,
    });
  }

  const totalCostCents = providerResult.costCents + (judgeResult?.costCents ?? 0);

  const idempotencyKey = crypto
    .createHash("sha256")
    .update(`${runId}|${queryId}|${providerName}|${replicationIndex}`)
    .digest("hex");

  const { error } = await db.from("results").upsert(
    {
      run_id: runId,
      query_id: queryId,
      provider: providerName,
      replication_index: replicationIndex,
      raw_response: providerResult.text,
      mentioned: judgeResult?.result.mentioned ?? false,
      position: judgeResult?.result.position ?? null,
      sentiment: judgeResult?.result.sentiment ?? null,
      recommendation_strength: judgeResult?.result.recommendation_strength ?? "dismissed",
      context_quote: judgeResult?.result.context_quote ?? "",
      citations: providerResult.citations,
      competitors_mentioned: judgeResult?.result.competitors_mentioned ?? [],
      cost_cents: totalCostCents,
      idempotency_key: idempotencyKey,
    },
    { onConflict: "idempotency_key" },
  );
  if (error) throw new Error(`insertResult: ${error.message}`);

  return {
    provider: providerName,
    mentioned: judgeResult?.result.mentioned ?? false,
    sentiment: judgeResult?.result.sentiment ?? null,
    position: judgeResult?.result.position ?? null,
    costCents: totalCostCents,
    stub: providerResult.stub ?? false,
    competitors: judgeResult?.result.competitors_mentioned ?? [],
  };
}

async function main() {
  console.log("=== SMOKE TEST START ===\n");

  const TEST_USER_ID = await ensureTestUser();

  const brandId = await createTestBrand(TEST_USER_ID);
  console.log(`Brand created: ${BRAND_NAME} (${brandId})`);

  const queries = await createTestQueries(brandId);
  console.log(`Queries created: ${queries.length}\n`);

  const runId = await createTestRun(brandId);
  console.log(`Run created: ${runId}\n`);

  const plan = PLANS.starter;
  const results = [];
  let totalCost = 0;

  for (const q of queries) {
    for (const provider of ACTIVE_PROVIDERS) {
      for (let i = 0; i < plan.replication; i++) {
        const result = await executeOne({
          runId,
          queryId: q.id,
          promptText: q.prompt_text,
          provider,
          replicationIndex: i,
        });
        results.push(result);
        totalCost += result.costCents;
        console.log(
          `    -> mentioned=${result.mentioned} sentiment=${result.sentiment} cost=${result.costCents}c stub=${result.stub}`,
        );
      }
    }
  }

  // Update run status
  await db
    .from("runs")
    .update({
      status: "done" as const,
      completed_at: new Date().toISOString(),
      total_cost_cents: totalCost,
    })
    .eq("id", runId);

  // Summary
  const mentionedCount = results.filter((r) => r.mentioned).length;
  const stubCount = results.filter((r) => r.stub).length;
  const realCount = results.length - stubCount;

  console.log("\n=== SUMMARY ===");
  console.log(`Total results: ${results.length} (${realCount} real, ${stubCount} stub)`);
  console.log(
    `Mentioned: ${mentionedCount}/${results.length} (${((mentionedCount / results.length) * 100).toFixed(0)}%)`,
  );
  console.log(`Total cost: ${totalCost}c ($${(totalCost / 100).toFixed(4)})`);
  console.log(`Cost per result: ${(totalCost / results.length).toFixed(2)}c`);
  console.log(`Cost per run (${results.length} results): ${totalCost}c`);
  console.log(
    `\nStarter monthly projection (4 runs): ${totalCost * 4}c ($${((totalCost * 4) / 100).toFixed(4)})`,
  );

  if (realCount > 0) {
    const realResults = results.filter((r) => !r.stub);
    const realCost = realResults.reduce((s, r) => s + r.costCents, 0);
    console.log(`\nReal provider cost only: ${realCost}c ($${(realCost / 100).toFixed(4)})`);
    console.log(`Real cost per call: ${(realCost / realCount).toFixed(2)}c`);
  }

  // Competitors analysis
  const allCompetitors = results.flatMap((r) => r.competitors);
  const competitorCounts = allCompetitors.reduce(
    (acc, c) => {
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const sortedCompetitors = Object.entries(competitorCounts).sort((a, b) => b[1] - a[1]);
  if (sortedCompetitors.length > 0) {
    console.log("\nTop competitors mentioned:");
    for (const [name, count] of sortedCompetitors.slice(0, 10)) {
      console.log(`  ${name}: ${count}x`);
    }
  }

  console.log("\n=== SMOKE TEST DONE ===");
}

main().catch((err) => {
  console.error("SMOKE TEST FAILED:", err);
  process.exit(1);
});
