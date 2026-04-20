import { ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { StatsBand } from "@/components/marketing/stats-band";
import { buttonVariants } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

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
      <section className="relative overflow-hidden px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden hero-glow" />
        <div aria-hidden className="absolute inset-0 -z-10 dot-grid opacity-70" />

        <div className="mx-auto max-w-[68rem]">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex justify-center">
              <span className="pill-brand">
                <Sparkles className="size-3.5" />
                AEO monitoring from $9/month
              </span>
            </div>

            <h1 className="h1-hero">
              Know when ChatGPT
              <br />
              <span className="brand-gradient">recommends your brand.</span>
            </h1>

            <p className="lead-text mx-auto mt-5 max-w-xl">
              Weekly reports on how ChatGPT and Gemini answer questions about your market — built
              for solo founders, freelancers, and small teams.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className={buttonVariants({
                  size: "lg",
                  className:
                    "h-11 gap-2 bg-brand px-6 text-[0.95rem] text-brand-foreground hover:bg-brand/90",
                })}
              >
                Start monitoring
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#pricing"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "h-11 px-6 text-[0.95rem]",
                })}
              >
                See pricing
              </Link>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              No free tier · Monthly billing · Cancel anytime
            </p>
          </div>

          <div className="mt-16">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* STATS */}
      <StatsBand />

      {/* FEATURES */}
      <section id="features" className="px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-[68rem]">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="eyebrow mb-3">Features</div>
            <h2 className="h2-section">Built for the long tail of AEO</h2>
            <p className="lead-text mt-4">
              Everything a solo founder or mini-agency needs to track their brand in AI answers.
              Nothing a Fortune 500 would bill you $2,000/mo for.
            </p>
          </div>
          <FeaturesGrid />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t bg-muted/40 px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-[60rem]">
          <div className="mb-12 text-center">
            <div className="eyebrow mb-3">How it works</div>
            <h2 className="h2-section">From signup to first report in 24 hours</h2>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-[68rem]">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <div className="eyebrow mb-3">Pricing</div>
            <h2 className="h2-section">Simple monthly pricing</h2>
            <p className="lead-text mt-4">No free tier. No annual tricks. Cancel anytime.</p>
          </div>
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t bg-muted/40 px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-[48rem]">
          <div className="mb-10 text-center">
            <div className="eyebrow mb-3">FAQ</div>
            <h2 className="h2-section">Good questions, short answers</h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-10 sm:py-14">
        <div
          className={cn(
            "relative mx-auto max-w-6xl overflow-hidden rounded-3xl border px-6 py-16 text-center",
            "border-brand/20",
          )}
          style={{
            background:
              "linear-gradient(135deg, var(--brand-soft) 0%, color-mix(in oklch, var(--brand-soft) 30%, var(--background)) 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(500px circle at 30% 40%, color-mix(in oklch, var(--brand) 30%, transparent), transparent 60%)",
            }}
          />
          <h2 className="h2-section">See where your brand stands in AI answers.</h2>
          <p className="lead-text mt-4">First report in 24 hours. $9/month. Cancel anytime.</p>
          <Link
            href="/login"
            className={buttonVariants({
              size: "lg",
              className:
                "mt-8 h-11 gap-2 bg-brand px-6 text-[0.95rem] text-brand-foreground hover:bg-brand/90",
            })}
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
