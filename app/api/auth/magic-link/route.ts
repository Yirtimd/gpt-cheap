import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Database } from "@/lib/db/types";
import { env } from "@/lib/env";
import { captureServerEvent } from "@/lib/posthog-server";
import { limitSignup } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().url(),
});

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { email, redirectTo } = parsed.data;
  const ip = getClientIp(request);

  // Dual-key rate limit: by email and by IP. Stricter of the two wins.
  const [emailLimit, ipLimit] = await Promise.all([
    limitSignup(`email:${email.toLowerCase()}`),
    limitSignup(`ip:${ip}`),
  ]);

  if (!emailLimit.success || !ipLimit.success) {
    await captureServerEvent({
      distinctId: email,
      event: "magic_link_rate_limited",
      properties: { ip, emailLimit, ipLimit },
    });
    return NextResponse.json(
      {
        error: "Too many requests. Try again in a few minutes.",
        retryAfter: Math.max(emailLimit.reset, ipLimit.reset),
      },
      { status: 429 },
    );
  }

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // no-op: route handler does not need to persist cookies here
        },
      },
    },
  );

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await captureServerEvent({
    distinctId: email,
    event: "magic_link_requested",
    properties: { rate_limit_stub: emailLimit.stub ?? false },
  });

  return NextResponse.json({ ok: true });
}
