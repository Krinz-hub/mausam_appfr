import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DecisionEngine } from '../engine/decision/decisionEngine';
import { WeatherProvider } from '../services/weather/openMeteoProvider';
import { PersonaProfile } from '../engine/types';

test('DecisionEngine - Persona differentiation under identical weather conditions', () => {
  const weather = WeatherProvider.getFallbackData('Bengaluru');

  // Persona A: Commuter
  const commuterPersona: PersonaProfile = {
    userId: 'usr_commuter',
    version: 1,
    traits: {
      rain_sensitive: 0.95,
      heat_sensitive: 0.4,
      cold_sensitive: 0.3,
      wind_sensitive: 0.4,
      aqi_sensitive: 0.3,
      uv_sensitive: 0.3,
    },
    activities: { commuter: 0.95, fitness: 0.1 },
    activePeriods: { morning: 0.9, afternoon: 0.4, evening: 0.8, night: 0.1 },
    confidence: 0.85,
    lastUpdated: new Date().toISOString(),
  };

  // Persona B: Fitness / Cyclist
  const fitnessPersona: PersonaProfile = {
    userId: 'usr_fitness',
    version: 1,
    traits: {
      rain_sensitive: 0.6,
      heat_sensitive: 0.5,
      cold_sensitive: 0.3,
      wind_sensitive: 0.7,
      aqi_sensitive: 0.4,
      uv_sensitive: 0.4,
    },
    activities: { fitness: 0.95, commuter: 0.1 },
    activePeriods: { morning: 0.95, afternoon: 0.2, evening: 0.4, night: 0.1 },
    confidence: 0.85,
    lastUpdated: new Date().toISOString(),
  };

  const decisionCommuter = DecisionEngine.decide(weather, commuterPersona, 8);
  const decisionFitness = DecisionEngine.decide(weather, fitnessPersona, 8);

  // Both have unique decision IDs
  assert(decisionCommuter.decision.decisionId.startsWith('dec_'));
  assert(decisionFitness.decision.decisionId.startsWith('dec_'));
  assert.notEqual(decisionCommuter.decision.decisionId, decisionFitness.decision.decisionId);

  // Experience primary insight reflects persona priorities
  assert(
    decisionCommuter.experience.primaryInsight.type.includes('commute') ||
      decisionCommuter.experience.primaryInsight.reasonCodes.some((r) => r.includes('COMMUTE'))
  );

  assert(
    decisionFitness.experience.primaryInsight.type.includes('fitness') ||
      decisionFitness.experience.primaryInsight.reasonCodes.some((r) => r.includes('TEMP_WINDOW'))
  );
});

test('DecisionEngine - Severe storm overrides standard lifestyle routines', () => {
  const stormWeather = WeatherProvider.getFallbackData('Bengaluru');
  stormWeather.current.weatherCode = 95; // Thunderstorm
  stormWeather.current.windSpeed = 55;

  const normalPersona: PersonaProfile = {
    userId: 'usr_normal',
    version: 1,
    traits: {
      rain_sensitive: 0.5,
      heat_sensitive: 0.5,
      cold_sensitive: 0.5,
      wind_sensitive: 0.5,
      aqi_sensitive: 0.5,
      uv_sensitive: 0.5,
    },
    activities: { commuter: 0.7 },
    activePeriods: { morning: 0.8, afternoon: 0.5, evening: 0.5, night: 0.2 },
    confidence: 0.8,
    lastUpdated: new Date().toISOString(),
  };

  const { experience } = DecisionEngine.decide(stormWeather, normalPersona, 8);
  assert.equal(experience.primaryInsight.type, 'severe_storm');
  assert.equal(experience.characterState, 'storm');
});
