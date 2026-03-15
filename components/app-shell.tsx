"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  CheckSquare,
  KanbanSquare,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";

type AppShellProps = {
  children: React.ReactNode;
};

const navigation = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/deals", label: "Сделки", icon: KanbanSquare },
  { href: "/clients", label: "Клиенты", icon: Users },
  { href: "/tasks", label: "Задачи", icon: CheckSquare },
  { href: "/settings", label: "Настройки", icon: Settings },
];

function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
              isActive
                ? "bg-primary/20 text-primary shadow-[0_10px_26px_-18px_hsl(var(--primary))]"
                : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
            )}
          >
            <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-primary")} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 opacity-70 [background-image:radial-gradient(circle_at_top_right,rgba(56,189,248,0.2),transparent_48%)]" />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 p-4 lg:block">
        <div className="glass-panel flex h-full flex-col rounded-3xl p-4">
          <Link href="/dashboard" className="mb-6 flex items-center gap-3 rounded-xl px-2 py-1">
            <span className="rounded-lg bg-primary/20 p-2 text-primary">
              <BarChart3 className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold tracking-wide">CRM R1</p>
              <p className="text-xs text-muted-foreground">Центр управления выручкой</p>
            </div>
          </Link>

          <NavItems pathname={pathname} />

          <div className="mt-auto rounded-2xl border border-border/70 bg-secondary/35 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="font-medium">Прогноз воронки</p>
            </div>
            <p className="text-xs text-muted-foreground">Прогноз закрытия в этом месяце: $540k (+17%).</p>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.aside
              className="glass-panel absolute inset-y-0 left-0 w-[84%] max-w-xs rounded-r-3xl p-4"
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-sm font-semibold tracking-wide">CRM R1</p>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <NavItems pathname={pathname} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 px-4 pt-4 md:px-6">
          <div className="glass-panel flex items-center gap-3 rounded-2xl px-3 py-2 md:px-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Открыть навигацию"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Поиск по сделкам, клиентам, заметкам..." className="rounded-full pl-9" />
            </div>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="px-4 pb-6 pt-4 md:px-6 md:pt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
