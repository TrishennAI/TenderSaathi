import { NextResponse } from "next/server";

import { LOCALE_COOKIE, SUPPORTED_LOCALES } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export async function POST(request: Request) {
  const { locale } = (await request.json().catch(() => ({}))) as { locale?: Locale };
  if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
