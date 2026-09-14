import test from 'node:test';
import assert from 'node:assert';
import { User } from '../src/models/User.js';

test('User Model - Validates required fields and defaults', async () => {
  const user = new User({
    name: 'Test User',
    email: 'test@mausam.in',
    password: 'securePassword123',
  });

  const validationError = user.validateSync();
  assert.equal(validationError, undefined, 'User document should validate without errors');

  assert.equal(user.name, 'Test User');
  assert.equal(user.email, 'test@mausam.in');
  assert.equal(user.onboardingCompleted, false);
  assert.equal(user.preferences.temperatureUnit, 'celsius');
  assert.equal(user.preferences.notificationsEnabled, true);
  assert.equal(user.preferences.soundEnabled, true);
  assert.equal(user.preferences.reducedMotion, false);
});

test('User Model - Rejects missing name, email, or password', async () => {
  const invalidUser = new User({
    displayName: 'No Name User',
  });

  const err = invalidUser.validateSync();
  assert.ok(err, 'Validation should fail');
  assert.ok(err.errors['name'], 'name should be required');
  assert.ok(err.errors['email'], 'email should be required');
  assert.ok(err.errors['password'], 'password should be required');
});

test('User Model - Rejects short passwords (< 6 chars)', async () => {
  const invalidUser = new User({
    name: 'Short Pass User',
    email: 'short@mausam.in',
    password: '123',
  });

  const err = invalidUser.validateSync();
  assert.ok(err, 'Validation should fail for short password');
  assert.ok(err.errors['password'], 'password minlength error should trigger');
});

test('User Model - toJSON excludes password', async () => {
  const user = new User({
    name: 'Secret User',
    email: 'secret@mausam.in',
    password: 'secretPassword123',
  });

  const json = user.toJSON();
  assert.equal(json.password, undefined, 'Password must never be returned in JSON output');
  assert.equal(json.name, 'Secret User');
  assert.equal(json.email, 'secret@mausam.in');
});
