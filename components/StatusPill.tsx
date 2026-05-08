import type { CaseStatus } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";

const TONES: Record<CaseStatus, string> = {
  submitted: "bg-card-2 text-muted",
  agent_assigned: "bg-card-2 text-foreground",
  whatsapp_active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  documents_requested: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  documents_under_review: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  documents_approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  awaiting_payment: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
  payment_pending_verification: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
  in_progress: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  on_hold: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-200",
};

export function StatusPill({ status, t }: { status: CaseStatus; t: Dictionary }) {
  const label = (t.dashboard.status as Record<string, string>)[status] ?? status;
  const tone = TONES[status];
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  );
}
