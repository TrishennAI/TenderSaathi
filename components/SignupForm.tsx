"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";

import { PasswordFieldWithToggle } from "@/components/PasswordFieldWithToggle";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

type Labels = {
  divider: string;
  google: string;
  fullName: string;
  phone: string;
  phoneInvalid: string;
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
  passwordMismatch: string;
  passwordTooShort: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  oauthError: string;
  genericError: string;
  supabaseMissing: string;
};

/** Exactly 10 digits (signup field accepts digits only). */
function isTenDigitMobile(value: string): boolean {
  return /^\d{10}$/.test(value);
}

export function SignupForm({ labels }: { labels: Labels }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthFailed = searchParams.get("error") === "oauth";
  /** Inputs mount after first paint so password-manager extensions cannot break hydration. */
  const [inputsReady, setInputsReady] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    setInputsReady(true);
  }, []);
  /** When true, show phone error using current labels.phoneInvalid (locale-safe). */
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");

  function handleSubmit(form: FormData) {
    setError(null);
    setInfo(null);
    setPhoneInvalid(false);
    if (!isSupabaseConfigured()) {
      setError(labels.supabaseMissing);
      return;
    }
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const fullName = String(form.get("fullName") ?? "").trim();
      const phoneRaw = String(form.get("phone") ?? "").trim();
      const businessName = String(form.get("businessName") ?? "").trim();
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");
      const confirmPassword = String(form.get("confirmPassword") ?? "");

      if (password.length < 6) {
        setError(labels.passwordTooShort);
        return;
      }
      if (password !== confirmPassword) {
        setError(labels.passwordMismatch);
        return;
      }

      if (!isTenDigitMobile(phoneRaw)) {
        setPhoneInvalid(true);
        return;
      }
      const phoneDigits = phoneRaw;

      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null,
            phone: phoneDigits,
            business_name: businessName || null,
            role: "user",
          },
        },
      });
      if (err) {
        setError(err.message || labels.genericError);
        return;
      }

      if (data.session) {
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
      {oauthFailed && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {labels.oauthError}
        </p>
      )}
      {!inputsReady ? (
        <SignupFormFieldsSkeleton />
      ) : null}
      {inputsReady ? (
      <form action={handleSubmit} className="flex flex-col gap-4">
        <Field label={labels.fullName} name="fullName" autoComplete="name" required />
        <div className="flex flex-col gap-1 text-sm">
          <label className="font-medium" htmlFor="signup-phone">
            {labels.phone}
          </label>
          <input
            id="signup-phone"
            name="phone"
            type="text"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            required
            value={phoneValue}
            aria-invalid={phoneInvalid ? true : undefined}
            aria-describedby={phoneInvalid ? "signup-phone-error" : undefined}
            onBlur={() => {
              if (phoneValue === "") {
                setPhoneInvalid(false);
                return;
              }
              setPhoneInvalid(!isTenDigitMobile(phoneValue));
            }}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, "").slice(0, 10);
              setPhoneValue(next);
              setPhoneInvalid(false);
            }}
            className={`h-11 rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 ${
              phoneInvalid
                ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                : "border-border focus:border-primary focus:ring-ring/40"
            }`}
          />
          {phoneInvalid ? (
            <p id="signup-phone-error" className="text-sm text-destructive" role="alert">
              {labels.phoneInvalid}
            </p>
          ) : null}
        </div>
        <Field label={labels.businessName} name="businessName" autoComplete="organization" />
        <Field label={labels.email} name="email" type="email" autoComplete="email" required />
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
          label={labels.confirmPassword}
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
      ) : null}
    </div>
  );
}

function SignupFormFieldsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="h-4 w-28 animate-pulse rounded bg-muted/50" />
          <div className="h-11 w-full animate-pulse rounded-md bg-muted/40" />
        </div>
      ))}
      <div className="mt-1 h-11 w-full animate-pulse rounded-full bg-muted/40" />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="h-11 rounded-md border border-border bg-background px-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}
