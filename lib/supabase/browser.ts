import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/types";
import { env } from "@/lib/env";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
