import type { Locale } from "@/lib/types";

/** Whole rupees, locale-aware (en-IN / hi-IN). */
export function formatInrWhole(amount: number, locale: Locale): string {
  const tag = locale === "hi" ? "hi-IN" : "en-IN";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
