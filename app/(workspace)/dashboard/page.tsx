"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Clock3, Dot, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardMetrics } from "@/lib/data/mock";

const recentActivity = [
  { id: "a1", text: "Ава перевела Harbor Finance на этап «Предложение»", time: "12 мин назад" },
  { id: "a2", text: "Создан новый профиль клиента: Lumen Retail", time: "45 мин назад" },
  { id: "a3", text: "Задача выполнена: анкета по безопасности", time: "1 ч назад" },
  { id: "a4", text: "Обновлен прогноз на цикл продления Q2", time: "2 ч назад" },
];

export default function DashboardPage() {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Дашборд</p>
          <h1 className="font-display text-3xl font-semibold leading-tight">Пульс выручки</h1>
        </div>
        <Badge className="w-fit gap-1 rounded-full px-3 py-1 text-xs" variant="default">
          <Sparkles className="h-3.5 w-3.5" />
          Точность прогноза 88%
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
          >
            <Card className="h-full">
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
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Динамика воронки</CardTitle>
            <button className="inline-flex items-center gap-1 text-xs text-primary">
              Открыть отчет
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-secondary/35 p-3">
                <p>Скорость лидов</p>
                <p className="mt-2 text-base font-semibold text-foreground">+24% за месяц</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-secondary/35 p-3">
                <p>Средний цикл</p>
                <p className="mt-2 text-base font-semibold text-foreground">29 дней</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-secondary/35 p-3">
                <p>Вероятность победы</p>
                <p className="mt-2 text-base font-semibold text-foreground">39%</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Лид", value: 32 },
                { label: "Квалификация", value: 51 },
                { label: "Предложение", value: 74 },
                { label: "Выиграно", value: 88 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <p className="text-muted-foreground">{row.label}</p>
                    <p className="font-medium">{row.value}%</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary/70">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary/80 to-accent/70"
                      initial={{ width: 0 }}
                      animate={{ width: `${row.value}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
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
            {recentActivity.map((item) => (
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
