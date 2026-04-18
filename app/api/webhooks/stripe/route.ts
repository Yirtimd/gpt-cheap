import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/env";
import { captureServerEvent } from "@/lib/posthog-server";
import { getStripeClient } from "@/lib/stripe/client";
import { planFromPriceId } from "@/lib/stripe/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const headerStore = await headers();
  const sig = headerStore.get("stripe-signature");

  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = createSupabaseAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id;

      if (!userId) break;

      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      if (subscriptionId && customerId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? planFromPriceId(priceId) : null;

        await db
          .from("profiles")
          .update({
            plan: plan ?? "starter",
            stripe_customer_id: customerId,
            billing_period_start: new Date().toISOString(),
            monthly_cost_cents_used: 0,
          })
          .eq("id", userId);

        await captureServerEvent({
          distinctId: userId,
          event: "checkout_completed",
          properties: { plan, customerId },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;

      if (customerId) {
        await db.from("profiles").update({ plan: "starter" }).eq("stripe_customer_id", customerId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = priceId ? planFromPriceId(priceId) : null;

      if (customerId && plan) {
        await db
          .from("profiles")
          .update({
            plan,
            billing_period_start: new Date().toISOString(),
            monthly_cost_cents_used: 0,
          })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

      if (customerId) {
        await db
          .from("profiles")
          .update({
            billing_period_start: new Date().toISOString(),
            monthly_cost_cents_used: 0,
          })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
