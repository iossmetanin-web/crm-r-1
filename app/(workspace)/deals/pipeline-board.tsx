"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  UniqueIdentifier,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, CircleDollarSign, Plus, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn, formatCurrency } from "@/lib/utils";

type StageRow = {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  probability: number | null;
  color: string | null;
  is_won: boolean;
  is_closed: boolean;
};

type DealRow = {
  id: string;
  title: string | null;
  value: number | null;
  currency: string | null;
  client_id: string | null;
  pipeline_id: string | null;
  stage_id: string | null;
  owner_id: string | null;
  status: string | null;
  created_at: string | null;
  probability: number | null;
  expected_close_date: string | null;
  source: string | null;
  priority: string | null;
  lost_reason: string | null;
};

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
};

type ClientRow = {
  id: string;
  name: string | null;
  company: string | null;
};

type BoardDeal = DealRow & {
  owner_name: string;
  client_name: string;
};

type CreateDealForm = {
  title: string;
  value: string;
  stageId: string;
  ownerId: string;
  clientId: string;
  priority: string;
};

function priorityVariant(priority: string | null) {
  const value = (priority ?? "").toLowerCase();
  if (value === "high") return "destructive" as const;
  if (value === "medium") return "default" as const;
  return "secondary" as const;
}

function priorityLabel(priority: string | null) {
  const value = (priority ?? "").toLowerCase();
  if (value === "high") return "Высокий";
  if (value === "medium") return "Средний";
  if (value === "low") return "Низкий";
  return "Не задан";
}

function DealCard({ deal, dragOverlay = false }: { deal: BoardDeal; dragOverlay?: boolean }) {
  return (
    <Card
      className={cn(
        "space-y-3 rounded-2xl border-border/70 p-4 transition-transform duration-200",
        dragOverlay && "rotate-1 shadow-2xl",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{deal.title || "Без названия"}</p>
          <p className="text-xs text-muted-foreground">{deal.client_name}</p>
        </div>
        <Badge variant={priorityVariant(deal.priority)}>{priorityLabel(deal.priority)}</Badge>
      </div>

      <div className="grid gap-1 text-xs text-muted-foreground">
        <p className="inline-flex items-center gap-1">
          <CircleDollarSign className="h-3.5 w-3.5 text-primary" />
          {formatCurrency(deal.value ?? 0)}
        </p>
        <p className="inline-flex items-center gap-1">
          <UserRound className="h-3.5 w-3.5 text-accent" />
          {deal.owner_name}
        </p>
        <p className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString("ru-RU") : "Без срока"}
        </p>
      </div>
    </Card>
  );
}

function SortableDealCard({ deal }: { deal: BoardDeal }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-60")} {...attributes} {...listeners}>
      <DealCard deal={deal} />
    </div>
  );
}

function PipelineColumn({
  stage,
  deals,
}: {
  stage: StageRow;
  deals: BoardDeal[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "glass-panel flex h-full min-h-[420px] flex-col rounded-2xl border-border/60 p-3",
        isOver && "border-primary/60 bg-primary/10",
      )}
    >
      <div className="mb-3 rounded-xl border border-border/70 bg-secondary/30 p-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-semibold">{stage.name}</p>
          <span className="rounded-full bg-background/75 px-2 py-0.5 text-xs">{deals.length}</span>
        </div>
        <p className="text-xs text-muted-foreground">Вероятность: {stage.probability ?? 0}%</p>
      </div>

      <SortableContext items={deals.map((deal) => deal.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {deals.map((deal) => (
            <SortableDealCard key={deal.id} deal={deal} />
          ))}
          {deals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 py-8 text-center text-xs text-muted-foreground">
              Перетащите сделку сюда
            </div>
          ) : null}
        </div>
      </SortableContext>
    </div>
  );
}

