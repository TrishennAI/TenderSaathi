"use client";

import { useState, useTransition } from "react";

import {
  setPaymentStatus,
  updateAgentNotes,
  updateCaseStatus,
  updateDocumentRequirements,
} from "@/app/actions/case";
import type { Case, CaseStatus, DocumentRequirement, Payment } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";

const NEXT_STEPS: Array<{ from: CaseStatus[]; to: CaseStatus }> = [
  { from: ["submitted", "agent_assigned"], to: "whatsapp_active" },
  { from: ["whatsapp_active"], to: "documents_requested" },
  { from: ["documents_requested"], to: "documents_under_review" },
  { from: ["documents_under_review"], to: "documents_approved" },
  { from: ["documents_approved"], to: "awaiting_payment" },
  { from: ["in_progress"], to: "completed" },
];

function paymentMetaLine(
  template: string,
  amountInr: number,
  statusKey: string,
  statusLabels: Record<string, string>,
) {
  const amount = `₹${amountInr.toLocaleString("en-IN")}`;
  const status = statusLabels[statusKey] ?? statusKey;
  return template.replace("{amount}", amount).replace("{status}", status);
}

export function AgentCaseControls({
  caseRow,
  payment,
  t,
}: {
  caseRow: Case;
  payment: Payment | null | undefined;
  t: Dictionary;
}) {
  const ap = t.dashboard.agentPanel;
  const statusLabels = t.dashboard.status as Record<string, string>;
  const paymentRecordLabels = t.dashboard.paymentRecordStatus as Record<string, string>;
  const [pending, startTransition] = useTransition();
  const [reqs, setReqs] = useState<DocumentRequirement[]>(caseRow.document_requirements ?? []);
  const [newLabel, setNewLabel] = useState("");
  const [notes, setNotes] = useState(caseRow.agent_notes ?? "");
  const [error, setError] = useState<string | null>(null);

  function call(fn: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : ap.genericError);
      }
    });
  }

  function moveTo(status: CaseStatus) {
    call(() => updateCaseStatus({ caseId: caseRow.id, status }));
  }

  function saveReqs(next: DocumentRequirement[]) {
    setReqs(next);
    call(() => updateDocumentRequirements({ caseId: caseRow.id, requirements: next }));
  }

  function addReq() {
    if (!newLabel.trim()) return;
    saveReqs([...reqs, { id: crypto.randomUUID(), label: newLabel.trim(), done: false }]);
    setNewLabel("");
  }

  return (
    <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{ap.title}</h2>
      <p className="mt-1 text-sm text-muted">{ap.subtitle}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {NEXT_STEPS.filter((s) => s.from.includes(caseRow.status)).map((s) => (
          <button
            key={s.to}
            type="button"
            disabled={pending}
            onClick={() => moveTo(s.to)}
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          >
            {statusLabels[s.to] ?? s.to}
          </button>
        ))}
        {!["rejected", "on_hold", "completed"].includes(caseRow.status) && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => moveTo("on_hold")}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-card-2 disabled:opacity-60"
            >
              {ap.onHold}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => moveTo("rejected")}
              className="rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 disabled:opacity-60"
            >
              {ap.rejectCase}
            </button>
          </>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-base font-semibold">{ap.checklistTitle}</h3>
        <ul className="mt-3 space-y-2">
          {reqs.map((r, i) => (
            <li key={r.id} className="flex items-center gap-2 rounded-md border border-border bg-card p-2.5 text-base">
              <input
                type="checkbox"
                checked={r.done}
                onChange={(e) => {
                  const next = [...reqs];
                  next[i] = { ...r, done: e.target.checked };
                  saveReqs(next);
                }}
              />
              <input
                value={r.label}
                onChange={(e) => {
                  const next = [...reqs];
                  next[i] = { ...r, label: e.target.value };
                  setReqs(next);
                }}
                onBlur={() => saveReqs(reqs)}
                className="flex-1 rounded-sm bg-transparent px-1 outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="button"
                aria-label={ap.removeRow}
                title={ap.removeRow}
                onClick={() => saveReqs(reqs.filter((_, j) => j !== i))}
                className="text-muted hover:text-destructive"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex gap-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addReq();
              }
            }}
            placeholder={ap.addPlaceholder}
            className="h-10 flex-1 rounded-md border border-border bg-card px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
          />
          <button
            type="button"
            onClick={addReq}
            className="rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            {ap.add}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-base font-semibold">{ap.internalNotes}</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => call(() => updateAgentNotes({ caseId: caseRow.id, notes }))}
          rows={3}
          className="mt-2 w-full rounded-md border border-border bg-card p-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
        />
      </div>

      {payment && (
        <div className="mt-6 rounded-md border border-border bg-card p-4">
          <h3 className="text-base font-semibold">{ap.paymentTitle}</h3>
          <p className="mt-1 text-sm text-muted">
            {paymentMetaLine(ap.paymentMeta, payment.amount_inr, payment.status, paymentRecordLabels)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending || payment.status === "verified"}
              onClick={() =>
                call(() => setPaymentStatus({ caseId: caseRow.id, status: "verified" }))
              }
              className="rounded-full bg-success px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {ap.markVerified}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                call(() =>
                  setPaymentStatus({
                    caseId: caseRow.id,
                    status: "pending_verification",
                  }),
                )
              }
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-card-2 disabled:opacity-50"
            >
              {ap.pendingReview}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                const reason = prompt(ap.rejectReasonPrompt) ?? undefined;
                call(() =>
                  setPaymentStatus({
                    caseId: caseRow.id,
                    status: "rejected",
                    rejectionReason: reason,
                  }),
                );
              }}
              className="rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50"
            >
              {ap.rejectPayment}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
