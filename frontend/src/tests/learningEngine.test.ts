import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LearningEngine } from '../engine/learning/learningEngine';
import { WeatherDecision, PersonaProfile, FeedbackRecord } from '../engine/types';

test('LearningEngine - Diagnostic distinguishes forecast error from irrelevance', () => {
  const dummyDecision: WeatherDecision = {
    decisionId: 'dec_92831',
    timestamp: new Date().toISOString(),
    primary: {
      type: 'carry_umbrella',
      title: 'Carry an umbrella',
      shortMessage: 'Rain likely around 7 PM.',
      priority: 0.91,
      reasonCodes: ['RAIN_INCOMING'],
      icon: '☂️',
    },
    secondary: [],
    confidence: 0.85,
    expiresAt: new Date().toISOString(),
    weatherSnapshot: { temp: 28, feelsLike: 30, rainProb: 75, windSpeed: 10 },
  };

  const fbForecastWrong: FeedbackRecord = {
    id: 'fb_1',
    userId: 'usr_1',
    decisionId: 'dec_92831',
    type: 'negative',
    reason: 'forecast_changed',
    timestamp: new Date().toISOString(),
    weatherSnapshot: {},
  };

  const fbIrrelevant: FeedbackRecord = {
    id: 'fb_2',
    userId: 'usr_1',
    decisionId: 'dec_92831',
    type: 'negative',
    reason: 'not_relevant',
    timestamp: new Date().toISOString(),
    weatherSnapshot: {},
  };

  assert.equal(LearningEngine.diagnose(dummyDecision, fbForecastWrong), 'forecast_inaccurate');
  assert.equal(LearningEngine.diagnose(dummyDecision, fbIrrelevant), 'recommendation_irrelevant');
});

test('LearningEngine - Bounded calibration updates persona traits', () => {
  const initialPersona: PersonaProfile = {
    userId: 'usr_1',
    version: 1,
    traits: {
      rain_sensitive: 0.6,
      heat_sensitive: 0.5,
      cold_sensitive: 0.5,
      wind_sensitive: 0.5,
      aqi_sensitive: 0.5,
      uv_sensitive: 0.5,
    },
    activities: { commuter: 0.6 },
    activePeriods: { morning: 0.8, afternoon: 0.5, evening: 0.5, night: 0.2 },
    confidence: 0.8,
    lastUpdated: new Date().toISOString(),
  };

  const decision: WeatherDecision = {
    decisionId: 'dec_100',
    timestamp: new Date().toISOString(),
    primary: {
      type: 'commute_rain',
      title: 'Wet commute ahead',
      shortMessage: 'Rain likely.',
      priority: 0.88,
      reasonCodes: [],
      icon: '🚗',
    },
    secondary: [],
    confidence: 0.85,
    expiresAt: new Date().toISOString(),
    weatherSnapshot: { temp: 28, feelsLike: 30, rainProb: 75, windSpeed: 10 },
  };

  const positiveFb: FeedbackRecord = {
    id: 'fb_pos',
    userId: 'usr_1',
    decisionId: 'dec_100',
    type: 'positive',
    timestamp: new Date().toISOString(),
    weatherSnapshot: {},
  };

  const calibrated = LearningEngine.processFeedback(initialPersona, decision, positiveFb);

  // Commuter and rain sensitivity should be reinforced slightly with bounded update
  assert(calibrated.traits.rain_sensitive > initialPersona.traits.rain_sensitive);
  assert(calibrated.activities.commuter > initialPersona.activities.commuter);
  // Must NOT exceed bounded limit in one tap
  assert(calibrated.traits.rain_sensitive < 0.7);
});