export function DealsBoard() {
  const [stages, setStages] = useState<StageRow[]>([]);
  const [columns, setColumns] = useState<Record<string, BoardDeal[]>>({});
  const [users, setUsers] = useState<UserRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [activeDeal, setActiveDeal] = useState<BoardDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateDealForm>({
    title: "",
    value: "",
    stageId: "",
    ownerId: "",
    clientId: "",
    priority: "medium",
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const totals = useMemo(() => {
    return stages.map((stage) => ({
      stageId: stage.id,
      total: (columns[stage.id] || []).reduce((sum, deal) => sum + (deal.value ?? 0), 0),
    }));
  }, [stages, columns]);

  const makeDeal = (deal: DealRow, usersMap: Map<string, string>, clientsMap: Map<string, string>): BoardDeal => ({
    ...deal,
    owner_name: usersMap.get(deal.owner_id ?? "") || "Без владельца",
    client_name: clientsMap.get(deal.client_id ?? "") || "Без клиента",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase не подключен.");
      setLoading(false);
      return;
    }

    const [stagesRes, dealsRes, usersRes, clientsRes] = await Promise.all([
      supabase.from("pipeline_stages").select("*").order("position", { ascending: true }),
      supabase.from("deals").select("*"),
      supabase.from("crm_users").select("id,name,email"),
      supabase.from("clients").select("id,name,company"),
    ]);

    if (stagesRes.error) {
      setError(stagesRes.error.message);
      setLoading(false);
      return;
    }
    if (dealsRes.error) {
      setError(dealsRes.error.message);
      setLoading(false);
      return;
    }
    if (usersRes.error) {
      setError(usersRes.error.message);
      setLoading(false);
      return;
    }
    if (clientsRes.error) {
      setError(clientsRes.error.message);
      setLoading(false);
      return;
    }

    const nextStages = (stagesRes.data as StageRow[]) ?? [];
    const nextDeals = (dealsRes.data as DealRow[]) ?? [];
    const nextUsers = (usersRes.data as UserRow[]) ?? [];
    const nextClients = (clientsRes.data as ClientRow[]) ?? [];

    const usersMap = new Map(nextUsers.map((user) => [user.id, user.name || user.email || user.id]));
    const clientsMap = new Map(nextClients.map((client) => [client.id, client.name || client.company || client.id]));

    const nextColumns: Record<string, BoardDeal[]> = {};
    for (const stage of nextStages) {
      nextColumns[stage.id] = [];
    }
    for (const deal of nextDeals) {
      const mapped = makeDeal(deal, usersMap, clientsMap);
      if (deal.stage_id && nextColumns[deal.stage_id]) {
        nextColumns[deal.stage_id].push(mapped);
      }
    }

    setStages(nextStages);
    setColumns(nextColumns);
    setUsers(nextUsers);
    setClients(nextClients);

    if (nextStages.length > 0) {
      setForm((current) => ({
        ...current,
        stageId: current.stageId || nextStages[0].id,
        ownerId: current.ownerId || (nextUsers[0]?.id ?? ""),
      }));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const findContainer = (id: UniqueIdentifier, source: Record<string, BoardDeal[]>) => {
    if (source[String(id)]) return String(id);
    return Object.keys(source).find((stageId) => source[stageId].some((deal) => deal.id === id)) ?? null;
  };

  const onDragStart = (event: DragStartEvent) => {
    const activeContainer = findContainer(event.active.id, columns);
    if (!activeContainer) return;
    const deal = columns[activeContainer].find((item) => item.id === event.active.id) ?? null;
    setActiveDeal(deal);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveDeal(null);
    if (!over) return;

    const activeContainer = findContainer(active.id, columns);
    const overContainer = findContainer(over.id, columns);
    if (!activeContainer || !overContainer) return;

    let movedDealId = "";
    let movedToStageId = "";

    setColumns((current) => {
      const activeItems = current[activeContainer];
      const overItems = current[overContainer];
      const activeIndex = activeItems.findIndex((item) => item.id === active.id);
      if (activeIndex < 0) return current;

      if (activeContainer === overContainer) {
        const overIndex = overItems.findIndex((item) => item.id === over.id);
        if (overIndex < 0) return current;
        return {
          ...current,
          [activeContainer]: arrayMove(activeItems, activeIndex, overIndex),
        };
      }

      const movedDeal = activeItems[activeIndex];
      movedDealId = movedDeal.id;
      movedToStageId = overContainer;

      const nextActive = activeItems.filter((item) => item.id !== active.id);
      const overIndex = overItems.findIndex((item) => item.id === over.id);
      const insertIndex = current[overContainer] && over.id === overContainer ? overItems.length : Math.max(overIndex, 0);
      const nextOver = [
        ...overItems.slice(0, insertIndex),
        { ...movedDeal, stage_id: overContainer },
        ...overItems.slice(insertIndex),
      ];

      return {
        ...current,
        [activeContainer]: nextActive,
        [overContainer]: nextOver,
      };
    });

    if (!movedDealId || !movedToStageId) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const targetStage = stages.find((stage) => stage.id === movedToStageId);
    const { error: updateError } = await supabase
      .from("deals")
      .update({
        stage_id: movedToStageId,
        pipeline_id: targetStage?.pipeline_id || null,
      })
      .eq("id", movedDealId);

    if (updateError) {
      setError(updateError.message);
      await loadData();
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    void handleDragEnd(event);
  };

  const onCreateDeal = async () => {
    if (!form.title.trim() || !form.stageId) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const selectedStage = stages.find((stage) => stage.id === form.stageId);
    if (!selectedStage) return;

    setCreating(true);
    setError("");

    const payload = {
      title: form.title.trim(),
      value: Number(form.value || 0),
      currency: "USD",
      stage_id: form.stageId,
      pipeline_id: selectedStage.pipeline_id,
      owner_id: form.ownerId || null,
      client_id: form.clientId || null,
      status: "open",
      priority: form.priority || null,
    };

    const { data, error: insertError } = await supabase.from("deals").insert(payload).select("*").single();
    if (insertError) {
      setError(insertError.message);
      setCreating(false);
      return;
    }

    const usersMap = new Map(users.map((user) => [user.id, user.name || user.email || user.id]));
    const clientsMap = new Map(clients.map((client) => [client.id, client.name || client.company || client.id]));
    const createdDeal = makeDeal(data as DealRow, usersMap, clientsMap);

    setColumns((current) => ({
      ...current,
      [form.stageId]: [createdDeal, ...(current[form.stageId] || [])],
    }));

    setForm((current) => ({ ...current, title: "", value: "" }));
    setCreating(false);
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Воронка сделок</p>
            <h1 className="font-display text-3xl font-semibold">Канбан из Supabase</h1>
          </div>
          <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
            Обновить
          </Button>
        </div>

        <div className="rounded-2xl border border-border/70 bg-secondary/20 p-3">
          <p className="mb-2 text-sm font-medium">Добавить сделку</p>
          <div className="grid gap-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr_1fr_0.9fr_auto]">
            <Input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Название сделки"
            />
            <Input
              value={form.value}
              onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
              placeholder="Сумма"
              type="number"
              min="0"
            />
            <select
              value={form.stageId}
              onChange={(event) => setForm((current) => ({ ...current, stageId: event.target.value }))}
              className="h-10 rounded-xl border border-input bg-card/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
            <select
              value={form.ownerId}
              onChange={(event) => setForm((current) => ({ ...current, ownerId: event.target.value }))}
              className="h-10 rounded-xl border border-input bg-card/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Без владельца</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email || user.id}
                </option>
              ))}
            </select>
            <select
              value={form.clientId}
              onChange={(event) => setForm((current) => ({ ...current, clientId: event.target.value }))}
              className="h-10 rounded-xl border border-input bg-card/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Без клиента</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name || client.company || client.id}
                </option>
              ))}
            </select>
            <select
              value={form.priority}
              onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
              className="h-10 rounded-xl border border-input bg-card/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
            <Button onClick={onCreateDeal} disabled={creating || !form.title.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              {creating ? "Добавление..." : "Добавить"}
            </Button>
          </div>
        </div>
      </div>

      {error ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {totals.map((item) => (
          <Badge key={item.stageId} variant="outline" className="rounded-full px-3 py-1 text-xs">
            {stages.find((stage) => stage.id === item.stageId)?.name}: {formatCurrency(item.total)}
          </Badge>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Загрузка воронки...</p> : null}
      {!loading && stages.length === 0 ? <p className="text-sm text-muted-foreground">В таблице `pipeline_stages` нет этапов.</p> : null}

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid gap-4 xl:grid-cols-4">
          {stages.map((stage) => (
            <PipelineColumn key={stage.id} stage={stage} deals={columns[stage.id] || []} />
          ))}
        </div>
        <DragOverlay>{activeDeal ? <DealCard deal={activeDeal} dragOverlay /> : null}</DragOverlay>
      </DndContext>
    </section>
  );
}
