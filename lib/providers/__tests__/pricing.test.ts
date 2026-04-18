import { describe, expect, it } from "vitest";
import { geminiCostCents, openAiCostCents } from "../pricing";

describe("openAiCostCents", () => {
  it("rounds sub-cent token costs up to at least 1 cent", () => {
    const cost = openAiCostCents({ inputTokens: 100, outputTokens: 200, webSearchCalls: 0 });
    expect(cost).toBe(1);
  });

  it("adds web_search surcharge per invocation", () => {
    const cost = openAiCostCents({ inputTokens: 100, outputTokens: 200, webSearchCalls: 1 });
    expect(cost).toBe(3);
  });

  it("scales web_search linearly", () => {
    const cost = openAiCostCents({ inputTokens: 0, outputTokens: 0, webSearchCalls: 4 });
    expect(cost).toBe(10);
  });
});

describe("geminiCostCents", () => {
  it("rounds small prompts to 1 cent minimum", () => {
    const cost = geminiCostCents({
      inputTokens: 100,
      outputTokens: 200,
      groundingCalls: 0,
      isBilledGrounding: false,
    });
    expect(cost).toBe(1);
  });

  it("adds grounding surcharge when billed", () => {
    const cost = geminiCostCents({
      inputTokens: 100,
      outputTokens: 200,
      groundingCalls: 1,
      isBilledGrounding: true,
    });
    expect(cost).toBe(4);
  });

  it("ignores surcharge when under free tier", () => {
    const cost = geminiCostCents({
      inputTokens: 100,
      outputTokens: 200,
      groundingCalls: 1,
      isBilledGrounding: false,
    });
    expect(cost).toBe(1);
  });
});
