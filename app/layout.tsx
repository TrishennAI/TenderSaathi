import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import { Providers } from "@/components/Providers";
import { getLocale } from "@/lib/i18n";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tender Sathii — Tender support portal",
  description: "Get expert help with your tender filings end to end.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className={`min-h-screen bg-background text-foreground text-base leading-relaxed antialiased ${
          locale === "hi" ? "font-hi-body" : ""
        }`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
