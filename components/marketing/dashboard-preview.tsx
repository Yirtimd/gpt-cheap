import { ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-x-8 -top-8 bottom-0 rounded-[2rem] bg-gradient-to-b from-brand/10 via-brand/5 to-transparent blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-brand/10">
        <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <div className="ml-3 rounded-md bg-background/60 px-3 py-0.5 text-[11px] text-muted-foreground">
            chatgpt.cheap/dashboard
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <StatCard label="Mention rate" value="72%" delta="+12%" positive />
          <StatCard label="Runs this week" value="4" delta="on schedule" />
          <StatCard label="Competitors found" value="17" delta="3 new" positive />
        </div>

        <div className="mx-5 mb-5 rounded-xl border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Mention rate over time</p>
            <span className="text-[11px] text-muted-foreground">Last 30 days</span>
          </div>
          <MiniChart />
        </div>

        <div className="mx-5 mb-5 rounded-xl border bg-background p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Latest results</p>
          <div className="space-y-2">
            <ResultRow
              query="Best cloud backup for SMB"
              provider="openai"
              mentioned
              sentiment="positive"
              position={2}
            />
            <ResultRow
              query="Top data protection for freelancers"
              provider="gemini"
              mentioned
              sentiment="positive"
              position={1}
            />
            <ResultRow
              query="Reliable backup for 10-person team"
              provider="openai"
              mentioned={false}
              sentiment={null}
              position={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-background/60 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
      <div
        className={`mt-1 inline-flex items-center gap-1 text-[11px] ${positive ? "text-emerald-600" : "text-muted-foreground"}`}
      >
        {positive && <ArrowUpRight className="h-3 w-3" />}
        {delta}
      </div>
    </div>
  );
}

function MiniChart() {
  const points = [20, 25, 30, 28, 35, 45, 42, 52, 58, 50, 65, 72];
  const max = Math.max(...points);
  const width = 400;
  const height = 80;
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => [i * step, height - (p / max) * height] as const);
  const path = coords.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const areaPath = `${path} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-16 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Mention rate trend chart"
    >
      <title>Mention rate trend</title>
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#area)" />
      <path d={path} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function ResultRow({
  query,
  provider,
  mentioned,
  sentiment,
  position,
}: {
  query: string;
  provider: "openai" | "gemini";
  mentioned: boolean;
  sentiment: "positive" | "neutral" | "negative" | null;
  position: number | null;
}) {
  return (
    <div className="flex items-center gap-3 text-xs">
      {mentioned ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <span className="flex-1 truncate">{query}</span>
      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
        {provider}
      </span>
      {sentiment && <span className="text-[11px] text-emerald-600 capitalize">{sentiment}</span>}
      {position && <span className="text-[11px] text-muted-foreground">#{position}</span>}
    </div>
  );
}
