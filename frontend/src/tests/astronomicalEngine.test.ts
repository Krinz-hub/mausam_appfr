import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeAstronomicalContext,
  parseAstronomicalDate,
} from '../engine/astronomy/astronomicalContext';
import { AstronomicalEngine } from '../engine/astronomy/astronomicalEngine';
import { DecisionEngine } from '../engine/decision/decisionEngine';
import { WeatherProvider } from '../services/weather/openMeteoProvider';
import { PersonaProfile } from '../engine/types';
import { CanonicalWeatherData } from '../services/weather/canonicalModel';

// Helper to create mock canonical weather data
function createMockWeather(overrides?: Partial<CanonicalWeatherData['current']>): CanonicalWeatherData {
  const base = WeatherProvider.getFallbackData('Bengaluru');
  const rainProb = overrides?.rainProbability ?? 5;
  const hourly = base.hourly.map((h) => ({
    ...h,
    rainProb,
  }));
  return {
    ...base,
    hourly,
    current: {
      ...base.current,
      sunrise: '2026-09-14T06:02',
      sunset: '2026-09-14T18:25',
      temperature: 22,
      feelsLike: 22,
      rainProbability: rainProb,
      windSpeed: 8,
      uvIndex: 2,
      weatherCode: 0,
      conditionText: 'Clear skies',
      ...overrides,
    },
  };
}

// Helper to create mock persona profiles
function createMockPersona(
  activities: Record<string, number>,
  traitsOverrides?: Partial<PersonaProfile['traits']>
): PersonaProfile {
  return {
    userId: 'usr_test',
    version: 1,
    traits: {
      rain_sensitive: 0.5,
      heat_sensitive: 0.5,
      cold_sensitive: 0.5,
      wind_sensitive: 0.5,
      aqi_sensitive: 0.5,
      uv_sensitive: 0.5,
      ...traitsOverrides,
    },
    activities,
    activePeriods: { morning: 0.9, afternoon: 0.4, evening: 0.8, night: 0.1 },
    confidence: 0.9,
    lastUpdated: new Date().toISOString(),
  };
}

// -----------------------------------------------------------------------------
// 1. Normalized Astronomical Context & Parsing Tests
// -----------------------------------------------------------------------------

test('AstronomicalContext - Normalizes sunrise and sunset correctly', () => {
  const weather = createMockWeather();
  const now = new Date('2026-09-14T05:38:00'); // 24 mins before sunrise (06:02)
  const context = computeAstronomicalContext(weather, now);

  assert.equal(context.minutesUntilSunrise, 24);
  assert.equal(context.isDaylight, false);
  assert.equal(context.isNight, false); // Dawn twilight
  assert.equal(context.currentPhase, 'dawn');
  assert.equal(context.nextRelevantEvent, 'sunrise');
});

test('AstronomicalContext - Daytime remaining daylight calculation', () => {
  const weather = createMockWeather();
  const now = new Date('2026-09-14T12:00:00'); // Midday
  const context = computeAstronomicalContext(weather, now);

  assert.equal(context.isDaylight, true);
  assert.equal(context.isNight, false);
  assert.equal(context.currentPhase, 'morning'); // before solar midpoint (12:13)
  assert.equal(context.nextRelevantEvent, 'sunset');
  assert(context.daylightRemainingMinutes !== null && context.daylightRemainingMinutes > 300);
});

test('AstronomicalContext - Missing astronomical telemetry handles gracefully without crash', () => {
  const weather = createMockWeather();
  weather.current.sunrise = undefined;
  weather.current.sunset = undefined;

  const now = new Date('2026-09-14T06:00:00');
  const context = computeAstronomicalContext(weather, now);

  assert.equal(context.sunrise, null);
  assert.equal(context.sunset, null);
  assert.equal(context.minutesUntilSunrise, null);
  assert.equal(context.minutesUntilSunset, null);
  assert.equal(context.nextRelevantEvent, null);
});

// -----------------------------------------------------------------------------
// 2. Runner Scenarios
// -----------------------------------------------------------------------------

test('Runner - Sunrise approaching + comfortable weather recommends morning run window', () => {
  const weather = createMockWeather();
  const runner = createMockPersona({ fitness: 0.95 });
  const now = new Date('2026-09-14T05:35:00'); // 27 min before sunrise

  const { insight } = AstronomicalEngine.evaluate(weather, runner, now);

  assert(insight !== null);
  assert.equal(insight.type, 'sunrise_activity_window');
  assert.equal(insight.activity, 'running');
  assert(insight.priority >= 80);
  assert(insight.title.includes('run window is opening'));
  assert(insight.message.includes('27 minutes'));
  assert.equal(insight.characterState, 'sunny');
});

