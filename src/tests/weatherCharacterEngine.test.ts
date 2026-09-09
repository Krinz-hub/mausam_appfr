import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WeatherCharacterEngine } from '../engines/weather/WeatherCharacterEngine';
import { WeatherContext } from '../engines/weather/weatherCharacterTypes';
import { normalizeToWeatherContext } from '../services/weather/normalizer';
import { CanonicalWeatherData } from '../services/weather/canonicalModel';

// Base pleasant weather context helper
function createBaseContext(overrides: Partial<WeatherContext> = {}): WeatherContext {
  return {
    condition: 'Sunny',
    temperature: 24,
    feelsLike: 24,
    precipitationProbability: 0,
    precipitationAmount: 0,
    windSpeed: 10,
    humidity: 50,
    currentTime: new Date('2026-09-09T10:00:00Z'),
    sunrise: new Date('2026-09-09T06:00:00Z'),
    sunset: new Date('2026-09-09T18:00:00Z'),
    ...overrides,
  };
}

// -------------------------------------------------------------
// 1. BASE WEATHER CONDITIONS (Section 28)
// -------------------------------------------------------------

test('WeatherCharacterEngine - 01 Sunny', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ condition: 'Clear skies', temperature: 25 })
  );
  assert.equal(resolved.state, 'sunny');
  assert.equal(resolved.assetKey, '01_sunny_happy.png');
  assert.equal(resolved.mood, 'happy');
  assert.equal(resolved.haptic, 'light');
});

test('WeatherCharacterEngine - 02 Bright Sun / High UV', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ condition: 'Sunny', uvIndex: 9 })
  );
  assert.equal(resolved.state, 'bright_sun');
  assert.equal(resolved.assetKey, '02_sunny_sunglasses.png');
  assert.equal(resolved.mood, 'cool');
  assert.equal(resolved.haptic, 'light');
});

test('WeatherCharacterEngine - 03 Cloudy', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ condition: 'Partly cloudy' })
  );
  assert.equal(resolved.state, 'cloudy');
  assert.equal(resolved.assetKey, '03_cloudy_happy.png');
  assert.equal(resolved.mood, 'happy');
});

test('WeatherCharacterEngine - 04 Overcast', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ condition: 'Overcast' })
  );
  assert.equal(resolved.state, 'overcast');
  assert.equal(resolved.assetKey, '04_overcast_cloudy.png');
  assert.equal(resolved.mood, 'neutral');
});

test('WeatherCharacterEngine - 05 Light / Moderate Rain', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Rain',
      precipitationAmount: 2.5,
      precipitationProbability: 60,
    })
  );
  assert.equal(resolved.state, 'rain');
  assert.equal(resolved.assetKey, '05_rainy_umbrella.png');
  assert.equal(resolved.haptic, 'light');
  assert.match(resolved.message, /umbrella/i);
});

test('WeatherCharacterEngine - 06 Heavy Rain', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Heavy rain showers',
      precipitationAmount: 14.0,
      precipitationProbability: 95,
    })
  );
  assert.equal(resolved.state, 'heavy_rain');
  assert.equal(resolved.assetKey, '06_heavy_rain_sad.png');
  assert.equal(resolved.mood, 'sad');
  assert.equal(resolved.haptic, 'medium');
});

test('WeatherCharacterEngine - 07 Thunderstorm', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ condition: 'Thunderstorm', precipitationAmount: 8 })
  );
  assert.equal(resolved.state, 'thunderstorm');
  assert.equal(resolved.assetKey, '07_thunderstorm_angry.png');
  assert.equal(resolved.mood, 'angry');
  assert.equal(resolved.haptic, 'heavy');
  assert.match(resolved.message, /storm alert/i);
});

test('WeatherCharacterEngine - 08 Snow', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ condition: 'Moderate snow', temperature: -2 })
  );
  assert.equal(resolved.state, 'snow');
  assert.equal(resolved.assetKey, '08_snowy_freezing.png');
  assert.equal(resolved.mood, 'freezing');
  assert.equal(resolved.haptic, 'light');
});

test('WeatherCharacterEngine - 09 Windy', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ windSpeed: 28 })
  );
  assert.equal(resolved.state, 'windy');
  assert.equal(resolved.assetKey, '09_windy.png');
  assert.equal(resolved.mood, 'breezy');
  assert.equal(resolved.haptic, 'light');
});

