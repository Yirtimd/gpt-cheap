const STEPS = [
  {
    number: "01",
    title: "Add your brand",
    description:
      "Name, domain, a short description. Takes under a minute. No credit card for the setup.",
  },
  {
    number: "02",
    title: "Write 5 queries",
    description:
      "The exact prompts your customers might ask AI. We handle the rest — provider calls, replication, parsing.",
  },
  {
    number: "03",
    title: "Get weekly reports",
    description:
      "Mention rate, sentiment, position, competitors. Emailed the moment your brand visibility changes.",
  },
];

export function HowItWorks() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {STEPS.map((step, i) => (
        <div key={step.number} className="relative">
          {i < STEPS.length - 1 && (
            <div
              aria-hidden
              className="absolute top-6 left-[3.5rem] hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-border to-transparent lg:block"
            />
          )}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft font-mono text-sm font-semibold text-brand">
              {step.number}
            </div>
            <div className="pt-1.5">
              <h3 className="mb-2 font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
