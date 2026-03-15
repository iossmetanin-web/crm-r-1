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
import { motion } from "framer-motion";
import { CalendarDays, CircleDollarSign, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Deal, initialDeals, pipelineStages, StageId } from "@/lib/data/mock";
import { cn, formatCurrency } from "@/lib/utils";

function isStageId(id: UniqueIdentifier): id is StageId {
  return pipelineStages.some((stage) => stage.id === id);
}

function getPriorityVariant(priority: Deal["priority"]) {
  if (priority === "High") return "destructive" as const;
  if (priority === "Medium") return "default" as const;
  return "secondary" as const;
}

function DealCard({ deal, dragOverlay = false }: { deal: Deal; dragOverlay?: boolean }) {
  return (
    <Card
      className={cn(
        "space-y-3 rounded-2xl border-border/70 p-4 transition-transform duration-200",
        dragOverlay && "rotate-1 shadow-2xl",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{deal.name}</p>
          <p className="text-xs text-muted-foreground">{deal.company}</p>
        </div>
        <Badge variant={getPriorityVariant(deal.priority)}>{deal.priority}</Badge>
      </div>

      <div className="grid gap-1 text-xs text-muted-foreground">
        <p className="inline-flex items-center gap-1">
          <CircleDollarSign className="h-3.5 w-3.5 text-primary" />
          {formatCurrency(deal.value)}
        </p>
        <p className="inline-flex items-center gap-1">
          <UserRound className="h-3.5 w-3.5 text-accent" />
          {deal.owner}
        </p>
        <p className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {deal.dueDate}
        </p>
      </div>
    </Card>
  );
}

function SortableDealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      whileHover={{ y: -2 }}
      className={cn(isDragging && "opacity-60")}
      {...attributes}
      {...listeners}
    >
      <DealCard deal={deal} />
    </motion.div>
  );
}

function PipelineColumn({ stage, deals }: { stage: (typeof pipelineStages)[number]; deals: Deal[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "glass-panel flex h-full min-h-[420px] flex-col rounded-2xl border-border/60 p-3",
        isOver && "border-primary/60 bg-primary/10",
      )}
    >
      <div className={cn("mb-3 rounded-xl border border-border/70 bg-gradient-to-r p-3", stage.tint)}>
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-semibold">{stage.title}</p>
          <span className="rounded-full bg-background/75 px-2 py-0.5 text-xs">{deals.length}</span>
        </div>
        <p className="text-xs text-muted-foreground">{stage.subtitle}</p>
      </div>

      <SortableContext items={deals.map((deal) => deal.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {deals.map((deal) => (
            <SortableDealCard key={deal.id} deal={deal} />
          ))}
          {deals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 py-8 text-center text-xs text-muted-foreground">
              Drop deal here
            </div>
          ) : null}
        </div>
      </SortableContext>
    </div>
  );
}

export function DealsBoard() {
  const [columns, setColumns] = useState<Record<StageId, Deal[]>>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const totals = useMemo(() => {
    return pipelineStages.map((stage) => ({
      id: stage.id,
      total: columns[stage.id].reduce((sum, deal) => sum + deal.value, 0),
    }));
  }, [columns]);

  const findContainer = (id: UniqueIdentifier, source: Record<StageId, Deal[]>) => {
    if (isStageId(id)) return id;
    return pipelineStages.find((stage) => source[stage.id].some((deal) => deal.id === id))?.id ?? null;
  };

  const onDragStart = (event: DragStartEvent) => {
    const activeContainer = findContainer(event.active.id, columns);
    if (!activeContainer) return;
    const deal = columns[activeContainer].find((item) => item.id === event.active.id) ?? null;
    setActiveDeal(deal);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDeal(null);
    if (!over) return;

    setColumns((current) => {
      const activeContainer = findContainer(active.id, current);
      const overContainer = findContainer(over.id, current);

      if (!activeContainer || !overContainer) return current;

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
      const nextActive = activeItems.filter((item) => item.id !== active.id);
      const overIndex = overItems.findIndex((item) => item.id === over.id);
      const insertIndex = isStageId(over.id) ? overItems.length : Math.max(overIndex, 0);
      const nextOver = [...overItems.slice(0, insertIndex), movedDeal, ...overItems.slice(insertIndex)];

      return {
        ...current,
        [activeContainer]: nextActive,
        [overContainer]: nextOver,
      };
    });
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Deals Pipeline</p>
          <h1 className="font-display text-3xl font-semibold">Kanban Opportunity Board</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {totals.map((item) => (
            <Badge key={item.id} variant="outline" className="rounded-full px-3 py-1 text-xs">
              {pipelineStages.find((stage) => stage.id === item.id)?.title}: {formatCurrency(item.total)}
            </Badge>
          ))}
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid gap-4 xl:grid-cols-4">
          {pipelineStages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PipelineColumn stage={stage} deals={columns[stage.id]} />
            </motion.div>
          ))}
        </div>
        <DragOverlay>{activeDeal ? <DealCard deal={activeDeal} dragOverlay /> : null}</DragOverlay>
      </DndContext>
    </section>
  );
}
