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
  
  // If profile doesn't exist, create it (fallback for trigger failure)
  if (!profile) {
    console.log("Profile missing for user:", user.id, "metadata:", user.user_metadata);
    
    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        role: "user",
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        phone: user.user_metadata?.phone || null,
        business_name: user.user_metadata?.business_name || null,
        preferred_locale: "en",
      })
      .select()
      .single<Profile>();
    
    if (error) {
      console.error("Failed to create profile:", error);
      // Instead of signing out, redirect to a special error page or login with error
      redirect("/login?error=profile_creation_failed&details=" + encodeURIComponent(error.message));
    }
    
    if (!newProfile) {
      console.error("Profile creation returned no data");
      redirect("/login?error=profile_creation_empty");
    }
    
    profile = newProfile;
    console.log("Created profile for user:", user.id);
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
