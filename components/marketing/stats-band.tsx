const STATS = [
  { n: "79%", l: "net margin on Starter" },
  { n: "2¢", l: "per provider call" },
  { n: "2", l: "AI providers out of the box" },
  { n: "~14m", l: "avg run duration" },
];

export function StatsBand() {
  return (
    <section className="border-y bg-muted/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-10 px-6 py-14 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.l} className="text-left">
            <div className="text-[2.75rem] font-semibold leading-none tracking-[-0.03em]">
              {s.n}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
