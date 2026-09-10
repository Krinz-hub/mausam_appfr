import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';
import { GoogleAuthService } from '../services/auth/googleAuth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const STORAGE_KEY = '@mausam_auth_session';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user: User = JSON.parse(stored);
        set({ user, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch (e) {
      console.warn('Failed to restore session', e);
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await GoogleAuthService.signInWithGoogle();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Google Sign-In failed', isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await GoogleAuthService.signOut();
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setOnboardingCompleted: async (completed: boolean) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, onboardingCompleted: completed };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ user: updated });
  },

  deleteAccount: async () => {
    await AsyncStorage.clear();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
