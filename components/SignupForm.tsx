"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { AuthDivider, GoogleSignInButton } from "@/components/GoogleSignInButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

type Labels = {
  divider: string;
  google: string;
  fullName: string;
  phone: string;
  businessName: string;
  email: string;
  password: string;
  submit: string;
  oauthError: string;
  genericError: string;
  supabaseMissing: string;
};

export function SignupForm({ labels }: { labels: Labels }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const oauthFailed = searchParams.get("error") === "oauth";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function handleSubmit(form: FormData) {
    setError(null);
    setInfo(null);
    if (!isSupabaseConfigured()) {
      setError(labels.supabaseMissing);
      return;
    }
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const fullName = String(form.get("fullName") ?? "").trim();
      const phone = String(form.get("phone") ?? "").trim();
      const businessName = String(form.get("businessName") ?? "").trim();
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");

      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null,
            phone: phone || null,
            business_name: businessName || null,
            role: "user",
          },
        },
      });
      if (err) {
        setError(err.message || labels.genericError);
        return;
      }

      // If supabase sends confirmation emails, session will be null until confirmed.
      if (data.session) {
        // Best-effort: also persist business_name on profile (the trigger only sets a few fields).
        if (businessName) {
          await supabase
            .from("profiles")
            .update({ business_name: businessName })
            .eq("id", data.user!.id);
        }
        router.replace("/dashboard");
        router.refresh();
      } else {
        setInfo("Check your inbox to confirm your email, then sign in.");
      }
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
      {oauthFailed && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {labels.oauthError}
        </p>
      )}
      <form action={handleSubmit} className="flex flex-col gap-4">
      <Field label={labels.fullName} name="fullName" autoComplete="name" required />
      <Field label={labels.phone} name="phone" type="tel" autoComplete="tel" />
      <Field label={labels.businessName} name="businessName" autoComplete="organization" />
      <Field label={labels.email} name="email" type="email" autoComplete="email" required />
      <Field label={labels.password} name="password" type="password" autoComplete="new-password" required />
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {info && (
        <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {info}
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
