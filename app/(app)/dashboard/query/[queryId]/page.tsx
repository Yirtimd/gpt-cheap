import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ queryId: string }>;
  searchParams: Promise<{ run?: string }>;
};

function highlightBrand(text: string, brandName: string): React.ReactNode[] {
  if (!brandName) return [text];
  const regex = new RegExp(`(${brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={`hl-${i.toString()}`} className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-800">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export default async function QueryDetailPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: query } = await supabase
    .from("queries")
    .select("id, prompt_text, brand_id")
    .eq("id", params.queryId)
    .single();

  if (!query) redirect("/dashboard");

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name, domain, user_id")
    .eq("id", query.brand_id)
    .single();

  if (!brand || brand.user_id !== user.id) redirect("/dashboard");

  let resultsQuery = supabase
    .from("results")
    .select(
      "id, run_id, provider, replication_index, raw_response, mentioned, position, sentiment, recommendation_strength, context_quote, citations, competitors_mentioned, cost_cents, created_at",
    )
    .eq("query_id", params.queryId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (searchParams.run) {
    resultsQuery = resultsQuery.eq("run_id", searchParams.run);
  }

  const { data: results } = await resultsQuery;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Query Detail</h1>
        <p className="mt-1 text-sm text-muted-foreground">{brand.name}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{query.prompt_text}</p>
        </CardContent>
      </Card>

      {(!results || results.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No results for this query yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {results?.map((r) => (
          <Card key={r.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                    {r.provider}
                  </span>
                  {r.mentioned ? (
                    <span className="text-xs font-medium text-green-600">Mentioned</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not mentioned</span>
                  )}
                  {r.position && (
                    <span className="text-xs text-muted-foreground">#{r.position}</span>
                  )}
                  {r.sentiment && (
                    <span className="text-xs text-muted-foreground capitalize">{r.sentiment}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{r.cost_cents}¢</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {r.context_quote && (
                <div className="rounded-md border-l-2 border-primary bg-muted/50 px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground">Context quote</p>
                  <p className="mt-1 text-sm">{r.context_quote}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Full response</p>
                <div className="max-h-64 overflow-y-auto rounded-md bg-muted/30 p-3 text-sm leading-relaxed">
                  {highlightBrand(r.raw_response, brand.name)}
                </div>
              </div>

              {(r.competitors_mentioned as string[])?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Competitors</p>
                  <p className="mt-1 text-sm">{(r.competitors_mentioned as string[]).join(", ")}</p>
                </div>
              )}

              {(r.citations as { url: string; title?: string }[])?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Citations</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {(r.citations as { url: string; title?: string }[]).map((c) => (
                      <li key={c.url}>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {c.title ?? c.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
