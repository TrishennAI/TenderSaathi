import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";
import { StatusPill } from "@/components/StatusPill";
import { getDictionary } from "@/lib/i18n";
import { requireRole } from "@/lib/cases";
import type { Case, CaseStatus, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

const QUEUE: CaseStatus[] = ["submitted", "agent_assigned"];
const ACTIVE: CaseStatus[] = [
  "whatsapp_active",
  "documents_requested",
  "documents_under_review",
  "documents_approved",
  "awaiting_payment",
  "payment_pending_verification",
  "in_progress",
  "on_hold",
];
const CLOSED: CaseStatus[] = ["completed", "rejected"];

type CaseWithUser = Case & { user: Pick<Profile, "id" | "full_name" | "phone" | "business_name"> | null };

export default async function AgentDashboardPage() {
  const { locale, t } = await getDictionary();
  const { supabase } = await requireRole("agent");
  const { data: cases } = await supabase
    .from("cases")
    .select("*, user:profiles!cases_user_id_fkey(id, full_name, phone, business_name)")
    .order("created_at", { ascending: false })
    .returns<CaseWithUser[]>();

  const queue = (cases ?? []).filter((c) => QUEUE.includes(c.status));
  const active = (cases ?? []).filter((c) => ACTIVE.includes(c.status));
  const closed = (cases ?? []).filter((c) => CLOSED.includes(c.status));

  return (
    <>
      <AppHeader locale={locale} t={t} authed role="agent" />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold md:text-4xl">{t.dashboard.agent.title}</h1>
        <p className="text-lg text-muted">{t.dashboard.agent.subtitle}</p>

        <Section title={t.dashboard.agent.queue} cases={queue} t={t} locale={locale} highlight />
        <Section title={t.dashboard.agent.active} cases={active} t={t} locale={locale} />
        <Section title={t.dashboard.agent.closed} cases={closed} t={t} locale={locale} muted />
      </main>
    </>
  );
}

function Section({
  title,
  cases,
  t,
  locale,
  highlight,
  muted,
}: {
  title: string;
  cases: CaseWithUser[];
  t: Awaited<ReturnType<typeof getDictionary>>["t"];
  locale: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  const empty = t.dashboard.agent.emptySection;
  return (
    <section className={`mt-10 ${muted ? "opacity-80" : ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-base text-muted">{cases.length}</span>
      </div>
      {cases.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-base text-muted">
          {empty}
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {cases.map((c) => (
            <li key={c.id}>
              <Link
                href={`/cases/${c.id}`}
                className={`block rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md ${
                  highlight ? "border-primary/40" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold leading-tight">{c.title}</h3>
                    <p className="text-xs text-muted">
                      {c.user?.full_name ?? "—"}
                      {c.user?.business_name ? ` · ${c.user.business_name}` : ""}
                    </p>
                  </div>
                  <StatusPill status={c.status} t={t} />
                </div>
                {c.summary && <p className="mt-2 line-clamp-2 text-base text-muted">{c.summary}</p>}
                <p className="mt-3 text-sm text-muted-2">
                  {new Date(c.created_at).toLocaleString(locale === "hi" ? "hi-IN" : "en-IN")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
