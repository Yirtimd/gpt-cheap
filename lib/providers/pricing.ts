// Pricing in US cents, per 1M tokens (×1_000_000 precision to avoid float drift).
// Sources checked 2026-04; re-verify quarterly when margin audit runs.

const OPENAI_GPT_4O_MINI = {
  inputCentsPer1M: 15, // $0.15 / 1M input tokens
  outputCentsPer1M: 60, // $0.60 / 1M output tokens
};

const OPENAI_WEB_SEARCH_SURCHARGE_CENTS = 2.5; // $25 / 1000 tool invocations

const GEMINI_2_5_FLASH = {
  inputCentsPer1M: 30, // $0.30 / 1M input tokens (non-thinking)
  outputCentsPer1M: 250, // $2.50 / 1M output tokens
};

const GEMINI_GROUNDING_SURCHARGE_CENTS = 3.5; // $35 / 1000 grounded requests (beyond free tier)

export function openAiCostCents(params: {
  inputTokens: number;
  outputTokens: number;
  webSearchCalls: number;
}): number {
  const { inputTokens, outputTokens, webSearchCalls } = params;
  const input = (inputTokens * OPENAI_GPT_4O_MINI.inputCentsPer1M) / 1_000_000;
  const output = (outputTokens * OPENAI_GPT_4O_MINI.outputCentsPer1M) / 1_000_000;
  const surcharge = webSearchCalls * OPENAI_WEB_SEARCH_SURCHARGE_CENTS;
  return Math.max(1, Math.ceil(input + output + surcharge));
}

export function geminiCostCents(params: {
  inputTokens: number;
  outputTokens: number;
  groundingCalls: number;
  isBilledGrounding: boolean;
}): number {
  const { inputTokens, outputTokens, groundingCalls, isBilledGrounding } = params;
  const input = (inputTokens * GEMINI_2_5_FLASH.inputCentsPer1M) / 1_000_000;
  const output = (outputTokens * GEMINI_2_5_FLASH.outputCentsPer1M) / 1_000_000;
  const surcharge = isBilledGrounding ? groundingCalls * GEMINI_GROUNDING_SURCHARGE_CENTS : 0;
  return Math.max(1, Math.ceil(input + output + surcharge));
}
