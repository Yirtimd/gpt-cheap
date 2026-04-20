import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { Plan } from "@/lib/db/types";
import { PLAN_PRODUCTS } from "@/lib/stripe/config";
import { cn } from "@/lib/utils";

const POPULAR: Plan = "growth";

const TIERS: Plan[] = ["starter", "growth", "pro"];

const SUBTITLES: Record<Plan, string> = {
  starter: "For solo founders and freelancers.",
  growth: "For growing brands and small teams.",
  pro: "For mini-agencies managing multiple brands.",
};

export function PricingCards() {
  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-3">
      {TIERS.map((tier) => {
        const product = PLAN_PRODUCTS[tier];
        const isPopular = tier === POPULAR;
        return (
          <div
            key={tier}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-card p-8 transition-all",
              isPopular
                ? "border-brand shadow-[0_0_0_1px_var(--brand),0_30px_80px_-30px_color-mix(in_oklch,var(--brand)_40%,transparent)] lg:-translate-y-2"
                : "hover:border-muted-foreground/30",
            )}
          >
            {isPopular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="pill-brand shadow-md">
                  <Sparkles className="size-3.5" />
                  Most popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-semibold tracking-tight">{product.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{SUBTITLES[tier]}</p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-[2.75rem] font-semibold leading-none tracking-[-0.03em]">
                  ${(product.priceCents / 100).toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
            </div>

            <ul className="mb-8 flex-1 space-y-3 text-sm">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2.5} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className={buttonVariants({
                variant: isPopular ? "default" : "outline",
                className: cn("w-full", isPopular && "bg-brand text-brand-foreground"),
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
