import { ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { buttonVariants } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ChatGPT.cheap — AEO monitoring for SMB from $9/mo",
  description:
    "Track how your brand appears in ChatGPT and Gemini answers. Weekly reports, sentiment analysis, competitor tracking. For freelancers, solo founders, and small businesses.",
  openGraph: {
    title: "ChatGPT.cheap — AEO monitoring for SMB",
    description: "Track how your brand appears in ChatGPT and Gemini answers. From $9/mo.",
    type: "website",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ChatGPT.cheap",
  description: "AEO monitoring for freelancers, solo founders, and SMBs",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "9",
    highPrice: "29",
    priceCurrency: "USD",
    offerCount: 3,
  },
};

export default async function LandingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw JSON injection
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-20 sm:pt-28 sm:pb-24">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-dot-grid-faint opacity-40 mask-radial-fade"
        />
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-brand/20 blur-[100px]"
        />

        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3.5 py-1.5 text-xs font-medium text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              AEO monitoring from $9/month
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Know when ChatGPT
              <br />
              <span className="bg-gradient-to-r from-brand to-brand/70 bg-clip-text text-transparent">
                recommends your brand.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Weekly reports on how ChatGPT and Gemini answer when someone asks about your market.
              Built for solo founders, freelancers, and small teams.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className={buttonVariants({ size: "lg", className: "gap-2 px-6" })}
              >
                Start monitoring
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#pricing"
                className={buttonVariants({ size: "lg", variant: "outline", className: "px-6" })}
              >
                See pricing
              </Link>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              No free tier · Monthly billing · Cancel anytime
            </p>
          </div>

          <div className="mx-auto mt-20 max-w-4xl">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-4">
          <Stat value="79%" label="net margin on Starter" />
          <Stat value="2¢" label="per provider call" />
          <Stat value="2" label="AI providers out of the box" />
          <Stat value="~14m" label="avg run duration" />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 max-w-2xl">
            <div className="mb-4 text-sm font-medium text-brand">Features</div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for the long tail of AEO
            </h2>
            <p className="mt-4 text-muted-foreground">
              Enterprise tools solve the same problem at 50× the price. We cut everything that is
              not essential to keep pricing at SMB budget.
            </p>
          </div>
          <FeaturesGrid />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 max-w-2xl">
            <div className="mb-4 text-sm font-medium text-brand">How it works</div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From signup to first report in 24 hours
            </h2>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <div className="mb-4 text-sm font-medium text-brand">Pricing</div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple plans, no surprises
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Monthly billing. No annual lock-in. No hidden per-seat fees.
            </p>
          </div>
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-12 text-center">
            <div className="mb-4 text-sm font-medium text-brand">FAQ</div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions, answered</h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t py-24">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-soft via-background to-background"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 left-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-brand/20 blur-[80px]"
        />

        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            See where your brand stands in AI answers
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            First report in 24 hours. $9/month. Cancel anytime.
          </p>
          <Link
            href="/login"
            className={buttonVariants({
              size: "lg",
              className: "mt-8 gap-2 px-8",
            })}
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
        {value}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
