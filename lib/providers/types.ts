import type { Citation, Provider } from "@/lib/db/types";

export type ProviderResult = {
  text: string;
  citations: Citation[];
  costCents: number;
  rawResponse: unknown;
  stub?: boolean;
};

export interface LLMProvider {
  readonly name: Provider;
  query(prompt: string): Promise<ProviderResult>;
}
