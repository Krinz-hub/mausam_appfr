import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';
import { FirebaseAuthService } from '../services/auth/firebaseAuth';
import { ApiClient } from '../services/api/apiClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  beginGoogleSignIn: () => void;
  cancelGoogleSignIn: () => void;
  failGoogleSignIn: (message: string) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleCredential: (idToken: string) => Promise<void>;
  signInWithExpoGoFallback: () => Promise<void>;
  signOut: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const STORAGE_KEY = '@mausam_auth_session';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      // 1. Instant local restore from cache
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user: User = JSON.parse(stored);

        // Auto-purge any residual development dummy sessions
        if (
          user.email === 'dev@mausam.in' ||
          user.id?.startsWith('dev_') ||
          user.id === 'firebase_user_alex'
        ) {
          await AsyncStorage.multiRemove([
            STORAGE_KEY,
            '@mausam_dev_auth_token',
            '@mausam_dev_user_profile',
            '@mausam_need_profile',
            '@mausam_persona_profile',
            '@mausam_onboarding_state',
          ]);
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        set({ user, isAuthenticated: true, isLoading: false });

        // 2. Background sync with MongoDB backend
        try {
          const res = await ApiClient.getMe();
          if (res && res.user) {
            const syncedUser: User = {
              ...user,
              displayName: res.user.displayName || user.displayName,
              onboardingCompleted: res.user.onboardingCompleted,
            };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(syncedUser));
            set({ user: syncedUser });
          }
        } catch {
          // Keep cached user if offline
        }
        return;
      }
    } catch (e) {
      console.warn('Failed to restore session', e);
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  beginGoogleSignIn: () => set({ isLoading: true, error: null }),

  cancelGoogleSignIn: () => set({ isLoading: false, error: null }),

  failGoogleSignIn: (message: string) => set({ isLoading: false, error: message }),

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await FirebaseAuthService.signInWithGoogleOnWeb();
      await completeProfileInitialization(result.user, result.idToken, set);
    } catch (err: any) {
      console.error('AUTH_GOOGLE_ERROR', err);
      set({ error: err.message || 'Google Sign-In failed', isLoading: false });
      throw err;
    }
  },

  signInWithGoogleCredential: async (googleIdToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await FirebaseAuthService.signInWithGoogleCredential(googleIdToken);
      await completeProfileInitialization(result.user, result.idToken, set);
    } catch (err: any) {
      console.error('AUTH_GOOGLE_ERROR', err);
      set({ error: err.message || 'Google Sign-In failed', isLoading: false });
      throw err;
    }
  },

  signInWithExpoGoFallback: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('AUTH_EXPO_GO_FALLBACK_START');
      const fallbackUser: User = {
        id: 'user_expo_go',
        googleSubjectId: 'google_sub_expo_go',
        email: 'user@mausam.in',
        displayName: 'Mausam Friend',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop',
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
      };
      await completeProfileInitialization(fallbackUser, 'mock_expo_go_session', set);
    } catch (err: any) {
      console.error('AUTH_EXPO_GO_FALLBACK_ERROR', err);
      set({ error: err.message || 'Expo Go login failed', isLoading: false });
      throw err;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await FirebaseAuthService.signOut();
      await AsyncStorage.multiRemove([
        STORAGE_KEY,
        '@mausam_dev_auth_token',
        '@mausam_dev_user_profile',
        '@mausam_need_profile',
        '@mausam_persona_profile',
        '@mausam_onboarding_state',
      ]);
    } catch (err) {
      console.warn('Error during sign out', err);
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
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
        const current = get().user;
        if (current) {
          const updated: User = {
            ...current,
            displayName: res.user.displayName || current.displayName,
            onboardingCompleted: res.user.onboardingCompleted,
          };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          set({ user: updated });
        }
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
    await FirebaseAuthService.signOut();
    await AsyncStorage.clear();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));

async function completeProfileInitialization(
  firebaseUser: User,
  firebaseIdToken: string,
  set: (state: Partial<AuthState>) => void
): Promise<void> {
  console.log('AUTH_PROFILE_START');
  try {
    // This endpoint atomically finds the existing profile or creates the default
    // Mausam profile for a first-time Firebase user.
    const syncRes = await ApiClient.syncAuth(firebaseIdToken);
    if (!syncRes?.user) throw new Error('Profile initialization did not return a user.');

    const user: User = {
      ...firebaseUser,
      id: syncRes.user.firebaseUid || firebaseUser.id,
      displayName: syncRes.user.displayName || firebaseUser.displayName,
      avatarUrl: syncRes.user.photoURL || firebaseUser.avatarUrl,
      onboardingCompleted: Boolean(syncRes.user.onboardingCompleted),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    console.log('AUTH_PROFILE_SUCCESS', { isNewUser: Boolean(syncRes.isNewUser) });
    console.log('AUTH_COMPLETE', { uid: user.id });
    set({ user, isAuthenticated: true, isLoading: false, error: null });
  } catch (error) {
    console.error('AUTH_PROFILE_ERROR', error);
    throw error;
  }
}
