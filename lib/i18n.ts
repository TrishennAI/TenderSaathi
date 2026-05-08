import { cookies, headers } from "next/headers";

import enCommon from "@/locales/en/common.json";
import enDashboard from "@/locales/en/dashboard.json";
import enAuth from "@/locales/en/auth.json";
import enLanding from "@/locales/en/landing.json";
import hiCommon from "@/locales/hi/common.json";
import hiDashboard from "@/locales/hi/dashboard.json";
import hiAuth from "@/locales/hi/auth.json";
import hiLanding from "@/locales/hi/landing.json";

import type { Locale } from "@/lib/types";

export const LOCALE_COOKIE = "gp_locale";
export const SUPPORTED_LOCALES: Locale[] = ["en", "hi"];

const dictionaries = {
  en: { common: enCommon, dashboard: enDashboard, auth: enAuth, landing: enLanding },
  hi: { common: hiCommon, dashboard: hiDashboard, auth: hiAuth, landing: hiLanding },
} as const;

export type Dictionary = (typeof dictionaries)["en"];

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined;
  if (fromCookie && SUPPORTED_LOCALES.includes(fromCookie)) {
    return fromCookie;
  }
  const headerStore = await headers();
  const accept = headerStore.get("accept-language") ?? "";
  if (accept.toLowerCase().includes("hi")) return "hi";
  return "en";
}

export async function getDictionary(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}

/** Read a key by dotted path, e.g. "case.payment.title". */
export function tx(t: Dictionary, path: string): string {
  const parts = path.split(".");
  // Walk the dictionary; the structure is intentionally narrow.
  let cur: unknown = t;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cur === "string" ? cur : path;
}
