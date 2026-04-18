import { redirect } from "next/navigation";
import { type ChartDataPoint, MentionChart } from "@/components/mention-chart";
import { type ResultRow, ResultsTable } from "@/components/results-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brands } = await supabase.from("brands").select("id, name").eq("user_id", user.id);

  if (!brands || brands.length === 0) {
    redirect("/onboarding");
  }

  const brandIds = brands.map((b) => b.id);

  const { data: runs } = await supabase
    .from("runs")
    .select("id, status, total_cost_cents, completed_at, brand_id, created_at")
    .in("brand_id", brandIds)
    .order("created_at", { ascending: false })
    .limit(20);

  const runIds = (runs ?? []).map((r) => r.id);

  const { data: results } = await supabase
    .from("results")
    .select(
      "id, run_id, query_id, provider, mentioned, sentiment, position, recommendation_strength, cost_cents, raw_response",
    )
    .in("run_id", runIds.length > 0 ? runIds : ["__none__"])
    .order("created_at", { ascending: false });

  const { data: queries } = await supabase
    .from("queries")
    .select("id, prompt_text, brand_id")
    .in("brand_id", brandIds);

  const queryMap = new Map((queries ?? []).map((q) => [q.id, q]));

  // Stats
  const totalResults = results?.length ?? 0;
  const mentionedCount = results?.filter((r) => r.mentioned).length ?? 0;
  const mentionRate = totalResults > 0 ? Math.round((mentionedCount / totalResults) * 100) : 0;
  const completedRuns = runs?.filter((r) => r.status === "done") ?? [];

  // Chart data: per-run mention rate
  const chartData: ChartDataPoint[] = completedRuns
    .slice(0, 10)
    .reverse()
    .map((run) => {
      const runResults = results?.filter((r) => r.run_id === run.id) ?? [];
      const runMentioned = runResults.filter((r) => r.mentioned).length;
      const rate = runResults.length > 0 ? Math.round((runMentioned / runResults.length) * 100) : 0;
      return {
        date: run.completed_at
          ? new Date(run.completed_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "—",
        mentionRate: rate,
        totalResults: runResults.length,
        mentionedCount: runMentioned,
      };
    });

  // Results table data (latest 20)
  const tableData: ResultRow[] = (results ?? []).slice(0, 20).map((r) => {
    const q = queryMap.get(r.query_id);
    const run = runs?.find((run) => run.id === r.run_id);
    return {
      id: r.id,
      queryText: q?.prompt_text ?? "Unknown query",
      provider: r.provider,
      mentioned: r.mentioned,
      sentiment: r.sentiment,
      position: r.position,
      recommendation: r.recommendation_strength,
      costCents: r.cost_cents,
      completedAt: run?.completed_at ?? null,
      runId: r.run_id,
      queryId: r.query_id,
    };
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mention Rate</CardDescription>
            <CardTitle className="text-3xl">{mentionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {mentionedCount} / {totalResults} results
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Runs</CardDescription>
            <CardTitle className="text-3xl">{completedRuns.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {runs?.filter((r) => r.status === "running").length ?? 0} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Brands</CardDescription>
            <CardTitle className="text-3xl">{brands.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{brands.map((b) => b.name).join(", ")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <MentionChart data={chartData} />
      </div>

      <ResultsTable results={tableData} />
    </div>
  );
}
