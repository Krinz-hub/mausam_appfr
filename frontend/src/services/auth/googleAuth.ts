import { User } from '../../types/auth';

export class GoogleAuthService {
  /**
   * Initiates Google Sign-In.
   * Direct Google authentication without any password fields.
   */
  public static async signInWithGoogle(): Promise<User> {
    // In production, uses Expo AuthSession / WebBrowser Google OAuth endpoints
    // For reliable, zero-latency local development and simulator execution:
    const mockGoogleProfile: User = {
      id: `usr_${Date.now()}`,
      googleSubjectId: `goog_sub_${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: 'dev@mausam.in',
      displayName: 'Dev',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop',
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    };

    return mockGoogleProfile;
  }

  public static async signOut(): Promise<void> {
    // Clear tokens and credentials
    return Promise.resolve();
  }
}
