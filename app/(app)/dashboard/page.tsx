import { redirect } from "next/navigation";
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

  const { data: latestRuns } = await supabase
    .from("runs")
    .select("id, status, total_cost_cents, completed_at, brand_id")
    .in(
      "brand_id",
      brands.map((b) => b.id),
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: results } = await supabase
    .from("results")
    .select("mentioned, provider, run_id")
    .in(
      "run_id",
      (latestRuns ?? []).map((r) => r.id),
    );

  const totalRuns = latestRuns?.length ?? 0;
  const totalResults = results?.length ?? 0;
  const mentionedCount = results?.filter((r) => r.mentioned).length ?? 0;
  const mentionRate = totalResults > 0 ? Math.round((mentionedCount / totalResults) * 100) : 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
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
            <CardDescription>Recent Runs</CardDescription>
            <CardTitle className="text-3xl">{totalRuns}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {latestRuns?.filter((r) => r.status === "done").length ?? 0} completed
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

      {totalRuns === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No runs yet. Your first monitoring run will happen automatically based on your plan
              schedule.
            </p>
          </CardContent>
        </Card>
      )}

      {totalRuns > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {latestRuns?.map((run) => {
                const brand = brands.find((b) => b.id === run.brand_id);
                const runResults = results?.filter((r) => r.run_id === run.id) ?? [];
                const runMentioned = runResults.filter((r) => r.mentioned).length;
                return (
                  <div
                    key={run.id}
                    className="flex items-center justify-between rounded-md border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{brand?.name ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {run.completed_at
                          ? new Date(run.completed_at).toLocaleDateString()
                          : run.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {runMentioned}/{runResults.length} mentioned
                      </p>
                      <p className="text-xs text-muted-foreground">{run.total_cost_cents}¢ cost</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
