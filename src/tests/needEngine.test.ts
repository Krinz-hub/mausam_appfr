import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NeedEngine } from '../engine/need/needEngine';
import { parseUserTypeSelections, parseWeatherFactorSelections } from '../engine/need/selectionParser';

test('NeedEngine - Multi-type persona scoring', () => {
  const profile = NeedEngine.computeProfile({
    userTypeKeys: ['commute', 'exercise'],
    weatherFactorKeys: ['rain'],
    activePeriods: ['morning'],
  });

  assert.equal(profile.userTypes.length, 2);
  assert.equal(profile.userTypes[0].type, 'commuter');
  assert.equal(profile.userTypes[1].type, 'fitness');
  assert(profile.userTypes[0].score >= profile.userTypes[1].score);

  // Direct rain selection should be top priority
  const rainNeed = profile.needs.find((n) => n.factor === 'rain');
  assert(rainNeed !== undefined);
  assert.equal(rainNeed!.source, 'selection');
  assert.equal(rainNeed!.confidence, 1.0);
  assert.equal(rainNeed!.priority, 0.98);

  // Visibility should be inferred from commuter matrix
  const visibilityNeed = profile.needs.find((n) => n.factor === 'visibility');
  assert(visibilityNeed !== undefined);
  assert(visibilityNeed!.priority > 0);
});

test('NeedEngine - Direct selection takes precedence over AI inference', () => {
  const profile = NeedEngine.computeProfile({
    userTypeKeys: ['health'],
    weatherFactorKeys: ['rain'], // explicit rain selection
    aiExtractedNeeds: {
      needs: [
        { factor: 'rain', priority: 0.5 }, // AI thought rain was only 0.5
      ],
    },
  });

  const rainNeed = profile.needs.find((n) => n.factor === 'rain');
  assert.equal(rainNeed?.source, 'selection');
  assert.equal(rainNeed?.priority, 0.98); // Selection overrides AI
});

test('NeedEngine - Unknown and empty selections handling', () => {
  const parsedTypes = parseUserTypeSelections(['unknown_alien_category', 'commute']);
  assert.deepEqual(parsedTypes, ['commuter']);

  const emptyProfile = NeedEngine.computeProfile({
    userTypeKeys: [],
    weatherFactorKeys: [],
  });

  assert.equal(emptyProfile.userTypes.length, 0);
  assert.equal(emptyProfile.needs.length, 0);
  assert.equal(emptyProfile.version, 1);
});
