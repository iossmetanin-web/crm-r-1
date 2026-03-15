"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Plus, UserRound } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initialTasks, teamMembers, Task } from "@/lib/data/mock";
import { cn } from "@/lib/utils";

function priorityVariant(priority: Task["priority"]) {
  if (priority === "High") return "destructive" as const;
  if (priority === "Medium") return "default" as const;
  return "secondary" as const;
}

function getPriorityLabel(priority: Task["priority"]) {
  if (priority === "High") return "Высокий";
  if (priority === "Medium") return "Средний";
  return "Низкий";
}

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(teamMembers[0]);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return {
      total: tasks.length,
      completed,
      open: tasks.length - completed,
    };
  }, [tasks]);

  const onAddTask = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setTasks((current) => [
      {
        id: `task-${Date.now()}`,
        title: title.trim(),
        assignee,
        priority: "Medium",
        due: "Следующая неделя",
        completed: false,
      },
      ...current,
    ]);
    setTitle("");
  };

  const onToggle = (taskId: string) => {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)));
  };

  const onAssign = (taskId: string, user: string) => {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, assignee: user } : task)));
  };

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Задачи</p>
        <h1 className="font-display text-3xl font-semibold">Доска назначения задач</h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Очередь задач</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form className="grid gap-2 rounded-xl border border-border/70 bg-secondary/20 p-3 sm:grid-cols-[1fr_auto_auto]" onSubmit={onAddTask}>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Создать новую задачу..." />
              <select
                value={assignee}
                onChange={(event) => setAssignee(event.target.value)}
                className="h-10 rounded-xl border border-input bg-card/70 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {teamMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
              <Button type="submit" className="sm:min-w-[120px]">
                <Plus className="mr-2 h-4 w-4" />
                Добавить задачу
              </Button>
            </form>

            <div className="space-y-2">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    "rounded-xl border border-border/70 bg-card/70 p-3",
                    task.completed && "border-primary/35 bg-primary/10",
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => onToggle(task.id)}
                        className={cn(
                          "mt-0.5 h-5 w-5 rounded-full border transition-colors",
                          task.completed ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        )}
                        aria-label="Изменить статус выполнения"
                      >
                        {task.completed ? <CheckCircle2 className="h-4 w-4" /> : null}
                      </button>
                      <div>
                        <p className={cn("text-sm font-medium", task.completed && "text-muted-foreground line-through")}>
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">Срок: {task.due}</p>
                      </div>
                    </div>
                    <Badge variant={priorityVariant(task.priority)}>{getPriorityLabel(task.priority)}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <UserRound className="h-3.5 w-3.5" />
                    <span>Назначено:</span>
                    <select
                      value={task.assignee}
                      onChange={(event) => onAssign(task.id, event.target.value)}
                      className="h-8 rounded-lg border border-input bg-card px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                    >
                      {teamMembers.map((member) => (
                        <option key={member} value={member}>
                          {member}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
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
              <p className="mb-2 text-sm font-medium">Распределение нагрузки</p>
              <div className="space-y-2 text-sm">
                {teamMembers.map((member) => {
                  const memberTotal = tasks.filter((task) => task.assignee === member && !task.completed).length;
                  return (
                    <div key={member} className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/20 px-3 py-2">
                      <span>{member}</span>
                      <span className="text-muted-foreground">{memberTotal} открыто</span>
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
