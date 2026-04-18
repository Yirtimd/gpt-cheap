import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_PRODUCTS } from "@/lib/stripe/config";
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

const FAQ_ITEMS = [
  {
    q: "How is this different from Profound, Peec, or AthenaHQ?",
    a: "Those tools target enterprise with $500+/mo pricing. We serve the long tail — freelancers, solo founders, and SMBs who need AEO monitoring without an enterprise budget.",
  },
  {
    q: "Which AI providers do you monitor?",
    a: "OpenAI (ChatGPT via Responses API) and Google Gemini, both with web search enabled. Claude and Perplexity are on the roadmap.",
  },
  {
    q: "How accurate is the mention detection?",
    a: "We use a separate LLM-based judge with structured output for every response, with 1x–3x replication depending on your plan. Majority voting reduces false positives vs regex matching.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, monthly billing, cancel or downgrade anytime via the customer portal.",
  },
  {
    q: "How often are runs executed?",
    a: "Starter: weekly. Growth & Pro: daily. Each run tests all your queries across both providers.",
  },
];

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
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Know when ChatGPT recommends your brand.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Weekly AEO monitoring for freelancers, solo founders, and SMBs. From $9/month.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Start monitoring
          </Link>
          <Link href="#pricing" className={buttonVariants({ size: "lg", variant: "outline" })}>
            See pricing
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No free tier · Monthly billing · Cancel anytime
        </p>
      </section>

      {/* PROBLEM */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Your customers are asking ChatGPT, not Google.
          </h2>
          <p className="mt-4 text-muted-foreground">
            58% of buyers now ask AI assistants for product recommendations. If ChatGPT or Gemini
            doesn't mention you, you lose deals you never even knew existed.
          </p>
          <p className="mt-4 text-muted-foreground">
            Enterprise AEO tools cost $500+/month — that doesn't work for a 5-person team. We run
            the same playbook on a $9 budget: weekly queries, real web search, sentiment tracking,
            competitor analysis.
          </p>
        </div>
      </section>

      {/* DEMO placeholder */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">What you get</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Mention rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track how often ChatGPT and Gemini name your brand across your queries, with
                  weekly delta alerts.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sentiment & position</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Every mention is analyzed for tone (positive / neutral / negative) and position in
                  lists.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Competitor radar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See which competitors get mentioned alongside you and how frequently.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            No free tier. Monthly billing. No lock-in.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {(["starter", "growth", "pro"] as const).map((tier) => {
              const product = PLAN_PRODUCTS[tier];
              return (
                <Card key={tier}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{product.name}</span>
                      <span className="text-2xl font-bold">
                        ${(product.priceCents / 100).toFixed(0)}
                      </span>
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
                    <Link href="/login" className={buttonVariants({ className: "w-full" })}>
                      Start with {product.name}
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">Frequently asked</h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q}>
                <h3 className="font-medium">{item.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Ready to see where your brand stands?
          </h2>
          <p className="mt-4 text-muted-foreground">
            5 queries. 2 providers. Weekly reports. $9/month.
          </p>
          <Link href="/login" className={buttonVariants({ size: "lg", className: "mt-6" })}>
            Get started
          </Link>
        </div>
      </section>
    </>
  );
}
