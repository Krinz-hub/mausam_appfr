export interface User {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  avatarUrl?: string;
  photoURL?: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
