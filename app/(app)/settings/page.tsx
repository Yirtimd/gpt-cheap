import { redirect } from "next/navigation";
import { BillingSection } from "@/components/billing-section";
import { BrandEditor } from "@/components/brand-editor";
import { Badge } from "@/components/ui/badge";
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
    .select("plan, stripe_customer_id, monthly_cost_cents_used")
    .eq("id", user.id)
    .single();

  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, domain, description")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const brand = brands?.[0];

  const { data: queries } = brand
    ? await supabase
        .from("queries")
        .select("id, prompt_text, is_active")
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: true })
    : { data: null };

  const plan = profile?.plan ?? "starter";
  const usageCents = profile?.monthly_cost_cents_used ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, brand, and billing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Email
            </p>
            <p className="mt-1 truncate text-sm">{user.email}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Plan
            </p>
            <div className="mt-1">
              <Badge className="bg-brand capitalize text-brand-foreground">{plan}</Badge>
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Usage this period
            </p>
            <p className="mt-1 font-mono text-sm">{usageCents}¢</p>
          </div>
        </CardContent>
      </Card>

      {brand && <BrandEditor brand={brand} queries={queries ?? []} />}

      <BillingSection currentPlan={plan} hasStripeCustomer={!!profile?.stripe_customer_id} />
    </div>
  );
}
