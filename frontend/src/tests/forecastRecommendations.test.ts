import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDailyPersonalizedRecommendation } from '../engine/decision/forecastRecommendations';
import { DailyForecastItem } from '../services/weather/canonicalModel';
import { PersonaProfile } from '../engine/types';

function createMockDay(overrides: Partial<DailyForecastItem> = {}): DailyForecastItem {
  return {
    date: '2026-09-10',
    dayName: 'Today',
    minTemp: 22,
    maxTemp: 28,
    rainProb: 10,
    icon: '☀️',
    conditionText: 'Clear skies',
    ...overrides,
  };
}

test('ForecastRecommendations - Storm advisory has top priority', () => {
  const day = createMockDay({
    conditionText: 'Severe Thunderstorm',
    rainProb: 90,
    maxTemp: 32,
  });
  const rec = getDailyPersonalizedRecommendation(day);
  assert.equal(rec, 'Avoid exposed outdoor areas');
});

test('ForecastRecommendations - Rain recommendation when rain probability is high', () => {
  const day = createMockDay({
    conditionText: 'Scattered Showers',
    rainProb: 65,
  });
  const rec = getDailyPersonalizedRecommendation(day);
  assert.equal(rec, 'Carry an umbrella');
});

test('ForecastRecommendations - Heat recommendation during extreme temperatures', () => {
  const day = createMockDay({
    conditionText: 'Clear skies',
    rainProb: 0,
    maxTemp: 38,
  });
  const rec = getDailyPersonalizedRecommendation(day);
  assert.equal(rec, 'Keep outdoor plans earlier');
});

test('ForecastRecommendations - Cold weather recommendation for low temperatures', () => {
  const day = createMockDay({
    conditionText: 'Partly cloudy',
    rainProb: 5,
    minTemp: 10,
    maxTemp: 16,
  });
  const rec = getDailyPersonalizedRecommendation(day);
  assert.equal(rec, 'Layer up before heading out');
});

test('ForecastRecommendations - High UV sun protection recommendation', () => {
  const day = createMockDay({
    conditionText: 'Sunny',
    rainProb: 5,
    maxTemp: 32,
  });
  const rec = getDailyPersonalizedRecommendation(day);
  assert.equal(rec, 'Use sunscreen & stay shaded');
});

test('ForecastRecommendations - Persona fitness recognition on clear days', () => {
  const day = createMockDay({
    conditionText: 'Partly cloudy',
    rainProb: 15,
    minTemp: 20,
    maxTemp: 28,
  });
  const persona: PersonaProfile = {
    userId: 'user_1',
    version: 1,
    traits: {
      rain_sensitive: 0.5,
      heat_sensitive: 0.5,
      cold_sensitive: 0.5,
      wind_sensitive: 0.5,
      aqi_sensitive: 0.5,
      uv_sensitive: 0.5,
    },
    activities: { fitness: 0.9 },
    activePeriods: { morning: 1, afternoon: 0, evening: 0, night: 0 },
    confidence: 0.9,
    lastUpdated: new Date().toISOString(),
  };
  const rec = getDailyPersonalizedRecommendation(day, persona);
  assert.equal(rec, 'Ideal workout morning');
});

test('ForecastRecommendations - Fallback to comfortable day ahead', () => {
  const day = createMockDay({
    conditionText: 'Partly cloudy',
    rainProb: 10,
    minTemp: 20,
    maxTemp: 27,
  });
  const rec = getDailyPersonalizedRecommendation(day);
  assert.equal(rec, 'Comfortable day ahead');
});