test('WeatherCharacterEngine - 10 Fog', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ condition: 'Dense Fog', visibility: 400 })
  );
  assert.equal(resolved.state, 'fog');
  assert.equal(resolved.assetKey, '10_foggy_sleepy.png');
  assert.equal(resolved.mood, 'sleepy');
  assert.equal(resolved.haptic, 'light');
});

test('WeatherCharacterEngine - 11 Hail', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ condition: 'Hail showers' })
  );
  assert.equal(resolved.state, 'hail');
  assert.equal(resolved.assetKey, '11_hail_surprised.png');
  assert.equal(resolved.mood, 'surprised');
  assert.equal(resolved.haptic, 'medium');
});

test('WeatherCharacterEngine - 12 Rainbow / Post-Rain', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Mainly clear',
      recentRain: true,
      precipitationAmount: 0,
      currentTime: new Date('2026-09-09T14:00:00Z'),
      sunrise: new Date('2026-09-09T06:00:00Z'),
      sunset: new Date('2026-09-09T18:00:00Z'),
    })
  );
  assert.equal(resolved.state, 'rainbow');
  assert.equal(resolved.assetKey, '12_rainbow_happy.png');
  assert.equal(resolved.mood, 'happy');
});

test('WeatherCharacterEngine - 13 Extreme Heat', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ temperature: 43, feelsLike: 45 })
  );
  assert.equal(resolved.state, 'extreme_heat');
  assert.equal(resolved.assetKey, '13_extreme_heat.png');
  assert.equal(resolved.mood, 'overheated');
  assert.equal(resolved.haptic, 'medium');
  assert.match(resolved.message, /seriously hot/i);
});

test('WeatherCharacterEngine - 14 Extreme Cold', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ temperature: 6, feelsLike: 4 })
  );
  assert.equal(resolved.state, 'extreme_cold');
  assert.equal(resolved.assetKey, '14_cold_freezing.png');
  assert.equal(resolved.mood, 'freezing');
  assert.equal(resolved.haptic, 'medium');
});

test('WeatherCharacterEngine - 15 Stormy Rain', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Stormy rain',
      windSpeed: 30,
      precipitationAmount: 5,
    })
  );
  assert.equal(resolved.state, 'stormy_rain');
  assert.equal(resolved.assetKey, '15_stormy_rain.png');
  assert.equal(resolved.mood, 'concerned');
  assert.equal(resolved.haptic, 'medium');
});

test('WeatherCharacterEngine - 16 Strong Wind', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ windSpeed: 45 })
  );
  assert.equal(resolved.state, 'strong_wind');
  assert.equal(resolved.assetKey, '16_strong_wind.png');
  assert.equal(resolved.haptic, 'medium');
});

test('WeatherCharacterEngine - 17 Bad Air Quality', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ aqi: 175, condition: 'Sunny' })
  );
  assert.equal(resolved.state, 'bad_air_quality');
  assert.equal(resolved.assetKey, '17_bad_air_quality.png');
  assert.equal(resolved.mood, 'concerned');
  assert.equal(resolved.haptic, 'medium');
  assert.match(resolved.message, /air/i);
});

test('WeatherCharacterEngine - 18 Lightning', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ condition: 'Thunderstorm with lightning' })
  );
  assert.equal(resolved.state, 'lightning');
  assert.equal(resolved.assetKey, '18_lightning_surprised.png');
  assert.equal(resolved.mood, 'surprised');
  assert.equal(resolved.haptic, 'heavy');
  assert.match(resolved.message, /lightning detected/i);
});

// -------------------------------------------------------------
// 2. COMBINATION TESTS & PRIORITY HIERARCHY (Section 28)
// -------------------------------------------------------------

test('Priority: Sunny + Bad AQI -> Bad AQI overrides Sunny', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({ condition: 'Clear skies', aqi: 165 })
  );
  assert.equal(resolved.state, 'bad_air_quality');
  assert.equal(resolved.assetKey, '17_bad_air_quality.png');
});

