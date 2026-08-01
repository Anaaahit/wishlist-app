import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/services/supabase';

export interface User {
  id: string | null;
  email: string;
  isGuest: boolean;
}

interface PendingLogin {
  email: string;
  password: string;
  pinHash: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (email: string, password: string, pin: string) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  verifyPin: (pin: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const GUEST_KEY = '@wishlist_guest';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const friendlyMessage = (msg: string): string => {
  const m = (msg || '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (m.includes('already registered')) return 'An account with this email already exists. Try logging in.';
  if (m.includes('password should be at least')) return 'Password must be at least 6 characters.';
  if (m.includes('valid email')) return 'Please enter a valid email address.';
  if (m.includes('not confirmed')) return 'Please confirm your email first, then log in.';
  return msg;
};

const hashPin = async (email: string, pin: string): Promise<string> => {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${email.trim().toLowerCase()}:${pin}`);
};

const requireSupabase = (): void => {
  if (!supabase) {
    throw new Error('Set up Supabase first. Add your project URL and anon key in constants/supabase.ts');
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const ignoreSession = useRef(false);
  const pendingLogin = useRef<PendingLogin | null>(null);

  const checkGuest = useCallback(async (): Promise<boolean> => {
    const flag = await AsyncStorage.getItem(GUEST_KEY);
    if (flag === 'true') {
      setUser({ id: null, email: '', isGuest: true });
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            if (mounted) {
              setUser({
                id: data.session.user.id,
                email: data.session.user.email ?? '',
                isGuest: false,
              });
              setIsLoading(false);
            }
            return;
          }
        }
        if (mounted) {
          await checkGuest();
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
        if (mounted) {
          await checkGuest();
          setIsLoading(false);
        }
      }
    };

    boot();

    let subscription: { unsubscribe: () => void } | null = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted || ignoreSession.current) return;
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? '', isGuest: false });
        } else {
          checkGuest().then((guest) => {
            if (!guest && mounted) setUser(null);
          });
        }
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [checkGuest]);

  const register = useCallback(async (email: string, password: string, pin: string) => {
    requireSupabase();
    const normalized = email.trim().toLowerCase();
    const pinHash = await hashPin(normalized, pin);
    const { data, error } = await supabase!.auth.signUp({
      email: normalized,
      password,
      options: { data: { pinHash } },
    });
    if (error) throw new Error(friendlyMessage(error.message));
    if (!data.session) {
      const { error: signInError } = await supabase!.auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (signInError) throw new Error(friendlyMessage(signInError.message));
    }
    await AsyncStorage.removeItem(GUEST_KEY);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    requireSupabase();
    const normalized = email.trim().toLowerCase();
    ignoreSession.current = true;
    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (error) throw new Error(friendlyMessage(error.message));
      const uid = data.user?.id;
      if (!uid) throw new Error('Login succeeded, but no user data was returned.');
      const pinHash = data.user?.user_metadata?.pinHash as string | undefined;
      if (!pinHash) {
        await AsyncStorage.removeItem(GUEST_KEY);
        setUser({ id: uid, email: data.user?.email ?? '', isGuest: false });
        return false;
      }
      await supabase!.auth.signOut();
      pendingLogin.current = { email: normalized, password, pinHash };
      return true;
    } finally {
      ignoreSession.current = false;
    }
  }, []);

  const verifyPin = useCallback(async (pin: string) => {
    requireSupabase();
    const pending = pendingLogin.current;
    if (!pending) throw new Error('Please log in again with your email and password.');
    const pinHash = await hashPin(pending.email, pin);
    if (pinHash !== pending.pinHash) {
      throw new Error('Incorrect PIN. Please try again.');
    }
    const { error } = await supabase!.auth.signInWithPassword({
      email: pending.email,
      password: pending.password,
    });
    pendingLogin.current = null;
    if (error) throw new Error(friendlyMessage(error.message));
    await AsyncStorage.removeItem(GUEST_KEY);
  }, []);

  const loginAsGuest = useCallback(async () => {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session) await supabase.auth.signOut();
    }
    await AsyncStorage.setItem(GUEST_KEY, 'true');
    setUser({ id: null, email: '', isGuest: true });
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(GUEST_KEY);
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, register, login, verifyPin, loginAsGuest, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
