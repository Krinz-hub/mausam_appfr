import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebaseConfig';
import { User } from '../../types/auth';
import { withTimeout } from './withTimeout';

function toAppUser(firebaseUser: FirebaseUser): User {
  return {
    id: firebaseUser.uid,
    googleSubjectId: firebaseUser.providerData.find((provider) => provider.providerId === 'google.com')?.uid || firebaseUser.uid,
    email: firebaseUser.email || `${firebaseUser.uid}@mausam.in`,
    displayName: firebaseUser.displayName || 'Friend',
    avatarUrl: firebaseUser.photoURL || undefined,
    onboardingCompleted: false,
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
  };
}

export class FirebaseAuthService {
  private static cachedToken: string | null = null;

  public static async getIdToken(): Promise<string | null> {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) return this.cachedToken;

    try {
      const token = await auth.currentUser.getIdToken(false);
      this.cachedToken = token;
      return token;
    } catch (error) {
      console.warn('AUTH_FIREBASE_TOKEN_ERROR', error);
      return this.cachedToken;
    }
  }

  /** Completes Firebase sign-in from an ID token issued by the native Google SDK. */
  public static async signInWithGoogleCredential(idToken: string): Promise<{
    user: User;
    idToken: string;
    isNewUser: boolean;
  }> {
    const auth = getFirebaseAuth();
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Check the EXPO_PUBLIC_FIREBASE_* values.');
    }

    try {
      const credential = GoogleAuthProvider.credential(idToken);
      console.log('AUTH_FIREBASE_CREDENTIAL_CREATED');
      console.log('AUTH_FIREBASE_SIGN_IN_START');
      const result = await signInWithCredential(auth, credential);
      const isNewUser = Boolean(getAdditionalUserInfo(result)?.isNewUser);
      const firebaseIdToken = await result.user.getIdToken();
      this.cachedToken = firebaseIdToken;
      console.log('AUTH_FIREBASE_SIGN_IN_SUCCESS', { uid: result.user.uid, isNewUser });
      return { user: toAppUser(result.user), idToken: firebaseIdToken, isNewUser };
    } catch (error) {
      console.error('AUTH_FIREBASE_SIGN_IN_ERROR', error);
      throw error;
    }
  }

  /** Web keeps Firebase's browser popup flow; native uses the Google SDK above. */
  public static async signInWithGoogleOnWeb(): Promise<{
    user: User;
    idToken: string;
    isNewUser: boolean;
  }> {
    const auth = getFirebaseAuth();
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Check the EXPO_PUBLIC_FIREBASE_* values.');
    }

    try {
      console.log('AUTH_FIREBASE_SIGN_IN_START');
      const result = await withTimeout(
        signInWithPopup(auth, new GoogleAuthProvider()),
        'Google sign-in did not open. Please allow popups and try again.'
      );
      const firebaseIdToken = await result.user.getIdToken();
      this.cachedToken = firebaseIdToken;
      const isNewUser = Boolean(getAdditionalUserInfo(result)?.isNewUser);
      console.log('AUTH_FIREBASE_SIGN_IN_SUCCESS', { uid: result.user.uid, isNewUser });
      return { user: toAppUser(result.user), idToken: firebaseIdToken, isNewUser };
    } catch (error) {
      console.error('AUTH_FIREBASE_SIGN_IN_ERROR', error);
      throw error;
    }
  }

  public static async signOut(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) await firebaseSignOut(auth);
    this.cachedToken = null;
  }

  public static onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    const auth = getFirebaseAuth();
    return auth ? onAuthStateChanged(auth, callback) : () => {};
  }
}
