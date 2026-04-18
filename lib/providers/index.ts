import type { Provider } from "@/lib/db/types";
import { geminiProvider } from "./gemini";
import { openAiProvider } from "./openai";
import type { LLMProvider } from "./types";

const registry: Record<Provider, LLMProvider> = {
  openai: openAiProvider,
  gemini: geminiProvider,
};

export function getProvider(name: Provider): LLMProvider {
  return registry[name];
}

export const ACTIVE_PROVIDERS: readonly Provider[] = ["openai", "gemini"] as const;

export type { LLMProvider, ProviderResult } from "./types";
