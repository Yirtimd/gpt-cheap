"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [message, setMessage] = useState<string | null>(null);

  async function handleSaveBrand() {
    setSaving(true);
    setMessage(null);
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
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Saved");
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
      setMessage(`Error: ${error.message}`);
      return;
    }

    setQueries([...queries, data]);
    setNewQuery("");
    router.refresh();
  }

  async function handleToggleQuery(queryId: string, isActive: boolean) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("queries").update({ is_active: !isActive }).eq("id", queryId);
    setQueries(queries.map((q) => (q.id === queryId ? { ...q, is_active: !isActive } : q)));
    router.refresh();
  }

  async function handleDeleteQuery(queryId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("queries").delete().eq("id", queryId);
    setQueries(queries.filter((q) => q.id !== queryId));
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Brand Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="brand-name">Name</Label>
            <Input id="brand-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="brand-domain">Domain</Label>
            <Input id="brand-domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
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
        </CardContent>
        <CardFooter className="flex items-center gap-3">
          <Button onClick={handleSaveBrand} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Queries</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {queries.map((q) => (
            <div key={q.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
              <span
                className={`flex-1 text-sm ${q.is_active ? "" : "text-muted-foreground line-through"}`}
              >
                {q.prompt_text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleQuery(q.id, q.is_active)}
              >
                {q.is_active ? "Pause" : "Resume"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteQuery(q.id)}>
                Delete
              </Button>
            </div>
          ))}

          <div className="flex gap-2">
            <Input
              placeholder="New query prompt..."
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddQuery()}
            />
            <Button onClick={handleAddQuery} disabled={!newQuery.trim()}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
