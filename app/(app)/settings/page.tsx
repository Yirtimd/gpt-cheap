import { redirect } from "next/navigation";
import { BillingSection } from "@/components/billing-section";
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
    .select("plan, stripe_customer_id, monthly_cost_cents_used, billing_period_start")
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

        <BillingSection
          currentPlan={profile?.plan ?? "starter"}
          hasStripeCustomer={!!profile?.stripe_customer_id}
        />
      </div>
    </div>
  );
}
