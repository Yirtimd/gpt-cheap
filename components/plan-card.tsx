"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanProduct } from "@/lib/stripe/config";

type Props = {
  product: PlanProduct;
  currentPlan: string;
  onSelect: (plan: string) => void;
  loading: boolean;
};

const PLAN_ORDER: Record<string, number> = { starter: 0, growth: 1, pro: 2 };

export function PlanCard({ product, currentPlan, onSelect, loading }: Props) {
  const isCurrent = product.tier === currentPlan;
  const isUpgrade = (PLAN_ORDER[product.tier] ?? 0) > (PLAN_ORDER[currentPlan] ?? 0);
  const actionLabel = isUpgrade ? `Upgrade to ${product.name}` : `Downgrade to ${product.name}`;

  return (
    <Card className={isCurrent ? "border-brand" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{product.name}</CardTitle>
          {isCurrent && <Badge className="bg-brand text-brand-foreground">Current plan</Badge>}
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight">
            ${(product.priceCents / 100).toFixed(0)}
          </span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {product.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isCurrent ? (
          <Button variant="outline" className="w-full" disabled>
            Current plan
          </Button>
        ) : (
          <Button
            variant={isUpgrade ? "default" : "outline"}
            className="w-full"
            onClick={() => onSelect(product.tier)}
            disabled={loading}
          >
            {loading ? "Loading..." : actionLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
