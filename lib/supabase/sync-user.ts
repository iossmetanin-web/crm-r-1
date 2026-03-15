"use client";

import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfileRow = {
  id: string;
  email: string | null;
  name: string | null;
};

function resolveDisplayName(user: User) {
  const rawName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    "";

  if (rawName.trim()) {
    return rawName.trim();
  }

  const email = user.email ?? "";
  if (email.includes("@")) {
    return email.split("@")[0];
  }

  return "Пользователь";
}

async function upsertProfileInTable(tableName: "crm_users" | "users", user: User) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const email = user.email ?? null;
  if (!email) return;

  const displayName = resolveDisplayName(user);

  const { data: existingRow, error: fetchError } = await supabase
    .from(tableName)
    .select("id,email,name")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (fetchError) {
    return;
  }

  if (!existingRow) {
    await supabase.from(tableName).insert({
      id: user.id,
      email,
      name: displayName,
      role: "user",
    });
    return;
  }

  const updates: Partial<ProfileRow> = {};
  if (existingRow.email !== email) {
    updates.email = email;
  }
  if (!existingRow.name) {
    updates.name = displayName;
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from(tableName).update(updates).eq("id", user.id);
  }
}

export async function ensureUserSynced(user: User) {
  await Promise.allSettled([
    upsertProfileInTable("crm_users", user),
    upsertProfileInTable("users", user),
  ]);
}
