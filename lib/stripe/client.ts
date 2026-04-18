import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";

let _stripe: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" });
  }
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY;
}
