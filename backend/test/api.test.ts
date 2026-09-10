import test from 'node:test';
import assert from 'node:assert';
import { Engine1Service } from '../src/services/engine1Service.js';
import { verifyToken } from '../src/config/firebase.js';

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

test('Firebase Config - verifyToken works in dev mode with mock tokens', async () => {
  const token = 'mock_user_abc_123';
  const verified = await verifyToken(token);

  assert.ok(verified.uid, 'uid should be present');
  assert.equal(verified.uid, 'firebase_user_abc_123');
  assert.ok(verified.email?.includes('user_abc_123'));
});
