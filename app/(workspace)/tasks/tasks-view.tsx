"use client";

import { CheckCircle2, Plus, UserRound } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type TaskRow = {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  priority: string | null;
  deadline: string | null;
  project_id: string | null;
  client_id: string | null;
  created_by: string | null;
  created_at: string | null;
};

type UserRow = {
  id: string;
  email: string | null;
  name: string | null;
};

type TaskAssigneeRow = {
  id: string;
  task_id: string;
  user_id: string;
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
  return "Без приоритета";
}

function isDone(status: string | null) {
  const value = (status ?? "").toLowerCase();
  return value === "done" || value === "completed" || value === "closed";
}

export function TasksView() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [assignees, setAssignees] = useState<TaskAssigneeRow[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string>("");

  const assigneeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const assignee of assignees) {
      map.set(assignee.task_id, assignee.user_id);
    }
    return map;
  }, [assignees]);

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of users) {
      map.set(user.id, user.name || user.email || user.id);
    }
    return map;
  }, [users]);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => isDone(task.status)).length;
    return {
      total: tasks.length,
      completed,
      open: tasks.length - completed,
    };
  }, [tasks]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase не подключен.");
      setLoading(false);
      return;
    }

    const [tasksRes, usersRes, assigneesRes] = await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("crm_users").select("id,name,email").order("created_at", { ascending: true }),
      supabase.from("task_assignees").select("*"),
    ]);

    if (tasksRes.error) {
      setError(tasksRes.error.message);
      setLoading(false);
      return;
    }
    if (usersRes.error) {
      setError(usersRes.error.message);
      setLoading(false);
      return;
    }
    if (assigneesRes.error) {
      setError(assigneesRes.error.message);
      setLoading(false);
      return;
    }

    setTasks((tasksRes.data as TaskRow[]) ?? []);
    const nextUsers = (usersRes.data as UserRow[]) ?? [];
    setUsers(nextUsers);
    setAssignees((assigneesRes.data as TaskAssigneeRow[]) ?? []);

    if (nextUsers.length > 0) {
      setAssigneeId((current) => current || nextUsers[0].id);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onAddTask = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase не подключен.");
      setCreating(false);
      return;
    }

    const payload = {
      title: title.trim(),
      status: "todo",
      priority,
      description: null,
      deadline: null,
      created_by: assigneeId || null,
    };

    const { data: createdTask, error: insertError } = await supabase.from("tasks").insert(payload).select("*").single();
    if (insertError) {
      setError(insertError.message);
      setCreating(false);
      return;
    }

    if (assigneeId) {
      const { data: assigneeRow, error: assigneeError } = await supabase
        .from("task_assignees")
        .insert({ task_id: (createdTask as TaskRow).id, user_id: assigneeId })
        .select("*")
        .single();

      if (assigneeError) {
        setError(assigneeError.message);
      } else if (assigneeRow) {
        setAssignees((current) => [assigneeRow as TaskAssigneeRow, ...current]);
      }
    }

    setTasks((current) => [createdTask as TaskRow, ...current]);
    setTitle("");
    setCreating(false);
  };

  const onToggleStatus = async (task: TaskRow) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setUpdatingTaskId(task.id);
    setError("");

    const nextStatus = isDone(task.status) ? "todo" : "done";
    const { error: updateError } = await supabase.from("tasks").update({ status: nextStatus }).eq("id", task.id);
    if (updateError) {
      setError(updateError.message);
      setUpdatingTaskId("");
      return;
    }

    setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item)));
    setUpdatingTaskId("");
  };

  const onAssign = async (taskId: string, userId: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setError("");
    const existing = assignees.find((assignee) => assignee.task_id === taskId);

    if (existing) {
      const { data, error: updateError } = await supabase
        .from("task_assignees")
        .update({ user_id: userId || null })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (updateError) {
        setError(updateError.message);
        return;
      }

      if (data) {
        setAssignees((current) => current.map((assignee) => (assignee.id === existing.id ? (data as TaskAssigneeRow) : assignee)));
      }
      return;
    }

    if (!userId) return;
    const { data, error: insertError } = await supabase
      .from("task_assignees")
      .insert({ task_id: taskId, user_id: userId })
      .select("*")
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      setAssignees((current) => [data as TaskAssigneeRow, ...current]);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Задачи</p>
          <h1 className="font-display text-3xl font-semibold">Рабочие задачи из Supabase</h1>
        </div>
        <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
          Обновить
        </Button>
      </div>

      {error ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Очередь задач</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form className="grid gap-2 rounded-xl border border-border/70 bg-secondary/20 p-3 sm:grid-cols-[1fr_auto_auto_auto]" onSubmit={onAddTask}>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Новая задача..." />
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="h-10 rounded-xl border border-input bg-card/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
              <select
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
                className="h-10 rounded-xl border border-input bg-card/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Без исполнителя</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email || user.id}
                  </option>
                ))}
              </select>
              <Button type="submit" className="sm:min-w-[140px]" disabled={creating}>
                <Plus className="mr-2 h-4 w-4" />
                {creating ? "Добавление..." : "Добавить"}
              </Button>
            </form>

            <div className="space-y-2">
              {loading ? <p className="text-sm text-muted-foreground">Загрузка задач...</p> : null}
              {!loading && tasks.length === 0 ? <p className="text-sm text-muted-foreground">Задач пока нет.</p> : null}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "rounded-xl border border-border/70 bg-card/70 p-3",
                    isDone(task.status) && "border-primary/35 bg-primary/10",
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => void onToggleStatus(task)}
                        className={cn(
                          "mt-0.5 h-5 w-5 rounded-full border transition-colors",
                          isDone(task.status) ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        )}
                        aria-label="Изменить статус выполнения"
                        disabled={updatingTaskId === task.id}
                      >
                        {isDone(task.status) ? <CheckCircle2 className="h-4 w-4" /> : null}
                      </button>
                      <div>
                        <p className={cn("text-sm font-medium", isDone(task.status) && "text-muted-foreground line-through")}>
                          {task.title || "Без названия"}
                        </p>
                        <p className="text-xs text-muted-foreground">Срок: {task.deadline ? new Date(task.deadline).toLocaleDateString("ru-RU") : "не задан"}</p>
                      </div>
                    </div>
                    <Badge variant={priorityVariant(task.priority)}>{priorityLabel(task.priority)}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <UserRound className="h-3.5 w-3.5" />
                    <span>Исполнитель:</span>
                    <select
                      value={assigneeMap.get(task.id) || ""}
                      onChange={(event) => void onAssign(task.id, event.target.value)}
                      className="h-8 rounded-lg border border-input bg-card px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Не назначен</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.email || user.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Снимок загрузки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Всего задач</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Открыто</p>
                <p className="text-2xl font-semibold">{stats.open}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Выполнено</p>
                <p className="text-2xl font-semibold">{stats.completed}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Распределение по исполнителям</p>
              <div className="space-y-2 text-sm">
                {users.map((user) => {
                  const count = tasks.filter((task) => !isDone(task.status) && assigneeMap.get(task.id) === user.id).length;
                  return (
                    <div key={user.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/20 px-3 py-2">
                      <span>{userMap.get(user.id) || user.id}</span>
                      <span className="text-muted-foreground">{count} открыто</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
