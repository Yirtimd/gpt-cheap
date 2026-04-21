import type { Plan, Provider } from "@/lib/db/types";

export type PlanConfig = {
  tier: Plan;
  priceCents: number;
  maxQueries: number;
  replication: number;
  cadence: "weekly" | "daily";
  monthlyCostCapCents: number;
};

export const PLANS: Record<Plan, PlanConfig> = {
  starter: {
    tier: "starter",
    priceCents: 900,
    maxQueries: 5,
    replication: 1,
    cadence: "weekly",
    monthlyCostCapCents: 200,
  },
  growth: {
    tier: "growth",
    priceCents: 1900,
    maxQueries: 15,
    replication: 2,
    cadence: "daily",
    monthlyCostCapCents: 500,
  },
  pro: {
    tier: "pro",
    priceCents: 2900,
    maxQueries: 30,
    replication: 3,
    cadence: "daily",
    monthlyCostCapCents: 1200,
  },
};

// Projected cost of one query = provider call + judge call.
// Judge runs on gemini-2.5-flash for every non-stub provider result,
// so the cap check must include it or we systematically undercount.
const PREDICTED_PROVIDER_CENTS: Record<Provider, number> = {
  openai: 3,
  gemini: 1,
};
const PREDICTED_JUDGE_CENTS = 1;

export function predictCostCents(provider: Provider): number {
  return PREDICTED_PROVIDER_CENTS[provider] + PREDICTED_JUDGE_CENTS;
}
