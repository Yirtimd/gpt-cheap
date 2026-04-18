import { type GenerateContentResponse, GoogleGenAI, type GroundingChunk } from "@google/genai";
import type { Citation } from "@/lib/db/types";
import { env } from "@/lib/env";
import { geminiCostCents } from "./pricing";
import type { LLMProvider, ProviderResult } from "./types";

const MODEL = "gemini-2.5-flash";

function extractCitations(response: GenerateContentResponse): Citation[] {
  const chunks: GroundingChunk[] =
    response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const citations: Citation[] = [];
  for (const chunk of chunks) {
    if (chunk.web?.uri) {
      citations.push({
        url: chunk.web.uri,
        title: chunk.web.title,
      });
    }
  }
  return citations;
}

export const geminiProvider: LLMProvider = {
  name: "gemini",
  async query(prompt: string): Promise<ProviderResult> {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is required — no stub mode for Gemini");
    }

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const citations = extractCitations(response);
    const usage = response.usageMetadata;
    const costCents = geminiCostCents({
      inputTokens: usage?.promptTokenCount ?? 0,
      outputTokens: usage?.candidatesTokenCount ?? 0,
      groundingCalls: citations.length > 0 ? 1 : 0,
      isBilledGrounding: env.GEMINI_GROUNDING_BILLED,
    });

    return {
      text: response.text ?? "",
      citations,
      costCents,
      rawResponse: response,
    };
  },
};
