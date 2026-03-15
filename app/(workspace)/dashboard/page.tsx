"use client";

import { ArrowUpRight, Clock3, Dot, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

type DealRow = {
  id: string;
  value: number | null;
  status: string | null;
  stage_id: string | null;
  created_at: string | null;
};

type TaskRow = {
  id: string;
  status: string | null;
  deadline: string | null;
};

type StageRow = {
  id: string;
  is_won: boolean;
  is_closed: boolean;
};

type ActivityRow = {
  id: string;
  action: string | null;
  entity_type: string | null;
  created_at: string | null;
};

function isTaskDone(status: string | null) {
  const value = (status ?? "").toLowerCase();
  return value === "done" || value === "completed" || value === "closed";
}

function relativeDate(dateIso: string | null) {
  if (!dateIso) return "только что";
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн назад`;
}

export default function DashboardPage() {
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [stages, setStages] = useState<StageRow[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase не подключен.");
      setLoading(false);
      return;
    }

    const [dealsRes, tasksRes, stagesRes, activitiesRes] = await Promise.all([
      supabase.from("deals").select("id,value,status,stage_id,created_at"),
      supabase.from("tasks").select("id,status,deadline"),
      supabase.from("pipeline_stages").select("id,is_won,is_closed"),
      supabase.from("activities").select("id,action,entity_type,created_at").order("created_at", { ascending: false }).limit(6),
    ]);

    if (dealsRes.error) {
      setError(dealsRes.error.message);
      setLoading(false);
      return;
    }
    if (tasksRes.error) {
      setError(tasksRes.error.message);
      setLoading(false);
      return;
    }
    if (stagesRes.error) {
      setError(stagesRes.error.message);
      setLoading(false);
      return;
    }
    if (activitiesRes.error) {
      setError(activitiesRes.error.message);
      setLoading(false);
      return;
    }

    setDeals((dealsRes.data as DealRow[]) ?? []);
    setTasks((tasksRes.data as TaskRow[]) ?? []);
    setStages((stagesRes.data as StageRow[]) ?? []);
    setActivities((activitiesRes.data as ActivityRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const metrics = useMemo(() => {
    const wonStageIds = new Set(stages.filter((stage) => stage.is_won).map((stage) => stage.id));
    const closedStageIds = new Set(stages.filter((stage) => stage.is_closed).map((stage) => stage.id));
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);

    const pipelineValue = deals.reduce((sum, deal) => sum + (deal.value ?? 0), 0);
    const activeDeals = deals.filter((deal) => !deal.stage_id || !closedStageIds.has(deal.stage_id)).length;
    const wonCount = deals.filter((deal) => deal.stage_id && wonStageIds.has(deal.stage_id)).length;
    const conversion = deals.length > 0 ? Math.round((wonCount / deals.length) * 100) : 0;
    const dueToday = tasks.filter((task) => task.deadline && task.deadline.slice(0, 10) === todayIso && !isTaskDone(task.status)).length;
    const overdue = tasks.filter((task) => task.deadline && task.deadline.slice(0, 10) < todayIso && !isTaskDone(task.status)).length;

    return [
      { label: "Выручка в воронке", value: formatCurrency(pipelineValue), trend: `${deals.length} сделок` },
      { label: "Активные сделки", value: String(activeDeals), trend: `${wonCount} выиграно` },
      { label: "Конверсия", value: `${conversion}%`, trend: "по этапам pipeline" },
      { label: "Задачи на сегодня", value: String(dueToday), trend: `${overdue} просрочено` },
    ];
  }, [deals, tasks, stages]);

  const activityFeed = useMemo(() => {
    if (activities.length > 0) {
      return activities.map((activity) => ({
        id: activity.id,
        text: `${activity.action || "Активность"} (${activity.entity_type || "entity"})`,
        time: relativeDate(activity.created_at),
      }));
    }

    return [
      { id: "fallback-1", text: "Добавьте активность в таблицу activities", time: "—" },
      { id: "fallback-2", text: "Дашборд уже подключен к реальному Supabase", time: "—" },
    ];
  }, [activities]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Дашборд</p>
          <h1 className="font-display text-3xl font-semibold leading-tight">Пульс CRM R1</h1>
        </div>
        <div className="flex gap-2">
          <Badge className="w-fit gap-1 rounded-full px-3 py-1 text-xs" variant="default">
            <Sparkles className="h-3.5 w-3.5" />
            Живые данные из Supabase
          </Badge>
          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground hover:bg-secondary/40"
          >
            Обновить
          </button>
        </div>
      </div>

      {error ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Загрузка данных...</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="h-full">
            <CardHeader className="pb-3">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <CardTitle className="text-3xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="inline-flex items-center gap-1 text-xs text-primary">
                <TrendingUp className="h-3.5 w-3.5" />
                {metric.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Сводка по воронке</CardTitle>
            <a
              href="/deals"
              className="inline-flex items-center gap-1 text-xs text-primary"
            >
              Перейти к сделкам
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-secondary/35 p-3">
                <p>Этапов в pipeline</p>
                <p className="mt-2 text-base font-semibold text-foreground">{stages.length}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-secondary/35 p-3">
                <p>Сделок в базе</p>
                <p className="mt-2 text-base font-semibold text-foreground">{deals.length}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-secondary/35 p-3">
                <p>Задач в базе</p>
                <p className="mt-2 text-base font-semibold text-foreground">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              Лента активности
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.map((item) => (
              <div key={item.id} className="flex gap-2 rounded-xl border border-border/70 bg-secondary/30 p-3 text-sm">
                <Dot className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p>{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
