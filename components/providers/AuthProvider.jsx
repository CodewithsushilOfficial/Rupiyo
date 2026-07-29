"use client";

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const AuthContext = React.createContext({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const supabase = createClient();

    // 1. Initial Session Restoration
    async function initSession() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);
      } catch (err) {
        console.error('[AUTH_INIT_ERROR]:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setIsLoading(false);

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        router.push('/login');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    router.push('/login');
  };

  // Prevent flash of unauthenticated content during initial session restoration
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-6">
        <div className="flex items-center gap-3 mb-6 animate-pulse">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
            ₹
          </div>
          <span className="text-3xl font-extrabold tracking-tight">Rupiyo</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
          <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span>Loading your account...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
