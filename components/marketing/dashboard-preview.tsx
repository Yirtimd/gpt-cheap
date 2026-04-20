export function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div
        aria-hidden
        className="absolute -inset-x-6 -top-6 bottom-0 -z-10 rounded-[2rem] bg-gradient-to-b from-brand/10 via-brand/5 to-transparent blur-2xl"
      />

      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-[0_40px_80px_-30px_rgb(0_0_0_/_0.25)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-[11px] text-muted-foreground">
            app.chatgpt.cheap / dashboard
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
          {[
            { l: "MENTION RATE", v: "68%", s: "34 / 50 results" },
            { l: "COMPLETED RUNS", v: "12", s: "1 in progress" },
            { l: "BRANDS", v: "1", s: "acme.com" },
          ].map((k) => (
            <div
              key={k.l}
              className="rounded-xl border bg-muted/40 p-4"
            >
              <div className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                {k.l}
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-[-0.02em]">{k.v}</div>
              <div className="text-xs text-muted-foreground">{k.s}</div>
            </div>
          ))}
        </div>

        {/* Chart card */}
        <div className="px-6 pb-6">
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">Mention rate over time</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                last 10 runs
              </span>
            </div>
            <MiniChart />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniChart() {
  const points = [70, 60, 72, 58, 50, 55, 42, 48, 35, 32];
  const width = 640;
  const height = 140;
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => [i * step, p] as const);
  const path = coords.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const areaPath = `${path} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-32 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Mention rate trend"
    >
      <title>Mention rate trend</title>
      <defs>
        <linearGradient id="dp-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((r) => (
        <line
          key={r}
          x1="0"
          x2={width}
          y1={r * 35 + 5}
          y2={r * 35 + 5}
          stroke="var(--border)"
          strokeDasharray="2 3"
        />
      ))}
      <path d={areaPath} fill="url(#dp-grad)" />
      <path d={path} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinejoin="round" />
      {coords.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="var(--brand)" />
      ))}
    </svg>
  );
}
