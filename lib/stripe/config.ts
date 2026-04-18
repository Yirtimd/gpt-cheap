import type { Plan } from "@/lib/db/types";

export type PlanProduct = {
  tier: Plan;
  name: string;
  priceCents: number;
  stripePriceId: string;
  features: string[];
};

// Price IDs are placeholders until Stripe products are created.
// Replace with real IDs from Stripe Dashboard → Products.
export const PLAN_PRODUCTS: Record<Plan, PlanProduct> = {
  starter: {
    tier: "starter",
    name: "Starter",
    priceCents: 900,
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? "price_starter_placeholder",
    features: ["5 queries", "2 providers (OpenAI + Gemini)", "Weekly monitoring", "Email alerts"],
  },
  growth: {
    tier: "growth",
    name: "Growth",
    priceCents: 1900,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH ?? "price_growth_placeholder",
    features: [
      "15 queries",
      "2 providers (OpenAI + Gemini)",
      "Daily monitoring",
      "2x replication",
      "Email alerts",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    priceCents: 2900,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? "price_pro_placeholder",
    features: [
      "30 queries (3 brands)",
      "2 providers (OpenAI + Gemini)",
      "Daily monitoring",
      "3x replication",
      "Priority email alerts",
    ],
  },
};

export function planFromPriceId(priceId: string): Plan | null {
  for (const [tier, product] of Object.entries(PLAN_PRODUCTS)) {
    if (product.stripePriceId === priceId) return tier as Plan;
  }
  return null;
}
