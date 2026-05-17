import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";
import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  const { locale, t } = await getDictionary();
  return (
    <>
      <AppHeader locale={locale} t={t} />
      <main className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold">{t.auth.resetPassword.title}</h1>
          <p className="mt-1 text-sm text-muted">{t.auth.resetPassword.subtitle}</p>
          <UpdatePasswordForm
            labels={{
              password: t.auth.resetPassword.password,
              verifyPassword: t.auth.resetPassword.verifyPassword,
              showPassword: t.auth.passwordField.show,
              hidePassword: t.auth.passwordField.hide,
              submit: t.auth.resetPassword.submit,
              genericError: t.common.errors.generic,
              supabaseMissing: t.common.errors.supabaseMissing,
              mismatch: t.auth.resetPassword.mismatch,
              tooShort: t.auth.resetPassword.tooShort,
            }}
          />
          <p className="mt-6 text-sm text-muted">
            <Link href="/login" className="font-semibold text-primary hover:underline">
              {t.auth.forgotPassword.backToLogin}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
