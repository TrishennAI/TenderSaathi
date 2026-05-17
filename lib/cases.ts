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
  
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();
  
  // If profile doesn't exist, return a default profile object
  // Don't try to insert because of RLS issues
  if (!profile) {
    // Create a default profile object
    profile = {
      id: user.id,
      role: "user" as const,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      phone: user.user_metadata?.phone || null,
      business_name: user.user_metadata?.business_name || null,
      preferred_locale: "en",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Try to insert in background (but don't fail if it doesn't work)
    // This is async but we don't await it
    supabase
      .from("profiles")
      .insert({
        id: user.id,
        role: "user",
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        phone: user.user_metadata?.phone || null,
        business_name: user.user_metadata?.business_name || null,
        preferred_locale: "en",
      })
      .then(({ error }) => {
        if (error) {
          console.error("Background profile creation failed:", error.message);
        } else {
          console.log("Background profile creation succeeded for user:", user.id);
        }
      });
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
  referenceCode,
  caseTitle,
  message,
}: {
  phoneE164: string;
  caseId?: string;
  referenceCode?: string;
  caseTitle?: string;
  message?: string;
}) {
  const digits = phoneE164.replace(/[^\d]/g, "");
  const ref = referenceCode ?? caseId ?? "";
  const text =
    message ??
    `Hi, this is regarding case ${caseTitle ?? ""} (ref: ${ref}).`.trim();
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
