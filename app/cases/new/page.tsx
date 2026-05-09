import { redirect } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { getDictionary } from "@/lib/i18n";
import { requireUser } from "@/lib/cases";

async function createCaseAction(formData: FormData) {
  "use server";
  const { supabase, profile } = await requireUser();
  const { env } = await import("@/lib/env");
  
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  if (!title) {
    return;
  }
  
  const { data, error } = await supabase
    .from("cases")
    .insert({ user_id: profile.id, title, summary: summary || null })
    .select("id")
    .single();
  
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create case");
  }
  
  // Build WhatsApp message with case details
  const message = `Hi! I just created a new case on Tender Sathii.

*Case Title:* ${title}

${summary ? `*Details:* ${summary}` : ''}

*Case ID:* ${data.id}

I'm looking forward to working with you!`;
  
  // Redirect to WhatsApp with pre-filled message
  const phoneDigits = env.agentWhatsappNumber.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
  
  redirect(whatsappUrl);
}

export default async function NewCasePage() {
  const { locale, t } = await getDictionary();
  await requireUser();
  return (
    <>
      <AppHeader locale={locale} t={t} authed role="user" />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold md:text-3xl">{t.dashboard.case.newTitle}</h1>
        <p className="mt-1 text-muted">{t.dashboard.case.newSubtitle}</p>
        <form action={createCaseAction} className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t.dashboard.case.fields.title}</span>
            <input
              name="title"
              required
              maxLength={140}
              className="h-11 rounded-md border border-border bg-background px-3 outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t.dashboard.case.fields.summary}</span>
            <textarea
              name="summary"
              rows={6}
              placeholder={t.dashboard.case.fields.summaryPlaceholder}
              className="rounded-md border border-border bg-background p-3 outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              {t.dashboard.case.create}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