test('Runner - Sunrise approaching + heavy rain suppresses outdoor running recommendation', () => {
  const weather = createMockWeather({
    rainProbability: 80,
    precipitation: 8,
    weatherCode: 65,
    conditionText: 'Heavy rain',
  });
  const runner = createMockPersona({ fitness: 0.95 });
  const now = new Date('2026-09-14T05:35:00');

  const { insight } = AstronomicalEngine.evaluate(weather, runner, now);
  // Unfavorable weather suppresses outdoor running astronomical card
  assert.equal(insight, null);
});

test('Runner - Sunrise approaching + severe storm takes priority (OVERRIDE)', () => {
  const weather = createMockWeather({
    weatherCode: 95,
    windSpeed: 50,
    conditionText: 'Thunderstorm',
  });
  const runner = createMockPersona({ fitness: 0.95 });
  const now = new Date('2026-09-14T05:35:00');

  const { experience } = DecisionEngine.decide(weather, runner, 5, now);

  // Severe storm takes primary priority
  assert.equal(experience.primaryInsight.type, 'severe_storm');
  assert.equal(experience.characterState, 'thunderstorm');
  // Astronomical outdoor recommendation is suppressed
  assert.equal(experience.astronomicalInsight, null);
});

test('Runner - Sunset approaching provides fading daylight workout window', () => {
  const weather = createMockWeather();
  const runner = createMockPersona({ fitness: 0.9 });
  const now = new Date('2026-09-14T17:55:00'); // 30 min before sunset (18:25)

  const { insight } = AstronomicalEngine.evaluate(weather, runner, now);

  assert(insight !== null);
  assert.equal(insight.type, 'sunset_activity_window');
  assert.equal(insight.activity, 'running');
  assert(insight.title.includes('Daylight is fading'));
  assert(insight.message.includes('30 minutes'));
});

// -----------------------------------------------------------------------------
// 3. Cyclist Scenarios
// -----------------------------------------------------------------------------

test('Cyclist - Sunset approaching provides daylight ending soon / bike lights advice', () => {
  const weather = createMockWeather();
  const cyclist = createMockPersona({ cyclist: 0.95 });
  const now = new Date('2026-09-14T18:00:00'); // 25 min before sunset (18:25)

  const { insight } = AstronomicalEngine.evaluate(weather, cyclist, now);

  assert(insight !== null);
  assert.equal(insight.type, 'sunset_activity_window');
  assert.equal(insight.activity, 'cycling');
  assert(insight.title.includes('Daylight is ending soon'));
  assert(insight.message.includes('25 minutes'));
  assert.equal(insight.characterState, 'windy');
});

test('Cyclist - Strong wind overrides cycling sunset insight', () => {
  const weather = createMockWeather({ windSpeed: 42 });
  const cyclist = createMockPersona({ cyclist: 0.95 });
  const now = new Date('2026-09-14T18:00:00');

  const { insight } = AstronomicalEngine.evaluate(weather, cyclist, now);
  // Suppressed due to hazardous high winds
  assert.equal(insight, null);
});

// -----------------------------------------------------------------------------
// 4. Commuter Scenarios
// -----------------------------------------------------------------------------

test('Commuter - Morning commute before sunrise flags low-light transit', () => {
  const weather = createMockWeather();
  const commuter = createMockPersona({ commuter: 0.9 });
  const now = new Date('2026-09-14T05:20:00'); // 42 min before sunrise

  const { insight } = AstronomicalEngine.evaluate(weather, commuter, now);

  assert(insight !== null);
  assert.equal(insight.type, 'low_light_commute');
  assert.equal(insight.activity, 'commute');
  assert(insight.message.includes('42 minutes'));
  assert.equal(insight.characterState, 'fog');
});

test('Commuter - Commute with fog and low light increases risk and triggers fog character', () => {
  const weather = createMockWeather({
    weatherCode: 45,
    conditionText: 'Foggy',
    visibility: 1.2,
  });
  const commuter = createMockPersona({ commuter: 0.9 });
  const now = new Date('2026-09-14T05:30:00');

  const { insight } = AstronomicalEngine.evaluate(weather, commuter, now);

  assert(insight !== null);
  assert.equal(insight.type, 'low_light_commute');
  assert(insight.message.includes('Reduced visibility'));
  assert.equal(insight.severity, 'important');
  assert.equal(insight.characterState, 'fog');
});

