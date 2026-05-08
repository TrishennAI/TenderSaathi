import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";
import { LoginForm } from "@/components/LoginForm";
import { getDictionary } from "@/lib/i18n";

export default async function LoginPage() {
  const { locale, t } = await getDictionary();
  return (
    <>
      <AppHeader locale={locale} t={t} />
      <main className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold">{t.auth.login.title}</h1>
          <p className="mt-1 text-sm text-muted">{t.auth.login.subtitle}</p>
          <LoginForm
            labels={{
              divider: t.auth.login.divider,
              google: t.auth.login.google,
              email: t.auth.login.email,
              password: t.auth.login.password,
              submit: t.auth.login.submit,
              oauthError: t.auth.login.oauthError,
              genericError: t.common.errors.generic,
              supabaseMissing: t.common.errors.supabaseMissing,
            }}
          />
          <p className="mt-6 text-sm text-muted">
            {t.auth.login.noAccount}{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              {t.auth.login.signupCta}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
