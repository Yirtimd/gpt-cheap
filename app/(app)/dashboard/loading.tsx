import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div>
      <div className="mb-8">
        <Shimmer className="h-9 w-48" />
        <Shimmer className="mt-2 h-4 w-32" />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="mt-2 h-8 w-20" />
            </CardHeader>
            <CardContent>
              <Shimmer className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <Shimmer className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Shimmer className="h-[240px] w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Shimmer className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
