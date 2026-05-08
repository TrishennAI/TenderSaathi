export type UserRole = "user" | "agent";

export type Locale = "en" | "hi";

export type CaseStatus =
  | "submitted"
  | "agent_assigned"
  | "whatsapp_active"
  | "documents_requested"
  | "documents_under_review"
  | "documents_approved"
  | "awaiting_payment"
  | "payment_pending_verification"
  | "in_progress"
  | "completed"
  | "rejected"
  | "on_hold";

export type PaymentStatus =
  | "awaiting_payment"
  | "pending_verification"
  | "verified"
  | "rejected";

export type DocumentRequirement = {
  id: string;
  label: string;
  done: boolean;
};

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  business_name: string | null;
  preferred_locale: Locale;
  created_at: string;
  updated_at: string;
};

export type Agent = {
  id: string;
  user_id: string;
  display_name: string;
  whatsapp_phone_e164: string;
  is_active: boolean;
  created_at: string;
};

export type Case = {
  id: string;
  user_id: string;
  agent_id: string | null;
  status: CaseStatus;
  title: string;
  summary: string | null;
  document_requirements: DocumentRequirement[];
  agent_notes: string | null;
  final_notes: string | null;
  amount_inr: number;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  case_id: string;
  amount_inr: number;
  status: PaymentStatus;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

/** Visible ordering of statuses for the timeline / progress UI. */
export const CASE_STATUS_ORDER: CaseStatus[] = [
  "submitted",
  "agent_assigned",
  "whatsapp_active",
  "documents_requested",
  "documents_under_review",
  "documents_approved",
  "awaiting_payment",
  "payment_pending_verification",
  "in_progress",
  "completed",
];

export const TERMINAL_STATUSES: CaseStatus[] = ["completed", "rejected"];
