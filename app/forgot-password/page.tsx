import Link from "next/link";
import { Suspense } from "react";

import { AppHeader } from "@/components/AppHeader";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { getDictionary } from "@/lib/i18n";

export default async function ForgotPasswordPage() {
  const { locale, t } = await getDictionary();
  return (
    <>
      <AppHeader locale={locale} t={t} />
      <main className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold">{t.auth.forgotPassword.title}</h1>
          <p className="mt-1 text-sm text-muted">{t.auth.forgotPassword.subtitle}</p>
          <Suspense
            fallback={
              <p className="mt-6 text-sm text-muted" aria-busy="true">
                {t.common.loading}
              </p>
            }
          >
            <ForgotPasswordForm
              labels={{
                email: t.auth.forgotPassword.email,
                submit: t.auth.forgotPassword.submit,
                backToLogin: t.auth.forgotPassword.backToLogin,
                success: t.auth.forgotPassword.success,
                genericError: t.common.errors.generic,
                supabaseMissing: t.common.errors.supabaseMissing,
                invalidLink: t.auth.forgotPassword.invalidLink,
              }}
            />
          </Suspense>
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