test('Priority: Extreme Heat + High UV -> Extreme Heat overrides Sunglasses', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Clear skies',
      temperature: 42,
      feelsLike: 44,
      uvIndex: 11,
    })
  );
  assert.equal(resolved.state, 'extreme_heat');
  assert.equal(resolved.assetKey, '13_extreme_heat.png');
});

test('Priority: Rain + Strong Wind -> Strong Wind overrides normal Rain', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Rain',
      precipitationAmount: 2,
      windSpeed: 44,
    })
  );
  assert.equal(resolved.state, 'strong_wind');
  assert.equal(resolved.assetKey, '16_strong_wind.png');
});

test('Priority: Rain + Heavy Rain -> Heavy Rain overrides normal Rain', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Rain',
      precipitationAmount: 18,
      precipitationProbability: 90,
    })
  );
  assert.equal(resolved.state, 'heavy_rain');
  assert.equal(resolved.assetKey, '06_heavy_rain_sad.png');
});

test('Priority: Rain + Thunderstorm -> Thunderstorm overrides normal Rain', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Thunderstorm with light rain',
      precipitationAmount: 2,
    })
  );
  assert.equal(resolved.state, 'thunderstorm');
  assert.equal(resolved.assetKey, '07_thunderstorm_angry.png');
});

test('Priority: Rain + Lightning -> Lightning (100) overrides normal Rain', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Rain with lightning',
      precipitationAmount: 3,
    })
  );
  assert.equal(resolved.state, 'lightning');
  assert.equal(resolved.assetKey, '18_lightning_surprised.png');
});

test('Priority: Snow + Strong Wind -> Snow (78) overrides Strong Wind (75)', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Snow',
      windSpeed: 45,
    })
  );
  assert.equal(resolved.state, 'snow');
  assert.equal(resolved.assetKey, '08_snowy_freezing.png');
});

test('Priority: Hail overrides ordinary Rain', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Rain and hail',
      precipitationAmount: 5,
    })
  );
  assert.equal(resolved.state, 'hail');
  assert.equal(resolved.assetKey, '11_hail_surprised.png');
});

// -------------------------------------------------------------
// 3. TIME OF DAY & CONTEXTUAL REACTION COPY (Section 8)
// -------------------------------------------------------------

test('Time of Day: Fog + Night maintains Fog asset but changes reaction copy', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Fog',
      currentTime: new Date('2026-09-09T23:30:00Z'),
      sunrise: new Date('2026-09-09T06:00:00Z'),
      sunset: new Date('2026-09-09T18:30:00Z'),
    })
  );
  assert.equal(resolved.state, 'fog');
  assert.equal(resolved.assetKey, '10_foggy_sleepy.png');
  assert.equal(resolved.timeOfDay, 'night');
  assert.match(resolved.message, /night fog/i);
});

test('Time of Day: Thunderstorm + Night maintains Storm asset with night message', () => {
  const resolved = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Thunderstorm',
      currentTime: new Date('2026-09-09T22:00:00Z'),
      sunrise: new Date('2026-09-09T06:00:00Z'),
      sunset: new Date('2026-09-09T18:00:00Z'),
    })
  );
  assert.equal(resolved.state, 'thunderstorm');
  assert.equal(resolved.assetKey, '07_thunderstorm_angry.png');
  assert.equal(resolved.timeOfDay, 'night');
  assert.match(resolved.message, /tonight/i);
});

test('Time of Day: Sunrise / Sunset accurately determines twilight dawn and evening', () => {
  const sr = new Date('2026-09-09T06:00:00Z');
  const ss = new Date('2026-09-09T18:00:00Z');

  // 06:15 is within dawn (sr - 45m to sr + 45m)
  const dawn = WeatherCharacterEngine.getTimeOfDay(
    new Date('2026-09-09T06:15:00Z'),
    sr,
    ss
  );
  assert.equal(dawn, 'dawn');

  // 10:00 is morning
  const morning = WeatherCharacterEngine.getTimeOfDay(
    new Date('2026-09-09T10:00:00Z'),
    sr,
    ss
  );
  assert.equal(morning, 'morning');

  // 14:00 is afternoon
  const afternoon = WeatherCharacterEngine.getTimeOfDay(
    new Date('2026-09-09T14:00:00Z'),
    sr,
    ss
  );
  assert.equal(afternoon, 'afternoon');

  // 17:30 is evening (within 60 min before sunset)
  const evening = WeatherCharacterEngine.getTimeOfDay(
    new Date('2026-09-09T17:30:00Z'),
    sr,
    ss
  );
  assert.equal(evening, 'evening');

  // 23:00 is night
  const night = WeatherCharacterEngine.getTimeOfDay(
    new Date('2026-09-09T23:00:00Z'),
    sr,
    ss
  );
  assert.equal(night, 'night');
});

