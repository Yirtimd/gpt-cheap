import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const stripe = getStripeClient();
  if (!stripe || !profile?.stripe_customer_id) {
    return NextResponse.json(
      {
        error: "Stripe not configured or no customer ID",
        stub: true,
        message: "[DEV] Would redirect to Stripe Customer Portal",
      },
      { status: 200 },
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
