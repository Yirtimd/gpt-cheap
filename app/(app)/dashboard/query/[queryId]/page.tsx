import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
      <mark
        key={`hl-${i.toString()}`}
        className="rounded bg-yellow-200 px-0.5 text-foreground dark:bg-yellow-900/60 dark:text-yellow-100"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function sentimentVariant(s: string | null): "default" | "secondary" | "destructive" | "outline" {
  if (s === "positive") return "default";
  if (s === "negative") return "destructive";
  return "secondary";
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
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Query detail</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Query detail</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {brand.name}
          {brand.domain && <span className="text-muted-foreground/70"> · {brand.domain}</span>}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Prompt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{query.prompt_text}</p>
        </CardContent>
      </Card>

      {(!results || results.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No results for this query yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {results?.map((r) => (
          <Card key={r.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono uppercase">
                    {r.provider}
                  </Badge>
                  {r.mentioned ? (
                    <Badge className="bg-brand text-brand-foreground">Mentioned</Badge>
                  ) : (
                    <Badge variant="secondary">Not mentioned</Badge>
                  )}
                  {r.position && <Badge variant="outline">#{r.position}</Badge>}
                  {r.sentiment && (
                    <Badge variant={sentimentVariant(r.sentiment)} className="capitalize">
                      {r.sentiment}
                    </Badge>
                  )}
                  {r.recommendation_strength && (
                    <Badge variant="outline" className="capitalize">
                      {r.recommendation_strength}
                    </Badge>
                  )}
                </div>
                <span className="font-mono text-xs text-muted-foreground">{r.cost_cents}¢</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {r.context_quote && (
                <div className="quote">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Context quote
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{r.context_quote}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Full response
                </p>
                <div className="max-h-64 overflow-y-auto rounded-md border bg-muted/30 p-3 text-sm leading-relaxed">
                  {highlightBrand(r.raw_response, brand.name)}
                </div>
              </div>

              {(r.competitors_mentioned as string[])?.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Competitors
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(r.competitors_mentioned as string[]).map((c) => (
                      <Badge key={c} variant="secondary">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(r.citations as { url: string; title?: string }[])?.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Citations
                  </p>
                  <ul className="mt-1.5 space-y-1 text-sm">
                    {(r.citations as { url: string; title?: string }[]).map((c) => (
                      <li key={c.url}>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand hover:underline"
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
