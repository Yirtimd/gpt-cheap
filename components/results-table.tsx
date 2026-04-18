import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ResultRow = {
  id: string;
  queryText: string;
  provider: string;
  mentioned: boolean;
  sentiment: string | null;
  position: number | null;
  recommendation: string | null;
  costCents: number;
  completedAt: string | null;
  runId: string;
  queryId: string;
};

type Props = {
  results: ResultRow[];
};

function SentimentBadge({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return <span className="text-muted-foreground">—</span>;
  const colors: Record<string, string> = {
    positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[sentiment] ?? ""}`}
    >
      {sentiment}
    </span>
  );
}

export function ResultsTable({ results }: Props) {
  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No results yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Query</th>
                <th className="pb-2 pr-4 font-medium">Provider</th>
                <th className="pb-2 pr-4 font-medium">Mentioned</th>
                <th className="pb-2 pr-4 font-medium">Pos</th>
                <th className="pb-2 pr-4 font-medium">Sentiment</th>
                <th className="pb-2 pr-4 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="max-w-[200px] truncate py-2.5 pr-4">
                    <a
                      href={`/dashboard/query/${r.queryId}?run=${r.runId}`}
                      className="hover:underline"
                    >
                      {r.queryText}
                    </a>
                  </td>
                  <td className="py-2.5 pr-4 capitalize">{r.provider}</td>
                  <td className="py-2.5 pr-4">
                    {r.mentioned ? (
                      <span className="font-medium text-green-600">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">{r.position ?? "—"}</td>
                  <td className="py-2.5 pr-4">
                    <SentimentBadge sentiment={r.sentiment} />
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.costCents}¢</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
