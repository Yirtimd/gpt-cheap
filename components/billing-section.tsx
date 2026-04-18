"use client";

import { useState } from "react";
import { PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Plan } from "@/lib/db/types";
import { PLAN_PRODUCTS } from "@/lib/stripe/config";

type Props = {
  currentPlan: Plan;
  hasStripeCustomer: boolean;
};

export function BillingSection({ currentPlan, hasStripeCustomer }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSelectPlan(plan: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (data.stub) {
        alert(data.message);
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (data.stub) {
        alert(data.message);
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            {hasStripeCustomer
              ? "Manage your subscription via the customer portal."
              : "Choose a plan to get started."}
          </CardDescription>
        </CardHeader>
        {hasStripeCustomer && (
          <CardContent>
            <Button onClick={handlePortal} disabled={loading} variant="outline">
              {loading ? "Loading..." : "Open Customer Portal"}
            </Button>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {(["starter", "growth", "pro"] as const).map((tier) => (
          <PlanCard
            key={tier}
            product={PLAN_PRODUCTS[tier]}
            currentPlan={currentPlan}
            onSelect={handleSelectPlan}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}
