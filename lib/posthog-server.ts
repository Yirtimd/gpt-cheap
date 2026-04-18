import "server-only";
import { PostHog } from "posthog-node";
import { env } from "@/lib/env";

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!env.POSTHOG_API_KEY) return null;
  if (!_client) {
    _client = new PostHog(env.POSTHOG_API_KEY, {
      host: env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _client;
}

type FunnelEvent =
  | "magic_link_requested"
  | "magic_link_rate_limited"
  | "brand_created"
  | "queries_created"
  | "checkout_started"
  | "checkout_completed"
  | "plan_upgraded"
  | "plan_downgraded"
  | "cost_cap_reached"
  | "global_cap_reached";

export async function captureServerEvent(params: {
  distinctId: string;
  event: FunnelEvent;
  properties?: Record<string, unknown>;
}): Promise<void> {
  const client = getClient();
  if (!client) {
    console.log(`[posthog stub] ${params.event}`, {
      distinctId: params.distinctId,
      ...params.properties,
    });
    return;
  }

  client.capture({
    distinctId: params.distinctId,
    event: params.event,
    properties: params.properties,
  });

  await client.flush();
}
