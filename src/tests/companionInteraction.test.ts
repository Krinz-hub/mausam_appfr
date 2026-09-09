import { test } from 'node:test';
import assert from 'node:assert/strict';

test('Companion Interaction - Rapid tap vs normal tap detection logic', () => {
  // Test rapid tap detection algorithm
  interface TapDetectorState {
    recentTaps: number[];
    isTired: boolean;
    tiredPhraseIndex: number;
    suggestionIndex: number;
  }

  const TIRED_PHRASES = [
    {
      message: 'Stop, I am tired! Give me some rest 😴',
      tip: 'Phew! Too many taps too fast. Give me a second to catch my breath! 😮‍💨',
    },
    {
      message: 'Whoa there, slow down! 😵‍💫',
      tip: 'My cloud brain is spinning! Take a breather and tap gently.',
    },
  ];

  function processTap(state: TapDetectorState, now: number, totalSuggestions: number): TapDetectorState {
    const windowMs = 1400;
    const filteredTaps = state.recentTaps.filter((t) => now - t < windowMs);
    filteredTaps.push(now);

    const isRapid =
      filteredTaps.length >= 4 &&
      filteredTaps.length >= 2 &&
      now - filteredTaps[filteredTaps.length - 2] < 450;

    if (isRapid || state.isTired) {
      return {
        ...state,
        recentTaps: filteredTaps,
        isTired: true,
        tiredPhraseIndex: state.isTired ? (state.tiredPhraseIndex + 1) % TIRED_PHRASES.length : 0,
      };
    }

    return {
      ...state,
      recentTaps: filteredTaps,
      suggestionIndex: (state.suggestionIndex + 1) % totalSuggestions,
    };
  }

  // 1. Normal tapping scenario: intervals > 600ms
  let state: TapDetectorState = {
    recentTaps: [],
    isTired: false,
    tiredPhraseIndex: 0,
    suggestionIndex: 0,
  };

  // Tap 1 at 0ms
  state = processTap(state, 1000, 5);
  assert.equal(state.isTired, false);
  assert.equal(state.suggestionIndex, 1);

  // Tap 2 at 800ms later (1800ms)
  state = processTap(state, 1800, 5);
  assert.equal(state.isTired, false);
  assert.equal(state.suggestionIndex, 2);

  // Tap 3 at 900ms later (2700ms)
  state = processTap(state, 2700, 5);
  assert.equal(state.isTired, false);
  assert.equal(state.suggestionIndex, 3);

  // Tap 4 at 1000ms later (3700ms)
  state = processTap(state, 3700, 5);
  assert.equal(state.isTired, false);
  assert.equal(state.suggestionIndex, 4);

  // Tap 5 at 1000ms later (4700ms) - wraps around
  state = processTap(state, 4700, 5);
  assert.equal(state.isTired, false);
  assert.equal(state.suggestionIndex, 0);

  // 2. Rapid tapping scenario: 4 quick taps within 600ms
  let rapidState: TapDetectorState = {
    recentTaps: [],
    isTired: false,
    tiredPhraseIndex: 0,
    suggestionIndex: 0,
  };

  rapidState = processTap(rapidState, 10000, 5); // tap 1
  assert.equal(rapidState.isTired, false);

  rapidState = processTap(rapidState, 10200, 5); // tap 2 (200ms gap)
  assert.equal(rapidState.isTired, false);

  rapidState = processTap(rapidState, 10400, 5); // tap 3 (200ms gap)
  assert.equal(rapidState.isTired, false);

  rapidState = processTap(rapidState, 10600, 5); // tap 4 (200ms gap) -> triggers tired!
  assert.equal(rapidState.isTired, true);
  assert.equal(TIRED_PHRASES[rapidState.tiredPhraseIndex].message, 'Stop, I am tired! Give me some rest 😴');

  // Next rapid tap while tired updates tired phrase
  rapidState = processTap(rapidState, 10800, 5);
  assert.equal(rapidState.isTired, true);
  assert.equal(TIRED_PHRASES[rapidState.tiredPhraseIndex].message, 'Whoa there, slow down! 😵‍💫');

  // 3. Recovery after resting (simulate 3s resting timeout)
  rapidState.isTired = false;
  rapidState.recentTaps = [];

  // Normal tap after rest succeeds
  rapidState = processTap(rapidState, 14000, 5);
  assert.equal(rapidState.isTired, false);
});
