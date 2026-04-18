import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-base font-semibold tracking-tight">
            ChatGPT.cheap
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/#pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground">
              Blog
            </Link>
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-5xl px-4">
          © {new Date().getFullYear()} ChatGPT.cheap — AEO monitoring for SMB
        </div>
      </footer>
    </div>
  );
}
