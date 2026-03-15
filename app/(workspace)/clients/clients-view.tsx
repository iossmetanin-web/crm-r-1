"use client";

import { Mail, Phone, Plus, Save, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ClientRow = {
  id: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  email: string | null;
  stage: string | null;
  created_at: string | null;
};

type ClientFormState = {
  name: string;
  company: string;
  phone: string;
  email: string;
  stage: string;
};

const stageOptions = ["lead", "contact", "negotiation", "won", "lost"];

function stageLabel(stage: string | null) {
  const value = (stage ?? "").toLowerCase();
  if (value === "lead") return "Лид";
  if (value === "contact") return "Контакт";
  if (value === "negotiation") return "Переговоры";
  if (value === "won") return "Выиграно";
  if (value === "lost") return "Проиграно";
  return stage || "Без этапа";
}

function stageBadgeVariant(stage: string | null) {
  const value = (stage ?? "").toLowerCase();
  if (value === "won") return "default" as const;
  if (value === "lost") return "destructive" as const;
  if (value === "negotiation") return "secondary" as const;
  return "outline" as const;
}

const emptyForm: ClientFormState = {
  name: "",
  company: "",
  phone: "",
  email: "",
  stage: "lead",
};

export function ClientsView() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [createForm, setCreateForm] = useState<ClientFormState>(emptyForm);
  const [editForm, setEditForm] = useState<ClientFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const filteredClients = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return clients;
    return clients.filter((client) =>
      [client.name, client.company, client.email, client.phone]
        .map((value) => (value ?? "").toLowerCase())
        .some((value) => value.includes(normalized)),
    );
  }, [clients, query]);

  const selectedClient = filteredClients.find((client) => client.id === selectedId) ?? clients.find((client) => client.id === selectedId);

  const loadClients = async () => {
    setLoading(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase не подключен.");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const nextClients = (data as ClientRow[]) ?? [];
    setClients(nextClients);

    if (nextClients.length > 0) {
      setSelectedId((current) => current || nextClients[0].id);
    } else {
      setSelectedId("");
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadClients();
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    setEditForm({
      name: selectedClient.name ?? "",
      company: selectedClient.company ?? "",
      phone: selectedClient.phone ?? "",
      email: selectedClient.email ?? "",
      stage: selectedClient.stage ?? "lead",
    });
  }, [selectedClient]);

  const onCreateClient = async () => {
    setCreating(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase не подключен.");
      setCreating(false);
      return;
    }

    const payload = {
      name: createForm.name || null,
      company: createForm.company || null,
      phone: createForm.phone || null,
      email: createForm.email || null,
      stage: createForm.stage || "lead",
    };

    const { data, error: insertError } = await supabase.from("clients").insert(payload).select("*").single();
    if (insertError) {
      setError(insertError.message);
      setCreating(false);
      return;
    }

    const created = data as ClientRow;
    setClients((current) => [created, ...current]);
    setSelectedId(created.id);
    setCreateForm(emptyForm);
    setCreating(false);
  };

  const onSaveClient = async () => {
    if (!selectedClient) return;
    setSaving(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase не подключен.");
      setSaving(false);
      return;
    }

    const payload = {
      name: editForm.name || null,
      company: editForm.company || null,
      phone: editForm.phone || null,
      email: editForm.email || null,
      stage: editForm.stage || null,
    };

    const { data, error: updateError } = await supabase
      .from("clients")
      .update(payload)
      .eq("id", selectedClient.id)
      .select("*")
      .single();

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    const updated = data as ClientRow;
    setClients((current) => current.map((client) => (client.id === updated.id ? updated : client)));
    setSaving(false);
  };

  const onDeleteClient = async () => {
    if (!selectedClient) return;
    setRemoving(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase не подключен.");
      setRemoving(false);
      return;
    }

    const { error: deleteError } = await supabase.from("clients").delete().eq("id", selectedClient.id);
    if (deleteError) {
      setError(deleteError.message);
      setRemoving(false);
      return;
    }

    setClients((current) => current.filter((client) => client.id !== selectedClient.id));
    setSelectedId("");
    setRemoving(false);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Клиенты</p>
          <h1 className="font-display text-3xl font-semibold">Управление клиентами</h1>
        </div>
        <Button variant="outline" onClick={() => void loadClients()} disabled={loading}>
          Обновить
        </Button>
      </div>

      {error ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1.4fr]">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-3">
            <CardTitle className="text-lg">Список клиентов</CardTitle>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск клиента" className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
              <p className="mb-2 text-sm font-medium">Добавить клиента</p>
              <div className="grid gap-2">
                <Input
                  value={createForm.name}
                  onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Имя"
                />
                <Input
                  value={createForm.company}
                  onChange={(event) => setCreateForm((current) => ({ ...current, company: event.target.value }))}
                  placeholder="Компания"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={createForm.email}
                    onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Email"
                  />
                  <Input
                    value={createForm.phone}
                    onChange={(event) => setCreateForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Телефон"
                  />
                </div>
                <select
                  value={createForm.stage}
                  onChange={(event) => setCreateForm((current) => ({ ...current, stage: event.target.value }))}
                  className="h-10 rounded-xl border border-input bg-card/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {stageOptions.map((option) => (
                    <option key={option} value={option}>
                      {stageLabel(option)}
                    </option>
                  ))}
                </select>
                <Button onClick={onCreateClient} disabled={creating || !createForm.name.trim()}>
                  <Plus className="mr-2 h-4 w-4" />
                  {creating ? "Добавление..." : "Добавить клиента"}
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[380px] pr-2">
              <div className="space-y-2">
                {loading ? <p className="text-sm text-muted-foreground">Загрузка клиентов...</p> : null}
                {!loading && filteredClients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Список пуст. Добавьте первого клиента.</p>
                ) : null}
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-colors",
                      selectedClient?.id === client.id
                        ? "border-primary/55 bg-primary/10"
                        : "border-border/60 bg-secondary/20 hover:bg-secondary/45",
                    )}
                    onClick={() => setSelectedId(client.id)}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{client.name || "Без имени"}</p>
                      <Badge variant={stageBadgeVariant(client.stage)}>{stageLabel(client.stage)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{client.company || "Без компании"}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Карточка клиента</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedClient ? (
              <p className="text-sm text-muted-foreground">Выберите клиента из списка слева.</p>
            ) : (
              <>
                <Input
                  value={editForm.name}
                  onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Имя клиента"
                />
                <Input
                  value={editForm.company}
                  onChange={(event) => setEditForm((current) => ({ ...current, company: event.target.value }))}
                  placeholder="Компания"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={editForm.email}
                    onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Email"
                  />
                  <Input
                    value={editForm.phone}
                    onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Телефон"
                  />
                </div>
                <select
                  value={editForm.stage}
                  onChange={(event) => setEditForm((current) => ({ ...current, stage: event.target.value }))}
                  className="h-10 rounded-xl border border-input bg-card/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {stageOptions.map((option) => (
                    <option key={option} value={option}>
                      {stageLabel(option)}
                    </option>
                  ))}
                </select>

                <div className="rounded-xl border border-border/70 bg-secondary/20 p-3 text-sm text-muted-foreground">
                  <p className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedClient.email || "Email не указан"}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {selectedClient.phone || "Телефон не указан"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={onSaveClient} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Сохранение..." : "Сохранить"}
                  </Button>
                  <Button variant="destructive" onClick={onDeleteClient} disabled={removing}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {removing ? "Удаление..." : "Удалить"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
