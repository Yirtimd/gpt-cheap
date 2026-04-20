"use client";

import { LayoutDashboard, LogOut, Settings, Tag } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
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
      <div className="px-2">
        <Link
          href="/dashboard"
          className="inline-flex items-baseline text-lg font-semibold tracking-[-0.02em]"
        >
          ChatGPT<span className="text-brand">.cheap</span>
        </Link>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          {plan} plan
        </p>
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {brands.length > 0 && (
        <>
          <Separator className="my-5" />
          <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Brands
          </p>
          <ul className="flex flex-col gap-0.5">
            {brands.map((brand) => (
              <li
                key={brand.id}
                className="flex items-center gap-2 truncate rounded-md px-3 py-1.5 text-sm text-foreground/80"
              >
                <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{brand.name}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-auto">
        <Separator className="mb-4" />
        <div className="mb-2 rounded-md bg-muted/50 px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Signed in
          </p>
          <p className="mt-0.5 truncate text-xs text-foreground/90">{user.email}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
