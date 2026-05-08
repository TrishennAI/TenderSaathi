"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/cases";
import type { CaseStatus, DocumentRequirement, PaymentStatus } from "@/lib/types";

const ALLOWED_STATUSES: CaseStatus[] = [
  "agent_assigned",
  "whatsapp_active",
  "documents_requested",
  "documents_under_review",
  "documents_approved",
  "awaiting_payment",
  "in_progress",
  "completed",
  "rejected",
  "on_hold",
];

export async function updateCaseStatus(input: {
  caseId: string;
  status: CaseStatus;
  finalNotes?: string;
}) {
  const { supabase } = await requireRole("agent");
  if (!ALLOWED_STATUSES.includes(input.status)) {
    throw new Error(`Invalid status: ${input.status}`);
  }
  const updates: Record<string, unknown> = { status: input.status };
  if (typeof input.finalNotes === "string") updates.final_notes = input.finalNotes;
  const { error } = await supabase.from("cases").update(updates).eq("id", input.caseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/cases/${input.caseId}`);
  revalidatePath("/agent");
}

export async function updateDocumentRequirements(input: {
  caseId: string;
  requirements: DocumentRequirement[];
}) {
  const { supabase } = await requireRole("agent");
  const cleaned = input.requirements
    .filter((r) => typeof r.label === "string" && r.label.trim().length > 0)
    .map((r) => ({
      id: r.id || crypto.randomUUID(),
      label: r.label.trim().slice(0, 200),
      done: !!r.done,
    }));
  const { error } = await supabase
    .from("cases")
    .update({ document_requirements: cleaned })
    .eq("id", input.caseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/cases/${input.caseId}`);
}

export async function updateAgentNotes(input: { caseId: string; notes: string }) {
  const { supabase } = await requireRole("agent");
  const { error } = await supabase
    .from("cases")
    .update({ agent_notes: input.notes.slice(0, 4000) })
    .eq("id", input.caseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/cases/${input.caseId}`);
}

export async function setPaymentStatus(input: {
  caseId: string;
  status: PaymentStatus;
  rejectionReason?: string;
}) {
  const { supabase, profile } = await requireRole("agent");
  const updates: Record<string, unknown> = { status: input.status };
  if (input.status === "verified") {
    updates.verified_by = profile.id;
    updates.verified_at = new Date().toISOString();
    updates.rejection_reason = null;
  } else if (input.status === "rejected") {
    updates.rejection_reason = input.rejectionReason ?? null;
  }
  const { error: pErr } = await supabase
    .from("payments")
    .update(updates)
    .eq("case_id", input.caseId);
  if (pErr) throw new Error(pErr.message);

  if (input.status === "verified") {
    const { error: cErr } = await supabase
      .from("cases")
      .update({ status: "in_progress" })
      .eq("id", input.caseId);
    if (cErr) throw new Error(cErr.message);
  }
  revalidatePath(`/cases/${input.caseId}`);
  revalidatePath("/agent");
}
