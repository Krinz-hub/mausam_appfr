import test from 'node:test';
import assert from 'node:assert';
import { Engine1Service } from '../src/services/engine1Service.js';
import { generateToken, verifyJwt } from '../src/utils/jwt.js';

test('Engine1Service - Computes NeedProfile and PersonaProfile correctly from onboarding input', () => {
  const input = {
    userTypeKeys: ['commute', 'fitness'],
    weatherFactorKeys: ['rain', 'heat', 'air_quality'],
    activePeriods: ['morning' as const, 'evening' as const],
    explanation: 'I cycle to work in the morning.',
  };

  const result = Engine1Service.processOnboarding(input, 'user_test_123');

  assert.ok(result.needProfile, 'needProfile should be defined');
  assert.ok(result.personaProfile, 'personaProfile should be defined');
  assert.equal(result.needProfile.userTypes.length, 2);
  assert.equal(result.needProfile.activePeriods.length, 2);
  assert.equal(result.personaProfile.userId, 'user_test_123');

  // Rain and heat sensitivities should be high
  assert.ok(result.personaProfile.traits.rain_sensitive >= 0.85);
  assert.ok(result.personaProfile.traits.heat_sensitive >= 0.8);
  assert.ok(result.personaProfile.traits.aqi_sensitive >= 0.8);

  // Check activities map
  assert.equal(result.personaProfile.activities['commute'], true);
  assert.equal(result.personaProfile.activities['fitness'], true);
});

test('JWT Utilities - Signs and verifies tokens accurately', () => {
  const userId = 'usr_mongodb_abc123';
  const token = generateToken(userId);

  assert.ok(token, 'Token string should be generated');
  assert(token.length > 20, 'Token should be a standard JWT');

  const payload = verifyJwt(token);
  assert.equal(payload.userId, userId, 'Payload userId should match original userId');
});

test('JWT Utilities - Rejects malformed or tampered tokens', () => {
  const malformedToken = 'invalid.jwt.token.string';
  assert.throws(
    () => {
      verifyJwt(malformedToken);
    },
    /jwt malformed|invalid token/i,
    'Malformed token must throw an error'
  );
});
