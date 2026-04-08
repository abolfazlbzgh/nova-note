'use client';

import {createContext, useCallback, useContext, useEffect, useState, type ReactNode} from 'react';
import {onAuthStateChanged, type User, getIdTokenResult, signOut as firebaseSignOut} from 'firebase/auth';
import {Role} from '@/types/roles';
import {auth} from '@/libs/firebaseConfig';

export type CustomClaims = {
  role?: Role;
  status?: string;
  picture?: string;
  name?: string;
};

type AuthContextValue = {
  user: User | null;
  claims: CustomClaims | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  claims: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<CustomClaims | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSessionCookie = async (token: string) => {
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token}),
      });
    } catch (e) {
      console.warn('Session sync failed', e);
    }
  };

  const updateClaims = async (u: User, forceRefresh = false) => {
    try {
      const tokenResult = await getIdTokenResult(u, forceRefresh);

      if (forceRefresh) {
        await u.reload();
      }
      setClaims({
        role: tokenResult.claims.role as Role,
        status: tokenResult.claims.status as string,
        picture: tokenResult.claims.picture as string,
        name: tokenResult.claims.name as string,
      });

      await syncSessionCookie(tokenResult.token);
    } catch (e) {
      console.error('Failed to update claims', e);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (u) => {
      if (u) {
        setUser(u);
        await updateClaims(u);
      } else {
        setUser(null);
        setClaims(null);
        await fetch('/api/auth/session', {method: 'DELETE'});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const refreshUser = useCallback(async () => {
    if (user) {
      await updateClaims(user, true);
    }
  }, [user]);

  return <AuthContext.Provider value={{user, claims, loading, signOut, refreshUser}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
