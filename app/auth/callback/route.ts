import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";

/**
 * Exchanges the PKCE code for a session (OAuth, password recovery email link, etc.).
 * Add this URL to Supabase Dashboard → Authentication → URL configuration → Redirect URLs:
 *   https://YOUR_DOMAIN/auth/callback
 *   http://localhost:3002/auth/callback  (match your dev port)
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") ? nextRaw : "/dashboard";
  const failPath =
    next === "/auth/update-password"
      ? "/forgot-password?error=link"
      : "/login?error=oauth";

  if (!code) {
    return NextResponse.redirect(new URL(failPath, url.origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(failPath, url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
