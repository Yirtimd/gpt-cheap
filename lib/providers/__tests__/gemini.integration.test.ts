import { config as loadEnv } from "dotenv";
import { describe, expect, it } from "vitest";

loadEnv({ path: ".env.local", quiet: true });

const runIntegration = process.env.RUN_INTEGRATION === "1";

describe.skipIf(!runIntegration)("geminiProvider (real API)", () => {
  it("returns text + citations for a grounded query", async () => {
    const { geminiProvider } = await import("../gemini");
    const result = await geminiProvider.query(
      "In one sentence, name one well-known cloud backup service for small businesses in 2025.",
    );

    expect(result.text.length).toBeGreaterThan(5);
    expect(result.costCents).toBeGreaterThan(0);
    expect(result.stub).toBeUndefined();
    console.log("[gemini smoke]", {
      costCents: result.costCents,
      citations: result.citations.length,
      textPreview: result.text.slice(0, 120),
    });
  }, 30_000);
});
