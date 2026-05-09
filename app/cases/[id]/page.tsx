import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AgentCaseControls } from "@/components/AgentCaseControls";
import { AppHeader } from "@/components/AppHeader";
import { StatusPill } from "@/components/StatusPill";
import { Timeline } from "@/components/Timeline";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n";
import { buildWhatsappUrl, requireUser } from "@/lib/cases";
import type { Agent, Case, Payment, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function CaseDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const { locale, t } = await getDictionary();
  const { supabase, profile } = await requireUser();

  const { data: caseRow } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .maybeSingle<Case>();

  if (!caseRow) {
    notFound();
  }
  if (profile.role !== "agent" && caseRow.user_id !== profile.id) {
    redirect("/dashboard");
  }

  const [{ data: agent }, { data: payment }, { data: owner }] = await Promise.all([
    caseRow.agent_id
      ? supabase.from("agents").select("*").eq("id", caseRow.agent_id).maybeSingle<Agent>()
      : Promise.resolve({ data: null }),
    supabase.from("payments").select("*").eq("case_id", caseRow.id).maybeSingle<Payment>(),
    supabase.from("profiles").select("*").eq("id", caseRow.user_id).maybeSingle<Profile>(),
  ]);

  const isAgent = profile.role === "agent";
  const phone = agent?.whatsapp_phone_e164 ?? env.agentWhatsappNumber;
  const whatsappUrl = phone
    ? buildWhatsappUrl({
        phoneE164: phone,
        caseId: caseRow.id,
        caseTitle: caseRow.title,
        message:
          isAgent && owner
            ? `Hi ${owner.full_name ?? ""}, this is your agent regarding "${caseRow.title}" (ref: ${caseRow.id}).`
            : `Hi, this is regarding my case "${caseRow.title}" (ref: ${caseRow.id}).`,
      })
    : null;

  const showWhatsapp = caseRow.status !== "submitted" && caseRow.status !== "rejected";
  const paymentStatusLabels = t.dashboard.paymentRecordStatus as Record<string, string>;
  const paymentUiStatus = payment?.status ?? "awaiting_payment";
  const showPayment =
    caseRow.status === "awaiting_payment" ||
    caseRow.status === "payment_pending_verification" ||
    caseRow.status === "in_progress" ||
    caseRow.status === "completed";

  const requirements = caseRow.document_requirements ?? [];

  return (
    <>
      <AppHeader locale={locale} t={t} authed role={profile.role} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={isAgent ? "/agent" : "/dashboard"}
            className="text-base text-muted hover:text-foreground"
          >
            ← {t.common.actions.back}
          </Link>
          <StatusPill status={caseRow.status} t={t} />
        </div>

        <header className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t.dashboard.case.viewTitle}
          </p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">{caseRow.title}</h1>
          {caseRow.summary && (
            <p className="mt-3 whitespace-pre-wrap text-base text-muted">{caseRow.summary}</p>
          )}
          <p className="mt-4 text-sm text-muted-2">
            {new Date(caseRow.created_at).toLocaleString(locale === "hi" ? "hi-IN" : "en-IN")}
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {showWhatsapp && (
              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-semibold">{t.dashboard.case.whatsapp.title}</h2>
                <p className="mt-2 text-base text-muted">{t.dashboard.case.whatsapp.body}</p>
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-600"
                  >
                    {t.common.actions.openWhatsapp}
                  </a>
                ) : (
                  <p className="mt-3 text-base text-warning">{t.dashboard.case.noWhatsapp}</p>
                )}
              </section>
            )}

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{t.dashboard.case.documents.title}</h2>
              <p className="mt-2 text-base text-muted">{t.dashboard.case.documents.agentNote}</p>
              {requirements.length === 0 ? (
                <p className="mt-4 rounded-md border border-dashed border-border bg-card-2 p-4 text-base text-muted">
                  {t.dashboard.case.noDocuments}
                </p>
              ) : (
                <ul className="mt-4 grid gap-2">
                  {requirements.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-start gap-2 rounded-md border border-border bg-card-2 p-3 text-base"
                    >
                      <span aria-hidden className={r.done ? "text-success" : "text-muted-2"}>
                        {r.done ? "✓" : "•"}
                      </span>
                      <span className={r.done ? "line-through text-muted" : ""}>{r.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {showPayment && (
              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-semibold">{t.dashboard.case.payment.title}</h2>
                <p className="mt-2 text-base text-muted">
                  {t.dashboard.case.payment.amount}:{" "}
                  <span className="font-semibold text-foreground">
                    ₹{caseRow.amount_inr.toLocaleString("en-IN")}
                  </span>
                </p>
                <p className="mt-2 text-base text-muted">{t.dashboard.case.payment.instructions}</p>
                <div className="mt-4 flex flex-col items-start gap-3">
                  <div className="rounded-xl border border-border bg-card-2 p-4">
                    <Image
                      src={env.paymentQrImagePath}
                      alt={t.dashboard.case.payment.qrAlt}
                      width={220}
                      height={220}
                      className="rounded-md"
                    />
                  </div>
                  <p className="text-sm text-muted-2">
                    {t.dashboard.case.paymentStatus}: {paymentStatusLabels[paymentUiStatus] ?? paymentUiStatus}
                  </p>
                </div>
              </section>
            )}

            {isAgent && (
              <AgentCaseControls
                caseRow={caseRow}
                payment={payment}
                t={t}
              />
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted md:text-base">
                {t.dashboard.case.agentSection}
              </h3>
              {agent ? (
                <div className="mt-3">
                  <p className="text-lg font-semibold">{agent.display_name}</p>
                  <p className="text-base text-muted">{agent.whatsapp_phone_e164}</p>
                </div>
              ) : (
                <p className="mt-3 text-base text-muted">{t.dashboard.case.noAgentYet}</p>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted md:text-base">
                {t.dashboard.case.timeline}
              </h3>
              <div className="mt-4">
                <Timeline status={caseRow.status} t={t} />
              </div>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