// -------------------------------------------------------------
// 4. DETERMINISM & STABILITY (Section 20 & 21)
// -------------------------------------------------------------

test('Determinism: Minor temperature fluctuations do not change character state', () => {
  const ctxA = createBaseContext({ temperature: 31.1, feelsLike: 31.1 });
  const ctxB = createBaseContext({ temperature: 31.2, feelsLike: 31.2 });

  const resA = WeatherCharacterEngine.resolve(ctxA);
  const resB = WeatherCharacterEngine.resolve(ctxB);

  assert.equal(resA.state, resB.state);
  assert.equal(resA.assetKey, resB.assetKey);
});

test('Rainbow Guard: Rainbow requires recentRain AND no currentRain AND daylight', () => {
  // At night: rainbow should NOT trigger even if recentRain = true
  const nightRainbow = WeatherCharacterEngine.resolve(
    createBaseContext({
      recentRain: true,
      precipitationAmount: 0,
      currentTime: new Date('2026-09-09T23:00:00Z'),
      sunrise: new Date('2026-09-09T06:00:00Z'),
      sunset: new Date('2026-09-09T18:00:00Z'),
    })
  );
  assert.notEqual(nightRainbow.state, 'rainbow');

  // While currently raining: rainbow should NOT trigger
  const rainingRainbow = WeatherCharacterEngine.resolve(
    createBaseContext({
      condition: 'Rain',
      recentRain: true,
      precipitationAmount: 2.0,
      currentTime: new Date('2026-09-09T13:00:00Z'),
    })
  );
  assert.notEqual(rainingRainbow.state, 'rainbow');
});

// -------------------------------------------------------------
// 5. NORMALIZER PIPELINE (Section 12)
// -------------------------------------------------------------

test('Normalizer: Converts CanonicalWeatherData to valid WeatherContext', () => {
  const mockCanonical: CanonicalWeatherData = {
    locationName: 'Bengaluru',
    latitude: 12.97,
    longitude: 77.59,
    current: {
      timestamp: '2026-09-09T10:00:00Z',
      temperature: 28.5,
      feelsLike: 30.1,
      humidity: 55,
      rainProbability: 20,
      windSpeed: 12,
      uvIndex: 8,
      aqi: 72,
      weatherCode: 1,
      conditionText: 'Mainly clear',
      conditionEmoji: '🌤️',
    },
    hourly: [],
    daily: [],
    lastUpdated: '2026-09-09T10:00:00Z',
  };

  const context = normalizeToWeatherContext(mockCanonical);
  assert.equal(context.temperature, 28.5);
  assert.equal(context.feelsLike, 30.1);
  assert.equal(context.uvIndex, 8);
  assert.equal(context.aqi, 72);

  const resolved = WeatherCharacterEngine.resolve(context);
  // With uvIndex 8, bright_sun should be selected
  assert.equal(resolved.state, 'bright_sun');
  assert.equal(resolved.assetKey, '02_sunny_sunglasses.png');
});

// -------------------------------------------------------------
// 6. ENGINE API ACCESSORS (Section 5)
// -------------------------------------------------------------

test('API Accessors: getCharacter, getReaction, getTip, getHaptic work directly', () => {
  const context = createBaseContext({ condition: 'Thunderstorm' });

  const charAsset = WeatherCharacterEngine.getCharacter(context);
  const reaction = WeatherCharacterEngine.getReaction(context);
  const tip = WeatherCharacterEngine.getTip(context);
  const haptic = WeatherCharacterEngine.getHaptic(context);

  assert.ok(charAsset);
  assert.match(reaction, /storm/i);
  assert.match(tip, /indoors/i);
  assert.equal(haptic, 'heavy');
});
