"use client";

import { Pause, Play, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Brand = {
  id: string;
  name: string;
  domain: string | null;
  description: string | null;
};

type Query = {
  id: string;
  prompt_text: string;
  is_active: boolean;
};

type Props = {
  brand: Brand;
  queries: Query[];
};

export function BrandEditor({ brand, queries: initialQueries }: Props) {
  const router = useRouter();
  const [name, setName] = useState(brand.name);
  const [domain, setDomain] = useState(brand.domain ?? "");
  const [description, setDescription] = useState(brand.description ?? "");
  const [queries, setQueries] = useState(initialQueries);
  const [newQuery, setNewQuery] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSaveBrand() {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from("brands")
      .update({
        name: name.trim(),
        domain: domain.trim() || null,
        description: description.trim() || null,
      })
      .eq("id", brand.id);

    setSaving(false);
    if (error) {
      toast.error(`Could not save: ${error.message}`);
    } else {
      toast.success("Brand updated");
      router.refresh();
    }
  }

  async function handleAddQuery() {
    if (!newQuery.trim()) return;
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("queries")
      .insert({ brand_id: brand.id, prompt_text: newQuery.trim() })
      .select("id, prompt_text, is_active")
      .single();

    if (error) {
      toast.error(`Could not add query: ${error.message}`);
      return;
    }

    setQueries([...queries, data]);
    setNewQuery("");
    toast.success("Query added");
    router.refresh();
  }

  async function handleToggleQuery(queryId: string, isActive: boolean) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("queries")
      .update({ is_active: !isActive })
      .eq("id", queryId);
    if (error) {
      toast.error(`Could not update: ${error.message}`);
      return;
    }
    setQueries(queries.map((q) => (q.id === queryId ? { ...q, is_active: !isActive } : q)));
    router.refresh();
  }

  async function handleDeleteQuery(queryId: string) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("queries").delete().eq("id", queryId);
    if (error) {
      toast.error(`Could not delete: ${error.message}`);
      return;
    }
    setQueries(queries.filter((q) => q.id !== queryId));
    toast.success("Query deleted");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Brand</CardTitle>
        <CardDescription>Edit brand info and monitoring queries.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="brand-name">Name</Label>
            <Input id="brand-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="brand-domain">Domain</Label>
            <Input
              id="brand-domain"
              placeholder="acme.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="brand-desc">Description</Label>
          <Textarea
            id="brand-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <Button onClick={handleSaveBrand} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : "Save brand"}
          </Button>
        </div>

        <Separator />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Queries</p>
              <p className="text-xs text-muted-foreground">
                Prompts sent to ChatGPT and Gemini on each run.
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              {queries.filter((q) => q.is_active).length} active / {queries.length} total
            </span>
          </div>

          <div className="space-y-2">
            {queries.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-2 rounded-md border bg-background px-3 py-2"
              >
                <span
                  className={`flex-1 text-sm ${
                    q.is_active ? "" : "text-muted-foreground line-through"
                  }`}
                >
                  {q.prompt_text}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleToggleQuery(q.id, q.is_active)}
                >
                  {q.is_active ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      Resume
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteQuery(q.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2 pt-1">
              <Input
                placeholder="New query prompt..."
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddQuery()}
              />
              <Button onClick={handleAddQuery} disabled={!newQuery.trim()} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
