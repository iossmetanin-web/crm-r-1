"use client";

import { Bell, MoonStar, Shield, UserCircle2 } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ToggleProps = {
  label: string;
  description: string;
  value: boolean;
  onChange: () => void;
};

function ToggleRow({ label, description, value, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-secondary/20 px-3 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          value ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform",
            value && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

export function SettingsView() {
  const [productUpdates, setProductUpdates] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(true);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Настройки</p>
        <h1 className="font-display text-3xl font-semibold">Параметры рабочего пространства</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-primary" />
              Профиль
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input defaultValue="Ава Рейнольдс" placeholder="Полное имя" />
              <Input defaultValue="Руководитель отдела выручки" placeholder="Должность" />
            </div>
            <Input defaultValue="ava@apexcrm.com" placeholder="Эл. почта" />
            <Textarea defaultValue="Фокус: рост enterprise-сегмента, стратегия аккаунтов и точность прогнозов." />
            <Button className="w-full sm:w-auto">Сохранить профиль</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Уведомления
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow
              label="Обновления продукта"
              description="Релиз-ноты и запуск новых функций"
              value={productUpdates}
              onChange={() => setProductUpdates((current) => !current)}
            />
            <ToggleRow
              label="Напоминания о задачах"
              description="Ежедневные напоминания по назначенным задачам"
              value={taskAlerts}
              onChange={() => setTaskAlerts((current) => !current)}
            />
            <ToggleRow
              label="Еженедельный дайджест"
              description="Сводка по воронке и скорости команды по понедельникам"
              value={weeklyDigest}
              onChange={() => setWeeklyDigest((current) => !current)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Безопасность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow
              label="Обязательный SSO"
              description="Требовать вход через Google или Microsoft SSO"
              value={ssoEnabled}
              onChange={() => setSsoEnabled((current) => !current)}
            />
            <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-sm text-muted-foreground">
              Последний вход: Сан-Франциско, CA, 15 марта в 09:26.
            </div>
            <Button variant="outline">Обновить API-токен</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <MoonStar className="h-5 w-5 text-primary" />
              Внешний вид
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Переключайте светлую и темную тему в любой момент.</p>
            <ThemeToggle />
            <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-sm text-muted-foreground">
              Типографика: Manrope + Space Grotesk
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
