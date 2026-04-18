import { GoogleGenAI, type Schema, Type } from "@google/genai";
import { env } from "@/lib/env";

export type JudgeResult = {
  mentioned: boolean;
  position: number | null;
  sentiment: "positive" | "neutral" | "negative" | null;
  recommendation_strength: "recommended" | "mentioned" | "dismissed";
  context_quote: string;
  competitors_mentioned: string[];
  cited_domains: string[];
};

const JUDGE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    mentioned: {
      type: Type.BOOLEAN,
      description:
        "Whether the brand is mentioned in the response (directly by name, domain, or clearly identifiable reference)",
    },
    position: {
      type: Type.INTEGER,
      nullable: true,
      description:
        "If the response lists multiple options, the 1-based position of the brand. null if not a list or brand not listed.",
    },
    sentiment: {
      type: Type.STRING,
      nullable: true,
      enum: ["positive", "neutral", "negative"],
      description: "Tone of the mention. null if not mentioned.",
    },
    recommendation_strength: {
      type: Type.STRING,
      enum: ["recommended", "mentioned", "dismissed"],
      description:
        "'recommended' if actively suggested, 'mentioned' if just named, 'dismissed' if presented negatively or warned against.",
    },
    context_quote: {
      type: Type.STRING,
      description:
        "Exact quote from the response where the brand is mentioned. Empty string if not mentioned.",
    },
    competitors_mentioned: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Names of competitor brands/products mentioned in the same response.",
    },
    cited_domains: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Domain names that appear in the response or its citations.",
    },
  },
  required: [
    "mentioned",
    "position",
    "sentiment",
    "recommendation_strength",
    "context_quote",
    "competitors_mentioned",
    "cited_domains",
  ],
};

function buildPrompt(params: {
  brandName: string;
  brandDomain: string;
  rawResponse: string;
}): string {
  return `You are a brand-mention analyst. Analyze the following AI-generated response and determine if and how the brand "${params.brandName}" (domain: ${params.brandDomain}) is mentioned.

Rules:
- "mentioned" is true ONLY if the brand is explicitly named, its domain appears, or it is unambiguously referenced.
- If the brand is not mentioned at all, set mentioned=false, position=null, sentiment=null, recommendation_strength="dismissed", context_quote="".
- "position" counts from 1 within a numbered/bulleted list. null if the response is not a list.
- "competitors_mentioned" should list other brands/products in the same domain.
- "cited_domains" should list any domain names that appear in the response text or citations.

AI response to analyze:
---
${params.rawResponse.slice(0, 4000)}
---`;
}

export async function judgeMention(params: {
  brandName: string;
  brandDomain: string;
  rawResponse: string;
}): Promise<{ result: JudgeResult; costCents: number }> {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required for mention judge");
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: buildPrompt(params),
    config: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: JUDGE_SCHEMA,
    },
  });

  const text = response.text ?? "{}";
  const parsed = JSON.parse(text) as JudgeResult;

  const usage = response.usageMetadata;
  const inputTokens = usage?.promptTokenCount ?? 0;
  const outputTokens = usage?.candidatesTokenCount ?? 0;
  const costCents = Math.max(1, Math.ceil((inputTokens * 30 + outputTokens * 250) / 1_000_000));

  return { result: parsed, costCents };
}
