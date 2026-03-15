"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserSynced } from "@/lib/supabase/sync-user";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (mounted) {
          setChecking(false);
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      await ensureUserSynced(session.user);

      if (mounted) {
        setChecking(false);
      }
    };

    void run();

    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login");
      }
    }) ?? { data: { subscription: { unsubscribe: () => undefined } } };

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Загрузка сессии...
      </div>
    );
  }

  return <>{children}</>;
}
