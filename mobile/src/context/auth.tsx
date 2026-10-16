import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { friendlyAuthError } from '@/lib/errors';
import { supabase, WEB_BASE } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

export const NOT_LINKED_MESSAGE = 'Akun ini belum terhubung dengan data umat. Minta pengurus mengisi email Anda di Data Umat.';

type AuthState = {
  /** True until the stored session has been checked once at start-up. */
  initializing: boolean;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  /** Message shown on the sign-in screen after an automatic sign-out. */
  notice: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: Profile) => void;
  clearNotice: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

/** Mirrors the web: link via RPC, fall back to an email match before the migration exists. */
async function resolveProfile(email: string | undefined): Promise<Profile | null> {
  const linked = await supabase.rpc('link_my_profile');
  if (!linked.error && typeof linked.data === 'string' && linked.data) {
    const { data } = await supabase.from('profiles').select('*').eq('id', linked.data).maybeSingle();
    if (data) return data as Profile;
  }
  if (!email) return null;
  const { data } = await supabase.from('profiles').select('*').ilike('email', email).limit(1);
  return (data?.[0] as Profile | undefined) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const signingIn = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const current = data.session;
        if (current) {
          const p = await resolveProfile(current.user.email);
          if (cancelled) return;
          if (p) {
            setSession(current);
            setProfileState(p);
          } else {
            await supabase.auth.signOut();
            setNotice(NOT_LINKED_MESSAGE);
          }
        }
      } catch {
        // Offline at start-up: stay signed out in the UI; the stored session is kept for next time.
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfileState(null);
      } else if (event === 'TOKEN_REFRESHED' && next) {
        setSession(next);
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (signingIn.current) return {};
    signingIn.current = true;
    setNotice(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.session) return { error: friendlyAuthError(error) };
      const p = await resolveProfile(data.session.user.email ?? email.trim());
      if (!p) {
        await supabase.auth.signOut();
        return { error: NOT_LINKED_MESSAGE };
      }
      setSession(data.session);
      setProfileState(p);
      return {};
    } catch (e) {
      return { error: friendlyAuthError(e as { message?: string }) };
    } finally {
      signingIn.current = false;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setProfileState(null);
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${WEB_BASE}/login/reset-password`,
    });
    if (error) return { error: friendlyAuthError(error) };
    return {};
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', profile.id).maybeSingle();
    if (data) setProfileState(data as Profile);
  }, [profile]);

  const value = useMemo<AuthState>(
    () => ({
      initializing,
      session,
      profile,
      isAdmin: profile?.role === 'admin' && profile.is_active !== false,
      notice,
      signIn,
      signOut,
      sendPasswordReset,
      refreshProfile,
      setProfile: setProfileState,
      clearNotice: () => setNotice(null),
    }),
    [initializing, session, profile, notice, signIn, signOut, sendPasswordReset, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
