import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();
  if (!profile) {
    redirect("/login");
  }
  return { supabase, user, profile };
}

export async function requireRole(role: UserRole) {
  const ctx = await requireUser();
  if (ctx.profile.role !== role) {
    redirect(role === "agent" ? "/dashboard" : "/agent");
  }
  return ctx;
}

export function buildWhatsappUrl({
  phoneE164,
  caseId,
  caseTitle,
  message,
}: {
  phoneE164: string;
  caseId?: string;
  caseTitle?: string;
  message?: string;
}) {
  const digits = phoneE164.replace(/[^\d]/g, "");
  const text =
    message ??
    `Hi, this is regarding case ${caseTitle ?? ""} (ref: ${caseId ?? ""}).`.trim();
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
