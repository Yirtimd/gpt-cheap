import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("openAiProvider stub mode", () => {
  const originalKey = process.env.OPENAI_API_KEY;

  beforeAll(() => {
    delete process.env.OPENAI_API_KEY;
  });

  afterAll(() => {
    if (originalKey !== undefined) process.env.OPENAI_API_KEY = originalKey;
  });

  it("returns a stub response without hitting the API", async () => {
    const { openAiProvider } = await import("../openai");
    const result = await openAiProvider.query("is acme cheap for SMB?");
    expect(result.stub).toBe(true);
    expect(result.costCents).toBe(0);
    expect(result.text).toContain("OPENAI STUB");
    expect(result.citations).toEqual([]);
  });
});
