import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand/70 text-[11px] font-bold text-brand-foreground shadow-sm">
              c
            </div>
            <span className="font-semibold tracking-tight">ChatGPT.cheap</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm sm:flex">
            <Link href="/#features" className="text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="/#pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/#faq" className="text-muted-foreground hover:text-foreground">
              FAQ
            </Link>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground">
              Blog
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
            >
              Sign in
            </Link>
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Start monitoring
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand/70 text-[11px] font-bold text-brand-foreground">
                  c
                </div>
                <span className="font-semibold tracking-tight">ChatGPT.cheap</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                AEO monitoring for freelancers, solo founders, and SMBs. Track how your brand
                appears in ChatGPT and Gemini answers — from $9/month.
              </p>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">Product</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/#features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">Account</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-foreground">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground">
                    Get started
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} ChatGPT.cheap</p>
            <p>AEO monitoring for SMB · Built with Next.js, Supabase, OpenAI, Gemini</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
