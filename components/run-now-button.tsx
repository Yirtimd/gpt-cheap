"use client";

import { Loader2, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  brandId: string;
  activeRun: boolean;
  cooldownUntil: string | null;
};

function formatRemaining(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function RunNowButton({ brandId, activeRun, cooldownUntil }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!cooldownUntil) return;
    const target = new Date(cooldownUntil).getTime();
    if (target <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const cooldownMs = cooldownUntil ? new Date(cooldownUntil).getTime() - now : 0;
  const onCooldown = cooldownMs > 0;
  const disabled = loading || activeRun || onCooldown;

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/runs/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(payload.error ?? "Failed to start run");
        return;
      }
      toast.success("Run started — results will appear in a few minutes");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  let label: string;
  if (loading) label = "Starting…";
  else if (activeRun) label = "Run in progress…";
  else if (onCooldown) label = `Next run in ${formatRemaining(cooldownMs)}`;
  else label = "Run now";

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      size="sm"
      className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90"
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
      {label}
    </Button>
  );
}
