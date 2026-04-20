import { Bell, Bot, Calendar, Link as LinkIcon, Target, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Calendar,
    title: "Weekly & daily monitoring",
    description:
      "Fresh answers every week on Starter, every day on Growth and Pro. Configured once, running forever.",
  },
  {
    icon: Bot,
    title: "ChatGPT + Gemini",
    description:
      "Two providers out of the box, running with web search enabled. No API keys to manage on your side.",
  },
  {
    icon: Target,
    title: "Position & sentiment",
    description:
      "We parse each answer for your brand — whether it is mentioned, in which position, and whether the tone is positive, neutral, or negative.",
  },
  {
    icon: Users,
    title: "Competitor mentions",
    description:
      "See which competitor brands show up in the same answers. Spot when a new rival starts taking your spot.",
  },
  {
    icon: LinkIcon,
    title: "Citation tracking",
    description:
      "Every source the AI cited alongside your brand, with titles and URLs you can open and audit.",
  },
  {
    icon: Bell,
    title: "Email alerts on changes",
    description:
      "When your mention rate drops or a new competitor appears, you get a simple email — not a dashboard you have to remember to check.",
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
          <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <f.icon className="size-5" strokeWidth={1.75} />
          </div>
          <h3 className="mb-1.5 text-base font-semibold tracking-tight">{f.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
        </div>
      ))}
    </div>
  );
}
