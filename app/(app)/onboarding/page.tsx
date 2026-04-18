"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const STEPS = ["Brand Info", "Queries", "Finish"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [brandName, setBrandName] = useState("");
  const [brandDomain, setBrandDomain] = useState("");
  const [brandDescription, setBrandDescription] = useState("");

  const [queries, setQueries] = useState<string[]>(["", "", "", "", ""]);

  function updateQuery(index: number, value: string) {
    setQueries((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleFinish() {
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .insert({
          user_id: user.id,
          name: brandName.trim(),
          domain: brandDomain.trim() || null,
          description: brandDescription.trim() || null,
        })
        .select("id")
        .single();

      if (brandError) throw new Error(brandError.message);

      const activeQueries = queries.map((q) => q.trim()).filter((q) => q.length > 0);

      if (activeQueries.length === 0) {
        throw new Error("Add at least one query");
      }

      const { error: queryError } = await supabase.from("queries").insert(
        activeQueries.map((prompt_text) => ({
          brand_id: brand.id,
          prompt_text,
        })),
      );

      if (queryError) throw new Error(queryError.message);

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-2 flex gap-2">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <CardTitle>
            {step === 0 && "Your Brand"}
            {step === 1 && "Monitoring Queries"}
            {step === 2 && "All Set"}
          </CardTitle>
          <CardDescription>
            {step === 0 && "Tell us about the brand you want to monitor."}
            {step === 1 && "What should ChatGPT and Gemini be asked about your brand?"}
            {step === 2 && "Review and start monitoring."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 0 && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="brand-name">Brand name *</Label>
                <Input
                  id="brand-name"
                  placeholder="Acme Corp"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand-domain">Domain</Label>
                <Input
                  id="brand-domain"
                  placeholder="acme.com"
                  value={brandDomain}
                  onChange={(e) => setBrandDomain(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand-desc">Description</Label>
                <Textarea
                  id="brand-desc"
                  placeholder="Brief description of what your brand does..."
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3">
              {queries.map((q, i) => (
                <div key={`q-${i.toString()}`} className="grid gap-1.5">
                  <Label htmlFor={`query-${i}`}>Query {i + 1}</Label>
                  <Input
                    id={`query-${i}`}
                    placeholder={`e.g. "Best ${brandName || "product"} alternatives for small business"`}
                    value={q}
                    onChange={(e) => updateQuery(i, e.target.value)}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Fill at least 1 query. These are the prompts we will send to ChatGPT and Gemini.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3 text-sm">
              <div>
                <span className="font-medium">Brand:</span> {brandName}
                {brandDomain && <span className="text-muted-foreground"> ({brandDomain})</span>}
              </div>
              <div>
                <span className="font-medium">Queries:</span>{" "}
                {queries.filter((q) => q.trim().length > 0).length} configured
              </div>
              <div>
                <span className="font-medium">Plan:</span> Starter ($9/mo) — you can upgrade in
                Settings after setup.
              </div>
              <p className="text-xs text-muted-foreground">
                Your first monitoring run will start within 24 hours. Billing will be activated once
                Stripe is connected.
              </p>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        </CardContent>

        <CardFooter className="flex justify-between">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={loading}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < 2 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && brandName.trim().length === 0}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={loading}>
              {loading ? "Saving..." : "Start monitoring"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
