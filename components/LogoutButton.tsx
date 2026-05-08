"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function logout() {
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={logout}
      className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-card-2 disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}
