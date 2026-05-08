import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";
import { StatusPill } from "@/components/StatusPill";
import { getDictionary } from "@/lib/i18n";
import { requireUser } from "@/lib/cases";
import type { Case } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { locale, t } = await getDictionary();
  const { supabase, profile } = await requireUser();

  if (profile.role === "agent") {
    const { redirect } = await import("next/navigation");
    redirect("/agent");
  }

  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .returns<Case[]>();

  return (
    <>
      <AppHeader locale={locale} t={t} authed role="user" />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{t.dashboard.user.title}</h1>
            <p className="text-muted">{t.dashboard.user.subtitle}</p>
          </div>
          <Link
            href="/cases/new"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            + {t.dashboard.user.newCase}
          </Link>
        </div>

        <section className="mt-8">
          {!cases || cases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted">
              {t.dashboard.user.noCases}
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {cases.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/cases/${c.id}`}
                    className="block rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold leading-tight">{c.title}</h3>
                      <StatusPill status={c.status} t={t} />
                    </div>
                    {c.summary && <p className="mt-2 line-clamp-2 text-sm text-muted">{c.summary}</p>}
                    <p className="mt-4 text-xs text-muted-2">
                      {new Date(c.created_at).toLocaleString(locale === "hi" ? "hi-IN" : "en-IN")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
