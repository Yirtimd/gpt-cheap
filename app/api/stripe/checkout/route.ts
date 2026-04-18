import { type NextRequest, NextResponse } from "next/server";
import type { Plan } from "@/lib/db/types";
import { getStripeClient } from "@/lib/stripe/client";
import { PLAN_PRODUCTS } from "@/lib/stripe/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { plan?: string };
  const plan = body.plan as Plan | undefined;

  if (!plan || !PLAN_PRODUCTS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      {
        error: "Stripe not configured",
        stub: true,
        message: `[DEV] Would create checkout for ${plan} plan at $${(PLAN_PRODUCTS[plan].priceCents / 100).toFixed(2)}/mo`,
      },
      { status: 200 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const product = PLAN_PRODUCTS[plan];
  const origin = request.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
    line_items: [{ price: product.stripePriceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/settings?checkout=cancelled`,
    metadata: { userId: user.id, plan },
  });

  return NextResponse.json({ url: session.url });
}
