import { AppHeader } from "@/components/AppHeader";
import { HomeLanding } from "@/components/home/HomeLanding";
import { getDictionary } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export default async function Home() {
  const { locale, t } = await getDictionary();
  let authed = false;
  let role: "user" | "agent" | undefined;
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      authed = true;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      role = (profile?.role as "user" | "agent" | undefined) ?? "user";
    }
  }

  return (
    <>
      <AppHeader locale={locale} t={t} authed={authed} role={role} />
      <HomeLanding
        locale={locale}
        landing={t.landing}
        nav={{
          signup: t.common.nav.signup,
          login: t.common.nav.login,
          dashboard: t.common.nav.dashboard,
        }}
        authed={authed}
        role={role}
      />
    </>
  );
}
