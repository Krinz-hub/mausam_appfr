import AsyncStorage from '@react-native-async-storage/async-storage';

function getPlatformOS(): string {
  try {
    const RN = require('react-native');
    if (RN?.Platform?.OS) return RN.Platform.OS;
  } catch {
    // Fallback if running directly in node runner without bundler
  }
  if (typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent || '')) {
    return 'android';
  }
  return 'web';
}

function getExpoHostIp(): string | null {
  try {
    const Constants = require('expo-constants').default || require('expo-constants');
    const hostUri =
      Constants?.expoConfig?.hostUri ||
      Constants?.manifest?.debuggerHost ||
      Constants?.manifest2?.extra?.expoGo?.debuggerHost;

    if (hostUri) {
      const hostIp = hostUri.split(':')[0];
      if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
        return hostIp;
      }
    }
  } catch {
    // Ignore in non-Expo environment
  }
  return null;
}

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  // If explicitly configured with an external/remote URL, use it directly
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  const os = getPlatformOS();

  // Web platform connects to localhost directly
  if (os === 'web') {
    return envUrl || 'http://localhost:3000/api';
  }

  // Auto-detect host machine IP from Expo bundler (works on both physical Android/iOS phones and emulators)
  const expoHost = getExpoHostIp();
  if (expoHost) {
    return `http://${expoHost}:3000/api`;
  }

  // Android Emulator fallback to host machine
  if (os === 'android') {
    return 'http://10.0.2.2:3000/api';
  }

  // iOS simulator or default fallback
  return envUrl || 'http://localhost:3000/api';
}

export const API_BASE_URL = getApiBaseUrl();

export const CACHE_KEYS = {
  USER_PROFILE: '@mausam_api_cache_user',
  PERSONALIZATION: '@mausam_api_cache_personalization',
  AUTH_TOKEN: '@mausam_auth_token',
};

export class ApiClient {
  private static cachedToken: string | null = null;
  private static customTokenGetter: (() => Promise<string | null>) | null = null;

  public static setTokenGetter(getter: (() => Promise<string | null>) | null) {
    this.customTokenGetter = getter;
  }

  public static async getToken(): Promise<string | null> {
    if (this.customTokenGetter) {
      return this.customTokenGetter();
    }
    if (this.cachedToken) {
      return this.cachedToken;
    }
    try {
      const token = await AsyncStorage.getItem(CACHE_KEYS.AUTH_TOKEN);
      this.cachedToken = token;
      return token;
    } catch {
      return null;
    }
  }

  public static async setToken(token: string | null): Promise<void> {
    this.cachedToken = token;
    try {
      if (token) {
        await AsyncStorage.setItem(CACHE_KEYS.AUTH_TOKEN, token);
      } else {
        await AsyncStorage.removeItem(CACHE_KEYS.AUTH_TOKEN);
      }
    } catch (err) {
      console.warn('Failed to save auth token to storage', err);
    }
  }

  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Failed to retrieve auth token for request', err);
    }

    return headers;
  }

  /**
   * Performs an authenticated HTTP fetch with timeout, error extraction,
   * cookie credential inclusion, and fallback offline caching.
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackCacheKey?: string
  ): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();

    const config: RequestInit = {
      credentials: 'include', // Includes HTTP-only cookies in browsers
      ...options,
      headers: {
        ...authHeaders,
        ...(options.headers || {}),
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as T;

      // Update offline cache if configured
      if (fallbackCacheKey) {
        AsyncStorage.setItem(fallbackCacheKey, JSON.stringify(data)).catch(() => {});
      }

      return data;
    } catch (error: any) {
      // If network/offline error and cache exists, return cached data
      if (fallbackCacheKey) {
        const cached = await AsyncStorage.getItem(fallbackCacheKey);
        if (cached) {
          console.log(`[ApiClient] Network request failed (${error.message}). Serving from cache: ${endpoint}`);
          return JSON.parse(cached) as T;
        }
      }
      throw error;
    }
  }

  /**
   * POST /api/auth/register
   * Registers a new user with name, email, and password.
   */
  public static async register(
    name: string,
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    token: string;
    user: any;
  }> {
    const res = await this.request<{ success: boolean; token: string; user: any }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      },
      CACHE_KEYS.USER_PROFILE
    );

    if (res?.token) {
      await this.setToken(res.token);
    }
    return res;
  }

  /**
   * POST /api/auth/login
   * Authenticates an existing user with email and password.
   */
  public static async login(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    token: string;
    user: any;
  }> {
    const res = await this.request<{ success: boolean; token: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      CACHE_KEYS.USER_PROFILE
    );

    if (res?.token) {
      await this.setToken(res.token);
    }
    return res;
  }

  /**
   * POST /api/auth/logout
   * Clears the HTTP-only cookie and local token.
   */
  public static async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await this.request<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Ignore network errors on logout
    }
    await this.setToken(null);
    await AsyncStorage.multiRemove([
      CACHE_KEYS.USER_PROFILE,
      CACHE_KEYS.PERSONALIZATION,
      CACHE_KEYS.AUTH_TOKEN,
    ]);
    return { success: true, message: 'Logged out successfully' };
  }

  /**
   * GET /api/auth/me
   */
  public static async getMe(): Promise<{ success: boolean; user: any }> {
    return this.request('/auth/me', { method: 'GET' }, CACHE_KEYS.USER_PROFILE);
  }

  /**
   * PATCH /api/me/profile
   */
  public static async updateProfile(data: { displayName?: string; photoURL?: string }): Promise<any> {
    return this.request('/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH /api/me/preferences
   */
  public static async updatePreferences(preferences: Record<string, any>): Promise<any> {
    return this.request('/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }

  /**
   * POST /api/me/onboarding
   */
  public static async submitOnboarding(data: {
    userTypeKeys: string[];
    weatherFactorKeys: string[];
    activePeriods: string[];
    explanation?: string;
  }): Promise<{ success: boolean; user: any }> {
    return this.request(
      '/me/onboarding',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      CACHE_KEYS.USER_PROFILE
    );
  }

  /**
   * GET /api/me/personalization
   */
  public static async getPersonalization(): Promise<{ success: boolean; personalization: any }> {
    return this.request('/me/personalization', { method: 'GET' }, CACHE_KEYS.PERSONALIZATION);
  }

  /**
   * DELETE /api/me
   */
  public static async deleteAccount(): Promise<any> {
    const res = await this.request('/me', { method: 'DELETE' });
    await this.setToken(null);
    await AsyncStorage.multiRemove([
      CACHE_KEYS.USER_PROFILE,
      CACHE_KEYS.PERSONALIZATION,
      CACHE_KEYS.AUTH_TOKEN,
    ]);
    return res;
  }
}
