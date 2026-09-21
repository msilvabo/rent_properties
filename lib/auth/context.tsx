'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AppRole } from '@/types/user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  role: AppRole | null;
  isAdmin: boolean;
  avatarUrl: string | null;
  displayName: string;
  userEmail: string;
  refreshRole: () => Promise<void>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: AuthError | null }>;
  signInWithGithub: (redirectTo?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Compute avatar URL from Google/GitHub user metadata
  const avatarUrl = useMemo(() => {
    if (!user) return null;
    const metadata = user.user_metadata;
    return (
      metadata?.avatar_url ||
      metadata?.picture ||
      metadata?.image ||
      null
    );
  }, [user]);

  // Compute friendly display name
  const displayName = useMemo(() => {
    if (!user) return '';
    const metadata = user.user_metadata;
    return (
      metadata?.full_name ||
      metadata?.name ||
      metadata?.user_name ||
      user.email?.split('@')[0] ||
      'Usuario'
    );
  }, [user]);

  const userEmail = useMemo(() => {
    return user?.email || '';
  }, [user]);

  // Fetch or ensure user role in public.user_roles
  const fetchUserRole = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setRole(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.warn('[AuthProvider] Error fetching role from user_roles:', error.message);
      }

      if (data && data.role) {
        setRole(data.role as AppRole);
      } else {
        // If no role record exists yet, try inserting a default 'user' record
        const meta = currentUser.user_metadata;
        const newFullName = meta?.full_name || meta?.name || currentUser.email?.split('@')[0] || 'Usuario';
        const newAvatar = meta?.avatar_url || meta?.picture || null;

        const { data: insertedData, error: insertError } = await supabase
          .from('user_roles')
          .upsert(
            {
              user_id: currentUser.id,
              email: currentUser.email || '',
              full_name: newFullName,
              avatar_url: newAvatar,
              role: 'user',
            },
            { onConflict: 'user_id' }
          )
          .select('role')
          .maybeSingle();

        if (!insertError && insertedData?.role) {
          setRole(insertedData.role as AppRole);
        } else {
          setRole('user');
        }
      }
    } catch (err) {
      console.error('[AuthProvider] Error resolving user role:', err);
      setRole('user');
    }
  }, []);

  const refreshRole = useCallback(async () => {
    await fetchUserRole(user);
  }, [fetchUserRole, user]);

  useEffect(() => {
    let mounted = true;

    // 1. Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserRole(currentUser);
      }
      setIsLoading(false);
    });

    // 2. Listen for auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserRole(currentUser);
      } else {
        setRole(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const isAdmin = useMemo(() => role === 'admin', [role]);

  const getCallbackUrl = (redirectTo?: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (redirectTo) {
      return `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
    }
    return `${origin}/auth/callback`;
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    const callbackUrl = getCallbackUrl(redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    return { error };
  };

  const signInWithGithub = async (redirectTo?: string) => {
    const callbackUrl = getCallbackUrl(redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: callbackUrl,
      },
    });

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setRole(null);
    }
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        role,
        isAdmin,
        avatarUrl,
        displayName,
        userEmail,
        refreshRole,
        signInWithGoogle,
        signInWithGithub,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
