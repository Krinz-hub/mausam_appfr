import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  Auth,
  inMemoryPersistence,
  Persistence,
} from 'firebase/auth';
import * as FirebaseAuthModule from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;

/**
 * Returns the centralized FirebaseApp singleton instance.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (appInstance) return appInstance;
  if (!isFirebaseConfigured) return null;

  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return appInstance;
  } catch (err) {
    console.warn('Failed to initialize Firebase app:', err);
    return null;
  }
}

/**
 * Returns the centralized FirebaseAuth singleton configured with React Native persistence.
 *
 * Uses `initializeAuth` with `getReactNativePersistence(AsyncStorage)` on React Native
 * rather than calling `getAuth(app)` first, preventing the warning:
 * "@firebase/auth: Auth (12.18.0): You are initializing Firebase Auth for React Native without providing AsyncStorage."
 */
export function getFirebaseAuth(): Auth | null {
  if (authInstance) return authInstance;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    const isWeb = typeof window !== 'undefined' && typeof (window as any).document !== 'undefined';
    // 1. On Web, standard getAuth(app) integrates seamlessly with browser popups and local persistence
    if (isWeb) {
      authInstance = getAuth(app);
      return authInstance;
    }

    // 2. On Native (Android / iOS), initialize with React Native AsyncStorage persistence
    let persistence: Persistence = inMemoryPersistence;
    const getRNPersistence = (FirebaseAuthModule as any).getReactNativePersistence;
    if (typeof getRNPersistence === 'function') {
      persistence = getRNPersistence(AsyncStorage);
    }

    try {
      authInstance = initializeAuth(app, { persistence });
    } catch (initErr: any) {
      authInstance = getAuth(app);
    }

    return authInstance;
  } catch (err) {
    console.warn('Failed to initialize Firebase Auth with persistence:', err);
    return null;
  }
}
