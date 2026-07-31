import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';

export interface User {
  id: string | null;
  email: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
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
  if (m.includes('not confirmed')) return 'Please confirm your email first, then log in.';
  if (m.includes('valid email')) return 'Please enter a valid email address.';
  return msg;
};

const requireSupabase = (): void => {
  if (!supabase) {
    throw new Error('Set up Supabase first. Add your project URL and anon key in constants/supabase.ts');
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        if (!mounted) return;
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

  const register = useCallback(async (email: string, password: string) => {
    requireSupabase();
    const { data, error } = await supabase!.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error(friendlyMessage(error.message));
    if (!data.session) {
      throw new Error('Check your email to confirm your account, then log in.');
    }
    await AsyncStorage.removeItem(GUEST_KEY);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    requireSupabase();
    const { error } = await supabase!.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
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
    <AuthContext.Provider value={{ user, isLoading, register, login, loginAsGuest, logout }}>
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
