import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { Plan } from "@/lib/db/types";
import { PLAN_PRODUCTS } from "@/lib/stripe/config";
import { cn } from "@/lib/utils";

const POPULAR: Plan = "growth";

const TIERS: Plan[] = ["starter", "growth", "pro"];

export function PricingCards() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {TIERS.map((tier) => {
        const product = PLAN_PRODUCTS[tier];
        const isPopular = tier === POPULAR;
        return (
          <div
            key={tier}
            className={cn(
              "relative rounded-2xl border bg-card p-8 transition-all",
              isPopular
                ? "border-brand/40 shadow-lg shadow-brand/10 lg:-translate-y-2"
                : "hover:border-muted-foreground/30",
            )}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-medium text-brand-foreground shadow-md">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight">
                  ${(product.priceCents / 100).toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {tier === "starter" && "For solo founders and freelancers."}
                {tier === "growth" && "For growing brands and small teams."}
                {tier === "pro" && "For mini-agencies managing multiple brands."}
              </p>
            </div>

            <ul className="mb-8 space-y-3 text-sm">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2.5} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className={buttonVariants({
                variant: isPopular ? "default" : "outline",
                className: "w-full",
              })}
            >
              Start with {product.name}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
