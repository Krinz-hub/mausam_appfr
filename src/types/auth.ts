export interface User {
  id: string;
  googleSubjectId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
