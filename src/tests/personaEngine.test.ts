import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PersonaEngine } from '../engine/persona/personaEngine';
import { calculateTimeDecayWeight } from '../engine/persona/decay';
import { applyBoundedUpdate, MAX_SINGLE_EVENT_DELTA } from '../engine/persona/boundedUpdate';
import { UserNeedProfile } from '../engine/types';

test('PersonaEngine - Cold start initialization from NeedProfile', () => {
  const dummyNeedProfile: UserNeedProfile = {
    userTypes: [{ type: 'fitness', score: 0.9 }],
    needs: [
      { factor: 'rain', priority: 0.95, confidence: 1.0, source: 'selection' },
      { factor: 'feels_like', priority: 0.88, confidence: 0.9, source: 'selection' },
    ],
    activePeriods: ['morning'],
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  const persona = PersonaEngine.initializeFromNeedProfile(dummyNeedProfile, 'usr_test_1');
  assert.equal(persona.userId, 'usr_test_1');
  assert(persona.traits.rain_sensitive > 0.8);
  assert(persona.traits.heat_sensitive > 0.7);
  assert.equal(persona.activePeriods.morning, 0.85);
  assert.equal(persona.activities.fitness, 0.9);
});

test('PersonaEngine - Bounded updates prevent drastic shifts from single accidental tap', () => {
  const initialScore = 0.5;
  const updatedOnce = applyBoundedUpdate(initialScore, 1);
  const delta = Math.abs(updatedOnce - initialScore);

  assert(delta <= MAX_SINGLE_EVENT_DELTA);
  assert(updatedOnce < 0.6); // Did not jump wildly
});

test('PersonaEngine - Time decay weights older events lower than recent', () => {
  const now = Date.now();
  const todayWeight = calculateTimeDecayWeight(now, now);
  const sevenDaysWeight = calculateTimeDecayWeight(now - 7 * 24 * 60 * 60 * 1000, now);
  const thirtyDaysWeight = calculateTimeDecayWeight(now - 30 * 24 * 60 * 60 * 1000, now);
  const ninetyDaysWeight = calculateTimeDecayWeight(now - 90 * 24 * 60 * 60 * 1000, now);

  assert.equal(todayWeight, 1.0);
  assert(sevenDaysWeight <= 0.86 && sevenDaysWeight >= 0.84);
  assert(thirtyDaysWeight <= 0.51 && thirtyDaysWeight >= 0.49);
  assert.equal(ninetyDaysWeight, 0.2);
});
