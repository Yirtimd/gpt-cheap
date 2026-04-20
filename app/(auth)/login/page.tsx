"use client";

import { ArrowRight, ChevronLeft, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        redirectTo: `${window.location.origin}/auth/callback`,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? `Request failed (${res.status})`);
      return;
    }

    setSent(true);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 px-6 py-8">
      <div aria-hidden className="absolute inset-0 hero-glow opacity-60" />

      <Card className="relative w-full max-w-[26rem] p-0">
        <CardHeader className="gap-2 pt-6">
          <div className="font-semibold tracking-[-0.02em] text-[15px]">
            ChatGPT<span className="text-brand">.cheap</span>
          </div>
          <CardTitle className="mt-1 text-[1.375rem] font-semibold tracking-tight">
            Sign in to ChatGPT.cheap
          </CardTitle>
          <CardDescription>We&rsquo;ll email you a magic link. No passwords.</CardDescription>
        </CardHeader>

        <CardContent className="pb-6">
          {sent ? (
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Mail className="size-6" strokeWidth={2} />
              </div>
              <div className="text-[15px] font-medium">Check your email</div>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a link to <strong className="text-foreground">{email}</strong>. It&rsquo;ll
                expire in 15 minutes.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-5 gap-1.5"
                onClick={() => {
                  setSent(false);
                  setError(null);
                }}
              >
                <ChevronLeft className="size-3.5" />
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  aria-invalid={Boolean(error) || undefined}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="mt-1 h-10 w-full gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send magic link
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <div className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <a href="/legal/terms" className="underline hover:text-foreground">
            Terms
          </a>{" "}
          and{" "}
          <a href="/legal/privacy" className="underline hover:text-foreground">
            Privacy
          </a>
          .
        </div>
      </Card>
    </div>
  );
}
