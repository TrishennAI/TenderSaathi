"use client";

import { ThemeProvider } from "@teispace/next-themes";
import type { ReactNode } from "react";

import { RouteTransition } from "@/components/RouteTransition";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <RouteTransition>{children}</RouteTransition>
    </ThemeProvider>
  );
}