// -----------------------------------------------------------------------------
// 5. Gardener / Agriculture Scenarios
// -----------------------------------------------------------------------------

test('Gardener - Sunrise approaching before hot afternoon provides early garden window', () => {
  const weather = createMockWeather({
    temperature: 24,
  });
  weather.daily[0].maxTemp = 36; // Hot day ahead

  const gardener = createMockPersona({ agriculture: 0.9 });
  const now = new Date('2026-09-14T05:40:00'); // 22 min before sunrise

  const { insight } = AstronomicalEngine.evaluate(weather, gardener, now);

  assert(insight !== null);
  assert.equal(insight.type, 'early_morning_outdoor_window');
  assert.equal(insight.activity, 'gardening');
  assert(insight.title.includes('Early garden window'));
  assert(insight.message.includes('cooler morning period'));
});

// -----------------------------------------------------------------------------
// 6. Health & UV Transition Scenarios
// -----------------------------------------------------------------------------

test('Health - Rising morning sun with high UV warns of increasing exposure', () => {
  const weather = createMockWeather({
    uvIndex: 7,
    isDay: true,
  });
  const healthUser = createMockPersona({}, { uv_sensitive: 0.9 });
  const now = new Date('2026-09-14T07:15:00'); // 73 min after sunrise (06:02)

  const { insight } = AstronomicalEngine.evaluate(weather, healthUser, now);

  assert(insight !== null);
  assert.equal(insight.type, 'uv_daylight_transition');
  assert.equal(insight.characterState, 'bright_sun');
  assert(insight.title.includes('UV exposure rising'));
});

// -----------------------------------------------------------------------------
// 7. Negative Tests & Suppressions
// -----------------------------------------------------------------------------

test('Negative - User has no relevant activity suppresses astronomical insight', () => {
  const weather = createMockWeather();
  const passiveUser = createMockPersona({}); // No active lifestyle activities
  const now = new Date('2026-09-14T05:35:00');

  const { insight } = AstronomicalEngine.evaluate(weather, passiveUser, now);
  assert.equal(insight, null);
});

test('Negative - Event is too far away (> 120 minutes) suppresses insight', () => {
  const weather = createMockWeather();
  const runner = createMockPersona({ fitness: 0.95 });
  const now = new Date('2026-09-14T02:30:00'); // > 3 hours before sunrise

  const { insight } = AstronomicalEngine.evaluate(weather, runner, now);
  assert.equal(insight, null);
});

test('Negative - Missing sunrise and sunset safely suppresses without error', () => {
  const weather = createMockWeather();
  weather.current.sunrise = undefined;
  weather.current.sunset = undefined;

  const runner = createMockPersona({ fitness: 0.95 });
  const now = new Date('2026-09-14T05:35:00');

  const { insight } = AstronomicalEngine.evaluate(weather, runner, now);
  assert.equal(insight, null);
});

test('Deduplication - DecisionEngine deduplicates redundant activity warnings', () => {
  const weather = createMockWeather({
    rainProbability: 75,
    precipitation: 4,
    conditionText: 'Rain showers',
  });
  const commuter = createMockPersona({ commuter: 0.9 });
  const now = new Date('2026-09-14T05:30:00');

  const { experience } = DecisionEngine.decide(weather, commuter, 5, now);

  // Commute rain is primary
  assert.equal(experience.primaryInsight.type, 'commute_rain');
  // Redundant low_light_commute astronomy is suppressed to prevent duplication
  assert.equal(experience.astronomicalInsight, null);
});

// -----------------------------------------------------------------------------
// 8. End-to-End DecisionEngine & Primary Promotion
// -----------------------------------------------------------------------------

test('DecisionEngine - High priority runner sunrise insight becomes primary recommendation', () => {
  const weather = createMockWeather();
  const runner = createMockPersona({ fitness: 1.0 }, { rain_sensitive: 0.3 });
  const now = new Date('2026-09-14T05:45:00'); // 17 min before sunrise

  const { decision, experience } = DecisionEngine.decide(weather, runner, 5, now);

  // Primary recommendation is the active running window
  assert.equal(decision.primary.type, 'sunrise_activity_window');
  assert.equal(decision.primary.characterState, 'sunny');
  assert(decision.primary.title.includes('run window is opening'));
  assert.equal(experience.primaryInsight.type, 'sunrise_activity_window');
  // suggestions pool starts with primary
  assert(experience.suggestions !== undefined);
  assert.equal(experience.suggestions[0].type, 'sunrise_activity_window');
});
