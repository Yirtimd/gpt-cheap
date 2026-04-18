"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Plan } from "@/lib/db/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  user: { id: string; email: string };
  plan: Plan;
  brands: { id: string; name: string }[];
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
];

export function AppSidebar({ user, plan, brands }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="flex w-64 flex-col border-r bg-muted/30 px-4 py-6">
      <div className="mb-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          ChatGPT.cheap
        </Link>
        <p className="mt-1 text-xs text-muted-foreground capitalize">{plan} plan</p>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              pathname.startsWith(item.href)
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {brands.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="mb-2 px-3 text-xs font-medium text-muted-foreground uppercase">
            Brands
          </div>
          <div className="flex flex-col gap-1">
            {brands.map((brand) => (
              <span
                key={brand.id}
                className="truncate rounded-md px-3 py-1.5 text-sm text-muted-foreground"
              >
                {brand.name}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="mt-auto">
        <Separator className="mb-4" />
        <p className="mb-2 truncate px-3 text-xs text-muted-foreground">{user.email}</p>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}
