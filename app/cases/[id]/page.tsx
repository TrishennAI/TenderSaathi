import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { StatusPill } from "@/components/StatusPill";
import { env } from "@/lib/env";
import { formatInrWhole } from "@/lib/format-inr";
import { getDictionary } from "@/lib/i18n";
import { requireUser } from "@/lib/cases";
import type { Case } from "@/lib/types";

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

  // Build WhatsApp follow-up message
  const message = `Hi! I'm following up on my case.

*Case Title:* ${caseRow.title}

${caseRow.summary ? `*Details:* ${caseRow.summary}` : ''}

*Case ref:* ${caseRow.reference_code}

Please update me on the latest status of this case.`;

  const phoneDigits = env.agentWhatsappNumber.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <AppHeader locale={locale} t={t} authed role={profile.role} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-base text-muted hover:text-foreground"
          >
            ← {t.common.actions.back}
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                {t.dashboard.case.viewTitle}
              </p>
              <h1 className="mt-1 text-3xl font-bold md:text-4xl">{caseRow.title}</h1>
            </div>
            <StatusPill status={caseRow.status} t={t} />
          </div>
          
          {caseRow.summary && (
            <p className="mt-4 whitespace-pre-wrap text-base text-muted">{caseRow.summary}</p>
          )}

          <p className="mt-4 text-base font-semibold text-foreground">
            {t.dashboard.case.serviceFee.replace(
              "{amount}",
              formatInrWhole(caseRow.amount_inr, locale),
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-2">
            <span>
              {t.dashboard.case.reference}: {caseRow.reference_code}
            </span>
            <span className="hidden sm:inline" aria-hidden>
              •
            </span>
            <span>{new Date(caseRow.created_at).toLocaleString(locale === "hi" ? "hi-IN" : "en-IN")}</span>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-600"
            >
              Follow up on WhatsApp
            </a>
            <p className="mt-3 text-sm text-muted">
              Click to send a follow-up message to our agent and get the latest update on your case.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
