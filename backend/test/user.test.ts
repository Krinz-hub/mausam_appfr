import test from 'node:test';
import assert from 'node:assert';
import { User } from '../src/models/User.js';

test('User Model - Validates required fields and defaults', async () => {
  const user = new User({
    firebaseUid: 'test_firebase_uid_123',
    email: 'test@mausam.in',
    displayName: 'Test User',
  });

  const validationError = user.validateSync();
  assert.equal(validationError, undefined, 'User document should validate without errors');

  assert.equal(user.firebaseUid, 'test_firebase_uid_123');
  assert.equal(user.email, 'test@mausam.in');
  assert.equal(user.onboardingCompleted, false);
  assert.equal(user.preferences.temperatureUnit, 'celsius');
  assert.equal(user.preferences.notificationsEnabled, true);
  assert.equal(user.preferences.soundEnabled, true);
  assert.equal(user.preferences.reducedMotion, false);
});

test('User Model - Rejects missing firebaseUid or email', async () => {
  const invalidUser = new User({
    displayName: 'No UID User',
  });

  const err = invalidUser.validateSync();
  assert.ok(err, 'Validation should fail');
  assert.ok(err.errors['firebaseUid'], 'firebaseUid should be required');
  assert.ok(err.errors['email'], 'email should be required');
});
