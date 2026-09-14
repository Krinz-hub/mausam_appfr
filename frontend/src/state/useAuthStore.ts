import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';
import { ApiClient } from '../services/api/apiClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const STORAGE_KEY = '@mausam_auth_session';

function mapBackendUser(backendUser: any): User {
  return {
    id: backendUser._id || backendUser.id,
    name: backendUser.name || backendUser.displayName || 'Friend',
    displayName: backendUser.displayName || backendUser.name || 'Friend',
    email: backendUser.email,
    avatarUrl: backendUser.avatar || backendUser.photoURL,
    photoURL: backendUser.photoURL || backendUser.avatar,
    onboardingCompleted: Boolean(backendUser.onboardingCompleted),
    createdAt: backendUser.createdAt || new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  initialize: async () => {
    try {
      // 1. Instant local restore from cache
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const token = await ApiClient.getToken();

      if (stored && token) {
        const cachedUser: User = JSON.parse(stored);
        set({ user: cachedUser, isAuthenticated: true, isLoading: false });

        // 2. Background sync with backend to verify validity
        try {
          const res = await ApiClient.getMe();
          if (res && res.user) {
            const syncedUser = mapBackendUser(res.user);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(syncedUser));
            set({ user: syncedUser });
          }
        } catch (err: any) {
          // If token expired or unauthorized, clear session
          if (err?.message?.includes('401') || err?.message?.includes('token') || err?.message?.includes('expired')) {
            await AsyncStorage.multiRemove([
              STORAGE_KEY,
              '@mausam_auth_token',
              '@mausam_need_profile',
              '@mausam_persona_profile',
              '@mausam_onboarding_state',
            ]);
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }
        }
        return;
      }
    } catch (e) {
      console.warn('Failed to restore session', e);
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ApiClient.login(email.trim(), password);
      if (!res.user) {
        throw new Error('Login failed: Invalid server response.');
      }
      const user = mapBackendUser(res.user);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: any) {
      const message = err.message || 'Login failed. Please check your credentials.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ApiClient.register(name.trim(), email.trim(), password);
      if (!res.user) {
        throw new Error('Registration failed: Invalid server response.');
      }
      const user = mapBackendUser(res.user);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: any) {
      const message = err.message || 'Registration failed. Please try again.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await ApiClient.logout();
    } catch (err) {
      console.warn('Error during sign out', err);
    }
    await AsyncStorage.multiRemove([
      STORAGE_KEY,
      '@mausam_auth_token',
      '@mausam_need_profile',
      '@mausam_persona_profile',
      '@mausam_onboarding_state',
    ]);
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  setOnboardingCompleted: async (completed: boolean) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, onboardingCompleted: completed };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ user: updated });
  },

  refreshProfile: async () => {
    try {
      const res = await ApiClient.getMe();
      if (res && res.user) {
        const synced = mapBackendUser(res.user);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
        set({ user: synced });
      }
    } catch (err) {
      console.warn('Failed to refresh profile from backend', err);
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true });
    try {
      await ApiClient.deleteAccount();
    } catch (err) {
      console.warn('Failed to delete account on backend', err);
    }
    await AsyncStorage.clear();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
