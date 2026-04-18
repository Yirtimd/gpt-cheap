import OpenAI from "openai";
import type { Citation } from "@/lib/db/types";
import { env } from "@/lib/env";
import { openAiCostCents } from "./pricing";
import type { LLMProvider, ProviderResult } from "./types";

const MODEL = "gpt-4o-mini";

function extractCitations(response: OpenAI.Responses.Response): Citation[] {
  const citations: Citation[] = [];
  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const part of item.content ?? []) {
      if (part.type !== "output_text") continue;
      for (const annotation of part.annotations ?? []) {
        if (annotation.type !== "url_citation") continue;
        citations.push({
          url: annotation.url,
          title: annotation.title ?? undefined,
        });
      }
    }
  }
  return citations;
}

function countWebSearchCalls(response: OpenAI.Responses.Response): number {
  let count = 0;
  for (const item of response.output ?? []) {
    if (item.type === "web_search_call") count += 1;
  }
  return count;
}

async function realQuery(prompt: string): Promise<ProviderResult> {
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: MODEL,
    input: prompt,
    tools: [{ type: "web_search" }],
  });

  const usage = response.usage;
  const costCents = openAiCostCents({
    inputTokens: usage?.input_tokens ?? 0,
    outputTokens: usage?.output_tokens ?? 0,
    webSearchCalls: countWebSearchCalls(response),
  });

  return {
    text: response.output_text,
    citations: extractCitations(response),
    costCents,
    rawResponse: response,
  };
}

async function stubQuery(prompt: string): Promise<ProviderResult> {
  return {
    text: `[OPENAI STUB] No OPENAI_API_KEY configured. Prompt received: ${prompt.slice(0, 120)}${prompt.length > 120 ? "…" : ""}`,
    citations: [],
    costCents: 0,
    rawResponse: { stub: true, prompt },
    stub: true,
  };
}

export const openAiProvider: LLMProvider = {
  name: "openai",
  async query(prompt: string): Promise<ProviderResult> {
    if (!env.OPENAI_API_KEY) {
      return stubQuery(prompt);
    }
    return realQuery(prompt);
  },
};
