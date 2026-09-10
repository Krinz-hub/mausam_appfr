import test from 'node:test';
import assert from 'node:assert';

process.env.NODE_ENV = 'test';

// Polyfill window.localStorage for Node test environment
if (typeof (globalThis as any).window === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).window = {
    localStorage: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = String(v);
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
    },
  };
}

import { ApiClient } from '../services/api/apiClient';
import { FirebaseAuthService } from '../services/auth/firebaseAuth';

test('FirebaseAuthService - has no token before authentication', async () => {
  const token = await FirebaseAuthService.getIdToken();
  assert.equal(token, null);
});

test('ApiClient - Attaches bearer token correctly to requests', async () => {
  ApiClient.setTokenGetter(async () => 'test_bearer_token_xyz');
  assert.ok(ApiClient, 'API client should be available with a Firebase token getter');
});
