import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { auth } from '@/lib/firebase';
import { getUserProfile, upsertUserProfile } from '@/services/firestore/users';
import { BlueprintUserRole, UserProfile } from '@/types/firestore';

export type UserRole = BlueprintUserRole | 'supplier';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  farmName?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    farmName?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveAppRole(profileRole: BlueprintUserRole, email: string): UserRole {
  if (email.toLowerCase().includes('supplier')) return 'supplier';
  return profileRole;
}

function profileToAuthUser(uid: string, profile: UserProfile, email: string): AuthUser {
  return {
    id: uid,
    email: profile.email || email,
    name: profile.name,
    role: resolveAppRole(profile.role, email),
    farmName: profile.farmName,
  };
}

function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    default:
      return 'Authentication failed. Please try again.';
  }
}

async function loadAuthUser(firebaseUser: User): Promise<AuthUser> {
  const profile = await getUserProfile(firebaseUser.uid);
  if (profile) {
    return profileToAuthUser(firebaseUser.uid, profile, firebaseUser.email ?? '');
  }
  // Profile missing — create minimal profile from auth record
  const role: BlueprintUserRole = firebaseUser.email?.includes('admin') ? 'admin' : 'farmer';
  await upsertUserProfile(firebaseUser.uid, {
    name: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
    email: firebaseUser.email ?? '',
    role,
  });
  const created = await getUserProfile(firebaseUser.uid);
  if (created) {
    return profileToAuthUser(firebaseUser.uid, created, firebaseUser.email ?? '');
  }
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    name: firebaseUser.displayName ?? 'User',
    role: resolveAppRole(role, firebaseUser.email ?? ''),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const authUser = await loadAuthUser(firebaseUser);
        setUser(authUser);
      } catch {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          name: firebaseUser.displayName ?? 'User',
          role: resolveAppRole('farmer', firebaseUser.email ?? ''),
        });
      } finally {
        setIsLoading(false);
      }
    });
    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email.trim()) return { ok: false, error: 'Email is required' };
    if (!password) return { ok: false, error: 'Password is required' };
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { ok: true };
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? '';
      return { ok: false, error: mapAuthError(code) };
    }
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      role: UserRole;
      farmName?: string;
    }) => {
      if (!data.email.trim() || !data.name.trim()) {
        return { ok: false, error: 'Name and email are required' };
      }
      if (data.role === 'supplier') {
        return { ok: false, error: 'Supplier accounts must be created by an administrator' };
      }
      const blueprintRole: BlueprintUserRole = data.role === 'admin' ? 'admin' : 'farmer';
      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          data.email.trim(),
          data.password,
        );
        await upsertUserProfile(cred.user.uid, {
          name: data.name.trim(),
          email: data.email.trim(),
          role: blueprintRole,
          farmName: data.farmName,
        });
        return { ok: true };
      } catch (e: unknown) {
        const code = (e as { code?: string }).code ?? '';
        return { ok: false, error: mapAuthError(code) };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
