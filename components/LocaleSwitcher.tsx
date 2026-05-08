"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import type { Locale } from "@/lib/types";

export function LocaleSwitcher({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { en: string; hi: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        body: JSON.stringify({ locale: next }),
        headers: { "Content-Type": "application/json" },
      });
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-0.5 text-xs font-medium">
      <button
        type="button"
        disabled={pending}
        onClick={() => setLocale("en")}
        className={`rounded-full px-2.5 py-1 ${
          locale === "en" ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
        }`}
      >
        {labels.en}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setLocale("hi")}
        className={`rounded-full px-2.5 py-1 ${
          locale === "hi" ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
        }`}
      >
        {labels.hi}
      </button>
    </div>
  );
}
