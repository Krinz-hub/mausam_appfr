import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ExplanationParser } from '../engine/ai/explanationParser';
import { validateAIParsedOutput } from '../engine/ai/schema';

test('ExplanationParser - Real-world natural language sample from spec', () => {
  const result = ExplanationParser.parse(
    'I cycle to college every morning and rain and heat are the biggest problem for me.'
  );

  // Checks commuter & fitness detected
  const userTypes = result.userTypes.map((u) => u.type);
  assert(userTypes.includes('commuter'));
  assert(userTypes.includes('fitness'));

  // Checks rain and heat factors detected
  const factors = result.needs.map((n) => n.factor);
  assert(factors.includes('rain'));
  assert(factors.includes('feels_like'));

  // Checks morning detected
  assert.deepEqual(result.activePeriods, ['morning']);
});

test('ExplanationParser - Schema validation filters invalid features', () => {
  const malformed = {
    userTypes: [
      { type: 'commuter', score: 0.9 },
      { type: 'fake_extraterrestrial_user', score: 0.8 },
    ],
    needs: [
      { factor: 'rain', priority: 0.95 },
      { factor: 'quantum_fluctuation', priority: 0.99 },
    ],
    activePeriods: ['morning', 'invalid_time_dimension'],
  };

  const validated = validateAIParsedOutput(malformed);
  assert.equal(validated.userTypes.length, 1);
  assert.equal(validated.userTypes[0].type, 'commuter');

  assert.equal(validated.needs.length, 1);
  assert.equal(validated.needs[0].factor, 'rain');

  assert.deepEqual(validated.activePeriods, ['morning']);
});

test('ExplanationParser - Handles blank and gibberish input safely', () => {
  const empty = ExplanationParser.parse('');
  assert.deepEqual(empty.userTypes, []);
  assert.deepEqual(empty.needs, []);

  const gibberish = ExplanationParser.parse('asdf qwerty 12345');
  assert.deepEqual(gibberish.userTypes, []);
});
