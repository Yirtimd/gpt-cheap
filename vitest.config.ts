import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 30_000,
    env: {
      // Keep env validation happy during unit tests — no real Supabase hit.
      NEXT_PUBLIC_SUPABASE_URL: "https://stub.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "stub-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "stub-service-key",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
