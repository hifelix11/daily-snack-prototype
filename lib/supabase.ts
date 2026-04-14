"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl || !supabasePublishableKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      );
    }
    _supabase = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export interface AuthUser {
  id: string;
  email: string | null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const {
    data: { session },
  } = await getSupabase().auth.getSession();
  if (!session?.user) return null;
  return { id: session.user.id, email: session.user.email ?? null };
}

export async function signInWithMagicLink(email: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
    },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

export function onAuthChange(
  callback: (user: AuthUser | null) => void
): () => void {
  const {
    data: { subscription },
  } = getSupabase().auth.onAuthStateChange((_event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }
    callback({ id: session.user.id, email: session.user.email ?? null });
  });
  return () => subscription.unsubscribe();
}
