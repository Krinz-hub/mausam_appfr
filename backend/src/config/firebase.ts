import admin from 'firebase-admin';
import { ENV } from './env.js';

let firebaseApp: admin.app.App | null = null;
let isInitialized = false;

export function initFirebase(): void {
  if (isInitialized) return;

  if (ENV.FIREBASE_PROJECT_ID && ENV.FIREBASE_CLIENT_EMAIL && ENV.FIREBASE_PRIVATE_KEY) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: ENV.FIREBASE_PROJECT_ID,
          clientEmail: ENV.FIREBASE_CLIENT_EMAIL,
          privateKey: ENV.FIREBASE_PRIVATE_KEY,
        }),
      });
      isInitialized = true;
      console.log('✅ Firebase Admin SDK initialized with service credentials');
    } catch (err) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', err);
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      isInitialized = true;
      console.log('✅ Firebase Admin SDK initialized with application default credentials');
    } catch (err) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', err);
    }
  } else {
    console.warn('⚠️ Firebase Admin credentials not provided in .env');
    if (ENV.ALLOW_DEV_MOCK_AUTH) {
      console.log('ℹ️ Development mock authentication is ENABLED for local testing');
    }
  }
}

import { OAuth2Client } from 'google-auth-library';

const googleOAuthClient = new OAuth2Client();

export interface VerifiedToken {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

const TRUSTED_AUDIENCES = [
  '896702115030-6d0doavre0979p4q50q4ip0b0e04hr6t.apps.googleusercontent.com',
  '896702115030-unue1isrgook1shc7u9kv52ji2874r76.apps.googleusercontent.com',
  '896702115030-f03mqdn86jbe1i0koajieq488fg0n4h2.apps.googleusercontent.com',
];

/**
 * Verifies an authentication token:
 * 1. Firebase ID Token via Firebase Admin SDK
 * 2. Google OAuth ID Token via Google OAuth2Client (cryptographic signature + aud check)
 * 3. Google OAuth Access Token via Google tokeninfo verification
 * 4. Development Fallback (if ALLOW_DEV_MOCK_AUTH enabled)
 */
export async function verifyToken(token: string): Promise<VerifiedToken> {
  // 1. Try Firebase Admin ID Token verification
  if (isInitialized && firebaseApp) {
    try {
      const decoded = await firebaseApp.auth().verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email,
        displayName: decoded.name,
        photoURL: decoded.picture,
      };
    } catch (err: any) {
      // Not a Firebase ID token (could be a Google ID or Access token)
    }
  }

  // 2. Try Google OAuth ID Token verification with Google Auth Library
  try {
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: token,
      audience: TRUSTED_AUDIENCES,
    });
    const payload = ticket.getPayload();
    if (payload && payload.sub) {
      return {
        uid: `google_${payload.sub}`,
        email: payload.email,
        displayName: payload.name || (payload.email ? payload.email.split('@')[0] : 'User'),
        photoURL: payload.picture,
      };
    }
  } catch (err: any) {
    // Not a valid Google ID token
  }

  // 3. Try Google OAuth Access Token verification via Google Tokeninfo API
  try {
    const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`);
    if (infoRes.ok) {
      const info = (await infoRes.json()) as { user_id?: string; sub?: string; email?: string; aud?: string };
      const sub = info.sub || info.user_id;
      if (sub) {
        let displayName = info.email ? info.email.split('@')[0] : 'User';
        let photoURL: string | undefined = undefined;

        try {
          const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userInfo = (await userRes.json()) as { name?: string; picture?: string };
            if (userInfo.name) displayName = userInfo.name;
            if (userInfo.picture) photoURL = userInfo.picture;
          }
        } catch {
          // Ignore profile fetch failure, core token is verified
        }

        return {
          uid: `google_${sub}`,
          email: info.email,
          displayName,
          photoURL,
        };
      }
    }
  } catch {
    // Not a valid Google access token
  }

  // 4. Development Fallback for mock/test tokens
  if (ENV.ALLOW_DEV_MOCK_AUTH) {
    if (token.startsWith('mock_') || token.startsWith('dev_') || token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          if (payload.user_id || payload.sub) {
            return {
              uid: payload.user_id || payload.sub,
              email: payload.email || 'dev@mausam.in',
              displayName: payload.name || 'User',
              photoURL: payload.picture,
            };
          }
        }
      } catch {
        // Fall through
      }

      const uid = token.replace(/^(mock_|dev_)/, '') || 'usr_dev_default';
      return {
        uid: `firebase_${uid}`,
        email: `${uid}@mausam.in`,
        displayName: 'User',
      };
    }
  }

  throw new Error('Invalid or unverified authentication token');
}

export async function deleteFirebaseUser(uid: string): Promise<void> {
  if (isInitialized && firebaseApp) {
    try {
      await firebaseApp.auth().deleteUser(uid);
      console.log(`Deleted Firebase user ${uid}`);
    } catch (err) {
      console.warn(`Failed to delete Firebase user ${uid}:`, err);
    }
  }
}
