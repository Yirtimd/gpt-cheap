import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-[-0.02em] ${className}`}>
      ChatGPT<span className="text-brand">.cheap</span>
    </span>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[75rem] items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/">
              <Wordmark className="text-[15px]" />
            </Link>
            <nav className="hidden items-center gap-6 text-[13px] text-muted-foreground sm:flex">
              <Link href="/#features" className="hover:text-foreground">
                Features
              </Link>
              <Link href="/#pricing" className="hover:text-foreground">
                Pricing
              </Link>
              <Link href="/#faq" className="hover:text-foreground">
                FAQ
              </Link>
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className={buttonVariants({
                size: "sm",
                className: "bg-brand text-brand-foreground hover:bg-brand/90",
              })}
            >
              Start monitoring
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t px-6 pt-12 pb-6">
        <div className="mx-auto max-w-[75rem]">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link href="/">
                <Wordmark className="text-base" />
              </Link>
              <p className="mt-3 max-w-sm text-[13px] text-muted-foreground">
                AEO monitoring for solo founders and small teams. From $9/month.
              </p>
            </div>

            <FooterColumn
              heading="Product"
              items={[
                { label: "Features", href: "/#features" },
                { label: "Pricing", href: "/#pricing" },
                { label: "FAQ", href: "/#faq" },
                { label: "Blog", href: "/blog" },
              ]}
            />

            <FooterColumn
              heading="Account"
              items={[
                { label: "Sign in", href: "/login" },
                { label: "Get started", href: "/login" },
              ]}
            />

            <FooterColumn
              heading="Legal"
              items={[
                { label: "Privacy", href: "/legal/privacy" },
                { label: "Terms", href: "/legal/terms" },
                { label: "Refund policy", href: "/legal/refund" },
              ]}
            />
          </div>

          <div className="mt-10 border-t pt-5 text-xs text-muted-foreground">
            © {new Date().getFullYear()} ChatGPT.cheap · Not affiliated with OpenAI.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  heading,
  items,
}: {
  heading: string;
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {heading}
      </p>
      <ul className="space-y-2 text-[13px]">
        {items.map((it) => (
          <li key={it.label}>
            <Link href={it.href} className="hover:text-foreground">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
