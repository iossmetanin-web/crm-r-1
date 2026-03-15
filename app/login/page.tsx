"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

function translateSupabaseError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) return "Неверный email или пароль.";
  if (normalized.includes("email not confirmed")) return "Email не подтвержден.";
  if (normalized.includes("user already registered")) return "Пользователь уже зарегистрирован.";
  if (normalized.includes("network")) return "Ошибка сети. Проверьте подключение к интернету.";

  return "Не удалось выполнить вход. Проверьте данные и попробуйте снова.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/dashboard");
      }
    };

    void run();
  }, [router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Переменные Supabase не найдены в .env.local.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(translateSupabaseError(signInError.message));
      return;
    }

    router.push("/dashboard");
  };

  const onMagicLink = async () => {
    setError("");
    setMessage("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Переменные Supabase не найдены в .env.local.");
      return;
    }

    if (!email) {
      setError("Сначала введите email для отправки магической ссылки.");
      return;
    }

    setMagicLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
      },
    });
    setMagicLoading(false);

    if (otpError) {
      setError(translateSupabaseError(otpError.message));
      return;
    }

    setMessage("Магическая ссылка отправлена. Проверьте входящие.");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.25),transparent_36%),radial-gradient(circle_at_86%_30%,rgba(45,212,191,0.2),transparent_36%),radial-gradient(circle_at_55%_86%,rgba(59,130,246,0.18),transparent_34%)]" />
      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Card className="glass-panel border-white/15">
          <CardHeader className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-secondary/35 px-3 py-1 text-xs text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              CRM R1
            </div>
            <div>
              <CardTitle className="font-display text-2xl">С возвращением</CardTitle>
              <CardDescription>Войдите, чтобы управлять сделками, клиентами и задачами команды.</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form className="space-y-3" onSubmit={onSubmit}>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Пароль"
                autoComplete="current-password"
                required
              />
              <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                Войти
              </Button>
            </form>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onMagicLink}
              disabled={magicLoading}
            >
              {magicLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Отправить магическую ссылку
            </Button>

            {!hasSupabaseConfig ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                Переменные окружения Supabase отсутствуют.
              </p>
            ) : null}
            {error ? <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p> : null}
            {message ? <p className="rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary">{message}</p> : null}

            <p className="text-center text-xs text-muted-foreground">
              Хотите сначала демо?{" "}
              <Link href="/dashboard" className="text-primary underline-offset-4 hover:underline">
                Открыть тестовый дашборд
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
