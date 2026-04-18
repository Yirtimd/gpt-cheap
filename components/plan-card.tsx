"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanProduct } from "@/lib/stripe/config";

type Props = {
  product: PlanProduct;
  currentPlan: string;
  onSelect: (plan: string) => void;
  loading: boolean;
};

export function PlanCard({ product, currentPlan, onSelect, loading }: Props) {
  const isCurrent = product.tier === currentPlan;

  return (
    <Card className={isCurrent ? "border-primary" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{product.name}</span>
          <span className="text-2xl font-bold">${(product.priceCents / 100).toFixed(0)}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">/month</p>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 text-sm">
          {product.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">+</span>
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
          <Button className="w-full" onClick={() => onSelect(product.tier)} disabled={loading}>
            {loading ? "Loading..." : `Upgrade to ${product.name}`}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
