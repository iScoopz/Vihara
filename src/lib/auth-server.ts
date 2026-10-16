import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/types/database';

export type AuthContext = {
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  isAdmin: boolean;
};

const anonymous: AuthContext = { userId: null, email: null, profile: null, isAdmin: false };

function supabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Resolves who is calling a server action from the Supabase session cookie.
// Identity always comes from the session, never from ids sent by the browser.
export const getAuthContext = cache(async (): Promise<AuthContext> => {
  if (!supabaseConfigured()) {
    // Local demo without Supabase: behave as the demo pengurus so the UI stays usable.
    return { userId: 'demo', email: null, profile: { id: 'p1', role: 'admin', full_name: 'Pengurus demo' }, isAdmin: true };
  }

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return anonymous;

    const email = user.email?.toLowerCase() || null;
    let profile: Profile | null = null;

    // link_my_profile() exists once the RLS migration has been applied.
    const { data: linkedId, error: linkError } = await supabase.rpc('link_my_profile');
    if (!linkError && linkedId) {
      const { data } = await supabase.from('profiles').select('*').eq('id', linkedId).maybeSingle();
      profile = data;
    } else if (linkError && email && user.email_confirmed_at) {
      // Before the migration: match the confirmed email directly.
      const { data } = await supabase.from('profiles').select('*').ilike('email', email).limit(1);
      profile = data?.[0] || null;
    }

    const isAdmin = Boolean(profile && profile.role === 'admin' && profile.is_active !== false);
    return { userId: user.id, email, profile, isAdmin };
  } catch (e) {
    console.error('getAuthContext exception:', e);
    return anonymous;
  }
});

export class AuthError extends Error {}

export async function requireAdmin(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx.isAdmin) throw new AuthError('Khusus pengurus. Silakan masuk dengan akun pengurus.');
  return ctx;
}

export async function requireProfile(): Promise<AuthContext & { profile: Profile }> {
  const ctx = await getAuthContext();
  if (!ctx.profile) throw new AuthError('Silakan masuk terlebih dahulu.');
  return ctx as AuthContext & { profile: Profile };
}
