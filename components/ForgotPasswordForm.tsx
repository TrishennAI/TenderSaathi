"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

type Labels = {
  email: string;
  submit: string;
  backToLogin: string;
  success: string;
  genericError: string;
  supabaseMissing: string;
  invalidLink: string;
};

export function ForgotPasswordForm({ labels }: { labels: Labels }) {
  const searchParams = useSearchParams();
  const linkInvalid = searchParams.get("error") === "link";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(form: FormData) {
    setError(null);
    setSent(false);
    if (!isSupabaseConfigured()) {
      setError(labels.supabaseMissing);
      return;
    }
    const email = String(form.get("email") ?? "").trim();
    if (!email) return;

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (err) {
        setError(err.message || labels.genericError);
        return;
      }
      setSent(true);
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {linkInvalid && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {labels.invalidLink}
        </p>
      )}
      {sent ? (
        <p className="rounded-md border border-border bg-card-2 px-3 py-2 text-sm text-foreground">
          {labels.success}
        </p>
      ) : (
        <form action={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{labels.email}</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-11 rounded-md border border-border bg-background px-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
          </label>
          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-1 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "…" : labels.submit}
          </button>
        </form>
      )}
      <p className="text-sm text-muted">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {labels.backToLogin}
        </Link>
      </p>
    </div>
  );
}
