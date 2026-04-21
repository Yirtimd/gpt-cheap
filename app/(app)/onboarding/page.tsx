"use client";

import { ArrowRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
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

const STEP_TITLES = ["Your Brand", "Monitoring Queries", "All Set"] as const;
const STEP_DESCS = [
  "Tell us about the brand you want to monitor.",
  "What should ChatGPT and Gemini be asked about your brand?",
  "Review and start monitoring.",
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const posthog = usePostHog();
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

      posthog?.identify(user.id, { email: user.email });
      posthog?.capture("brand_created", { brandName: brandName.trim() });
      posthog?.capture("queries_created", { count: activeQueries.length });

      // Kick off the first monitoring run immediately so the user lands on
      // a dashboard with "Run in progress" instead of an empty state.
      // The /api/runs/trigger endpoint detects zero prior runs and
      // switches to source=onboarding, bypassing the manual 24h cooldown.
      try {
        await fetch("/api/runs/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brandId: brand.id }),
        });
      } catch {
        // First-run failure is non-fatal — the weekly cron will pick it up.
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-start justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-[36rem] p-0">
        <div className="px-6 pt-5">
          <div className="flex gap-1">
            {STEP_TITLES.map((label, i) => (
              <div
                key={label}
                className={`h-1 flex-1 rounded-full ${i <= step ? "bg-brand" : "bg-muted"}`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            <span>Step {step + 1} of 3</span>
            <span>{STEP_TITLES[step]}</span>
          </div>
        </div>
        <CardHeader className="gap-1.5 pt-4">
          <CardTitle className="text-[1.375rem] font-semibold tracking-tight">
            {STEP_TITLES[step]}
          </CardTitle>
          <CardDescription>{STEP_DESCS[step]}</CardDescription>
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
            <div className="grid gap-3">
              <div className="rounded-lg border bg-muted/50 p-4 text-sm">
                <div className="grid gap-2.5">
                  <Row label="Brand">
                    <span className="font-medium">
                      {brandName || "—"}
                      {brandDomain && (
                        <span className="text-muted-foreground"> ({brandDomain})</span>
                      )}
                    </span>
                  </Row>
                  <Row label="Queries">
                    <span className="font-medium">
                      {queries.filter((q) => q.trim().length > 0).length} configured
                    </span>
                  </Row>
                  <Row label="Plan">
                    <span className="font-medium">Starter ($9/mo)</span>
                  </Row>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                You can upgrade in Settings after setup.
              </p>
              <div className="rounded-lg bg-brand-soft px-3 py-3 text-[13px] text-brand">
                Your first monitoring run starts right after you click below and takes a couple of
                minutes. Billing will be activated once Stripe is connected.
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </CardContent>

        <CardFooter className="justify-between">
          {step > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="gap-1.5"
            >
              <ChevronLeft className="size-3.5" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" disabled className="gap-1.5">
              <ChevronLeft className="size-3.5" />
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button
              size="sm"
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && brandName.trim().length === 0}
              className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              Continue
              <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleFinish}
              disabled={loading}
              className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {loading ? "Saving…" : "Start monitoring"}
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
