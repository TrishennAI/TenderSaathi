import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";
import { SignupForm } from "@/components/SignupForm";
import { getDictionary } from "@/lib/i18n";

export default async function SignupPage() {
  const { locale, t } = await getDictionary();
  return (
    <>
      <AppHeader locale={locale} t={t} />
      <main className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold">{t.auth.signup.title}</h1>
          <p className="mt-1 text-sm text-muted">{t.auth.signup.subtitle}</p>
          <SignupForm
            labels={{
              divider: t.auth.signup.divider,
              google: t.auth.signup.google,
              fullName: t.auth.signup.fullName,
              phone: t.auth.signup.phone,
              phoneInvalid: t.auth.signup.phoneInvalid,
              businessName: t.auth.signup.businessName,
              email: t.auth.signup.email,
              password: t.auth.signup.password,
              confirmPassword: t.auth.signup.confirmPassword,
              passwordMismatch: t.auth.signup.passwordMismatch,
              passwordTooShort: t.auth.signup.passwordTooShort,
              showPassword: t.auth.passwordField.show,
              hidePassword: t.auth.passwordField.hide,
              submit: t.auth.signup.submit,
              oauthError: t.auth.signup.oauthError,
              genericError: t.common.errors.generic,
              supabaseMissing: t.common.errors.supabaseMissing,
            }}
          />
          <p className="mt-6 text-sm text-muted">
            {t.auth.signup.haveAccount}{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              {t.auth.signup.loginCta}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
