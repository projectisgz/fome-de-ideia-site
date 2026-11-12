import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  recovery: boolean;
  signOut: () => Promise<void>;
  clearRecovery: () => void;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: false, recovery: false, signOut: async () => undefined, clearRecovery: () => undefined });

function hasRecoveryCallback() {
  const query = new URLSearchParams(window.location.search);
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return query.get('auth') === 'recovery' || query.get('type') === 'recovery' || fragment.get('type') === 'recovery';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [recovery, setRecovery] = useState(hasRecoveryCallback);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) { setSession(data.session); setLoading(false); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    loading,
    recovery,
    signOut: async () => { if (supabase) await supabase.auth.signOut(); },
    clearRecovery: () => {
      setRecovery(false);
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    },
  }), [session, loading, recovery]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
