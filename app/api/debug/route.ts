import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function GET() {
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
  
  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ 
      error: "Not authenticated", 
      userError: userError?.message 
    });
  }
  
  // Try to get profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  
  // Try to insert profile (to test INSERT policy)
  let insertResult = null;
  if (!profile) {
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        role: "user",
        preferred_locale: "en",
      })
      .select()
      .single();
    
    insertResult = { newProfile, insertError };
  }
  
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    },
    profile,
    profileError: profileError?.message,
    insertResult,
    hasProfile: !!profile,
  });
}