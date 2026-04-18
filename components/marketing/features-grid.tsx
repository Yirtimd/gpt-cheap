import { BarChart3, Bell, CircleDollarSign, Gauge, ScanSearch, Smile } from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Mention rate tracking",
    description:
      "See how often ChatGPT and Gemini name your brand across your queries, trended over time.",
  },
  {
    icon: Smile,
    title: "Sentiment & position",
    description:
      "Every mention analyzed for tone and list position — know not just if, but how, you are mentioned.",
  },
  {
    icon: ScanSearch,
    title: "Competitor radar",
    description:
      "Discover which competitors get recommended alongside you and how frequently they show up.",
  },
  {
    icon: Bell,
    title: "Email alerts",
    description:
      "Instant emails when your mention rate crosses the threshold up or down. No dashboard checking required.",
  },
  {
    icon: Gauge,
    title: "Web-search on every call",
    description:
      "Both providers run with live web search enabled — results reflect current web content, not stale training data.",
  },
  {
    icon: CircleDollarSign,
    title: "Cost-capped safety",
    description:
      "Per-user monthly cap with atomic increments. We abort runs before overspending — your margin is protected.",
  },
];

export function FeaturesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((f) => (
        <div
          key={f.title}
          className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-colors hover:border-brand/40"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand/0 to-brand/0 transition-colors group-hover:from-brand/5" />
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <f.icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h3 className="mb-1.5 font-semibold">{f.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
        </div>
      ))}
    </div>
  );
}
