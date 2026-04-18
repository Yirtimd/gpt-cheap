import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, monthly_cost_cents_used, billing_period_start")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Plan:</span>{" "}
              <span className="capitalize">{profile?.plan ?? "starter"}</span>
            </div>
            <div>
              <span className="font-medium">Usage this period:</span>{" "}
              {profile?.monthly_cost_cents_used ?? 0}¢
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Stripe integration coming soon. You are currently on the{" "}
              <span className="capitalize font-medium">{profile?.plan ?? "starter"}</span> plan.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
