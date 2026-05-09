import Link from "next/link";

import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";
import { env } from "@/lib/env";
import type { Dictionary } from "@/lib/i18n";
import type { Locale, UserRole } from "@/lib/types";

type Props = {
  locale: Locale;
  t: Dictionary;
  authed?: boolean;
  role?: UserRole;
};

export function AppHeader({ locale, t, authed, role }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-1.5 px-3 py-3.5 sm:gap-2 sm:px-4">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-1.5 text-sm font-semibold motion-safe:active:scale-[0.97] motion-safe:transition-transform motion-safe:duration-200 sm:gap-2 sm:text-base md:text-lg"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm sm:h-9 sm:w-9 sm:text-sm">
            TS
          </span>
          <span className="truncate">Tender Sathii</span>
        </Link>

        {authed ? (
          <nav className="hidden items-center gap-1 text-base font-medium md:flex">
            {role === "agent" ? (
              <Link
                href="/agent"
                className="rounded-md px-3 py-2 text-foreground motion-safe:active:scale-[0.97] motion-safe:transition-transform motion-safe:duration-200 hover:bg-card-2"
              >
                {t.common.nav.agent}
              </Link>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-md px-3 py-2 text-foreground motion-safe:active:scale-[0.97] motion-safe:transition-transform motion-safe:duration-200 hover:bg-card-2"
                >
                  {t.common.nav.dashboard}
                </Link>
                <Link
                  href="/cases"
                  className="rounded-md px-3 py-2 text-foreground motion-safe:active:scale-[0.97] motion-safe:transition-transform motion-safe:duration-200 hover:bg-card-2"
                >
                  {t.common.nav.cases}
                </Link>
              </>
            )}
          </nav>
        ) : null}

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <LocaleSwitcher locale={locale} labels={{ en: t.common.language.en, hi: t.common.language.hi }} />
          <ThemeToggle label={t.common.theme.toggle} />
          {authed ? (
            <LogoutButton label={t.common.nav.logout} />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-2.5 py-1.5 text-xs font-medium text-foreground motion-safe:active:scale-[0.97] motion-safe:transition-transform motion-safe:duration-200 hover:bg-card-2 sm:px-3 sm:text-sm md:px-4 md:py-2 md:text-base"
              >
                {t.common.nav.login}
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm motion-safe:active:scale-[0.96] motion-safe:transition-transform motion-safe:duration-200 hover:bg-primary-hover sm:px-3 sm:text-sm md:px-4 md:py-2 md:text-base"
              >
                {t.common.nav.signup}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
