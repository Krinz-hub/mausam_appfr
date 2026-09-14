import test from 'node:test';
import assert from 'node:assert';

process.env.NODE_ENV = 'test';

import { ApiClient, getApiBaseUrl } from '../services/api/apiClient';

test('ApiClient - Native token lifecycle management', async () => {
  // Clear any existing custom token getter and token
  ApiClient.setTokenGetter(null);
  await ApiClient.setToken(null);

  const initialToken = await ApiClient.getToken();
  assert.equal(initialToken, null, 'Initial token should be null');

  // Set native token
  await ApiClient.setToken('sample_native_jwt_token_123');
  const storedToken = await ApiClient.getToken();
  assert.equal(storedToken, 'sample_native_jwt_token_123', 'Should retrieve the stored token');

  // Custom token getter overrides
  ApiClient.setTokenGetter(async () => 'custom_mocked_token');
  const customToken = await ApiClient.getToken();
  assert.equal(customToken, 'custom_mocked_token', 'Custom token getter should be used when provided');

  // Reset custom token getter
  ApiClient.setTokenGetter(null);

  // Clear token
  await ApiClient.setToken(null);
  const clearedToken = await ApiClient.getToken();
  assert.equal(clearedToken, null, 'Token should be null after clearing');
});

test('ApiClient - getApiBaseUrl returns valid configured or default URL', () => {
  const baseUrl = getApiBaseUrl();
  assert.ok(typeof baseUrl === 'string' && baseUrl.length > 0, 'Base URL should be a non-empty string');
  assert.ok(baseUrl.startsWith('http://') || baseUrl.startsWith('https://'), 'Base URL should start with http:// or https://');
});
