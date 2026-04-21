import { type NextRequest, NextResponse } from "next/server";
import {
  getActiveRunForBrand,
  getLastManualRunForUser,
  userHasAnyRun,
} from "@/lib/db/queries";
import { triggerBrandRun } from "@/lib/pipeline/trigger-run";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MANUAL_COOLDOWN_MS = 24 * 60 * 60 * 1000;

type TriggerRequestBody = {
  brandId?: unknown;
};

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as TriggerRequestBody;
  const brandId = typeof body.brandId === "string" ? body.brandId : null;
  if (!brandId) {
    return NextResponse.json({ error: "brandId is required" }, { status: 400 });
  }

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("id, user_id")
    .eq("id", brandId)
    .maybeSingle();

  if (brandError || !brand || brand.user_id !== user.id) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const admin = createSupabaseAdminClient();

  const active = await getActiveRunForBrand(admin, brandId);
  if (active) {
    return NextResponse.json(
      { error: "A run is already in progress", status: active.status },
      { status: 409 },
    );
  }

  const hasAnyRun = await userHasAnyRun(admin, user.id);

  // First-ever run for the user's brand skips the cooldown — this is the
  // onboarding auto-trigger hook, intentionally callable from the final
  // onboarding step without a separate privileged endpoint.
  const source = hasAnyRun ? "manual" : "onboarding";

  if (source === "manual") {
    const last = await getLastManualRunForUser(admin, user.id);
    if (last) {
      const elapsed = Date.now() - new Date(last.created_at).getTime();
      if (elapsed < MANUAL_COOLDOWN_MS) {
        const retryAfterSeconds = Math.ceil((MANUAL_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            error: "Rate limit: manual runs are limited to 1 per 24 hours",
            retryAfterSeconds,
          },
          { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } },
        );
      }
    }
  }

  await triggerBrandRun({ brandId, userId: user.id, source });

  return NextResponse.json({ queued: true, source });
}
