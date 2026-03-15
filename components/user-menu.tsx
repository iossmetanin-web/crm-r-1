"use client";

import { CreditCard, LogOut, Settings, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type CurrentProfile = {
  id: string;
  email: string;
  name: string;
  role: string;
};

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const [profile, setProfile] = useState<CurrentProfile | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user || !mounted) return;

      const fallbackName = session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Пользователь";
      const fallback: CurrentProfile = {
        id: session.user.id,
        email: session.user.email || "",
        name: String(fallbackName),
        role: "user",
      };

      const { data, error } = await supabase
        .from("crm_users")
        .select("id,email,name,role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error || !data) {
        setProfile(fallback);
        return;
      }

      setProfile({
        id: data.id,
        email: data.email || fallback.email,
        name: data.name || fallback.name,
        role: data.role || "user",
      });
    };

    void loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadProfile();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const onLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
  };

  const userName = profile?.name || "Пользователь";
  const userRole = profile?.role === "admin" ? "Администратор" : "Пользователь";
  const userEmail = profile?.email || "";
  const initials = useMemo(() => getInitials(userName), [userName]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full border border-border/70 p-1 transition-colors hover:bg-secondary/60">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <p className="text-sm font-semibold">{userName}</p>
          <p className="text-xs font-normal text-muted-foreground">{userEmail || userRole}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <UserRound className="mr-2 h-4 w-4" />
          Профиль
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Предпочтения
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard className="mr-2 h-4 w-4" />
          Оплата
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
