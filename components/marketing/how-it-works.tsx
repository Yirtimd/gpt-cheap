const STEPS = [
  {
    n: "1",
    title: "Add your brand and 5 queries",
    description:
      "Name your brand, link your domain (optional), and paste 5 realistic questions a customer might ask ChatGPT about your space.",
  },
  {
    n: "2",
    title: "We run them on ChatGPT and Gemini with web search",
    description:
      "Our crawler fires the prompts through both providers every week — or every day on higher plans. All with live web search enabled.",
  },
  {
    n: "3",
    title: "You get a weekly report and email alerts on changes",
    description:
      "Mention rate, position, sentiment, competitors, citations — all in one email. No dashboard-checking homework.",
  },
];

export function HowItWorks() {
  return (
    <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
      {STEPS.map((step) => (
        <div key={step.n} className="relative">
          <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand text-lg font-semibold text-brand-foreground">
            {step.n}
          </div>
          <h3 className="mb-2 text-lg font-semibold tracking-tight">{step.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}
