"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { PasswordFieldWithToggle } from "@/components/PasswordFieldWithToggle";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

type Labels = {
  password: string;
  verifyPassword: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  genericError: string;
  supabaseMissing: string;
  mismatch: string;
  tooShort: string;
};

export function UpdatePasswordForm({ labels }: { labels: Labels }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(form: FormData) {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError(labels.supabaseMissing);
      return;
    }
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");
    if (password.length < 6) {
      setError(labels.tooShort);
      return;
    }
    if (password !== confirm) {
      setError(labels.mismatch);
      return;
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError(labels.genericError);
        return;
      }
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message || labels.genericError);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
      setTimeout(() => {
        if (window.location.pathname.startsWith("/auth/")) {
          window.location.href = "/dashboard";
        }
      }, 1000);
    });
  }

  return (
    <form action={handleSubmit} className="mt-6 flex flex-col gap-4">
      <PasswordFieldWithToggle
        label={labels.password}
        name="password"
        autoComplete="new-password"
        required
        minLength={6}
        showPasswordLabel={labels.showPassword}
        hidePasswordLabel={labels.hidePassword}
      />
      <PasswordFieldWithToggle
        label={labels.verifyPassword}
        name="confirmPassword"
        autoComplete="new-password"
        required
        minLength={6}
        visibilityToggle={false}
        showPasswordLabel={labels.showPassword}
        hidePasswordLabel={labels.hidePassword}
      />
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
  );
}
