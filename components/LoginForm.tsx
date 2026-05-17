"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { PasswordFieldWithToggle } from "@/components/PasswordFieldWithToggle";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

type Labels = {
  divider: string;
  google: string;
  email: string;
  password: string;
  submit: string;
  oauthError: string;
  genericError: string;
  supabaseMissing: string;
  forgotPassword: string;
  showPassword: string;
  hidePassword: string;
};

export function LoginForm({ labels }: { labels: Labels }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const oauthFailed = searchParams.get("error") === "oauth";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(form: FormData) {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError(labels.supabaseMissing);
      return;
    }
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      if (err) {
        setError(err.message || labels.genericError);
        return;
      }
      
      // Try client-side navigation first
      router.replace(next);
      router.refresh();
      
      // Fallback: if client-side navigation doesn't work, do a full page reload
      // This handles cases where the router might fail silently
      setTimeout(() => {
        // Check if we're still on the login page after 1 second
        if (window.location.pathname === "/login") {
          window.location.href = next;
        }
      }, 1000);
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {/* Google Sign-In disabled for now */}
      {/* <GoogleSignInButton
        next={next}
        label={labels.google}
        errorLabel={labels.supabaseMissing}
      />
      <AuthDivider label={labels.divider} /> */}
      <form action={handleSubmit} className="flex flex-col gap-4">
        <Field label={labels.email} name="email" type="email" autoComplete="email" required />
        <PasswordFieldWithToggle
          label={labels.password}
          name="password"
          autoComplete="current-password"
          required
          showPasswordLabel={labels.showPassword}
          hidePasswordLabel={labels.hidePassword}
          labelEnd={
            <Link
              href="/forgot-password"
              className="shrink-0 text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {labels.forgotPassword}
            </Link>
          }
        />
      {oauthFailed && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {labels.oauthError}
        </p>
      )}
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
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="h-11 rounded-md border border-border bg-background px-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}
