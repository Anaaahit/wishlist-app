import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

interface StoredUser {
  email: string;
  passwordHash: string;
  createdAt: number;
}

export interface User {
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

const USERS_KEY = '@wishlist_users';
const SESSION_KEY = '@wishlist_session';
const GUEST_EMAIL = 'guest@wishlist.local';
const SALT = 'wishlistapp';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isValidEmail = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email.trim());

const hashPassword = (email: string, password: string): Promise<string> =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${SALT}:${email.trim().toLowerCase()}:${password}`);

const loadUsers = async (): Promise<StoredUser[]> => {
  try {
    const stored = await AsyncStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load users:', e);
    return [];
  }
};

const saveUsers = async (users: StoredUser[]) => {
  try {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
};

const loadSession = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch (e) {
    console.error('Failed to load session:', e);
    return null;
  }
};

const saveSession = async (email: string | null) => {
  try {
    if (email) {
      await AsyncStorage.setItem(SESSION_KEY, email);
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to save session:', e);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    const sessionEmail = await loadSession();
    if (sessionEmail) {
      if (sessionEmail === GUEST_EMAIL) {
        setUser({ email: GUEST_EMAIL, isGuest: true });
      } else {
        const users = await loadUsers();
        if (users.some((u) => u.email === sessionEmail)) {
          setUser({ email: sessionEmail, isGuest: false });
        } else {
          await saveSession(null);
        }
      }
    }
    setIsLoading(false);
  };

  const register = useCallback(async (email: string, password: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) {
      throw new Error('Please enter a valid email address.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    const users = await loadUsers();
    if (users.some((u) => u.email === trimmed)) {
      throw new Error('An account with this email already exists. Try logging in.');
    }
    const passwordHash = await hashPassword(trimmed, password);
    users.push({ email: trimmed, passwordHash, createdAt: Date.now() });
    await saveUsers(users);
    await saveSession(trimmed);
    setUser({ email: trimmed, isGuest: false });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed) || !password) {
      throw new Error('Please enter your email and password.');
    }
    const users = await loadUsers();
    const found = users.find((u) => u.email === trimmed);
    const passwordHash = await hashPassword(trimmed, password);
    if (!found || found.passwordHash !== passwordHash) {
      throw new Error('Incorrect email or password.');
    }
    await saveSession(trimmed);
    setUser({ email: trimmed, isGuest: false });
  }, []);

  const loginAsGuest = useCallback(async () => {
    await saveSession(GUEST_EMAIL);
    setUser({ email: GUEST_EMAIL, isGuest: true });
  }, []);

  const logout = useCallback(async () => {
    await saveSession(null);
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
