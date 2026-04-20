"use client";

import { ArrowUpRight, Receipt } from "lucide-react";
import { useState } from "react";
import { PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Billing</CardTitle>
        <CardDescription>
          {hasStripeCustomer
            ? "Manage your subscription or review past invoices."
            : "Choose a plan to activate monitoring."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="plans">
          <TabsList className="mb-4">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
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
          </TabsContent>

          <TabsContent value="invoices">
            {hasStripeCustomer ? (
              <div className="rounded-md border bg-muted/30 p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Receipt className="h-5 w-5" />
                </div>
                <p className="text-sm">Invoices and payment methods are managed by Stripe.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Open the portal to download receipts or update your card.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={handlePortal}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Open customer portal"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="rounded-md border bg-muted/30 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No invoices yet — pick a plan to activate billing.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
