import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeOpenMeteoResponse, getWmoCondition } from '../services/weather/normalizer';

test('WeatherNormalizer - WMO code translation to friendly text & emoji', () => {
  const clear = getWmoCondition(0);
  assert.equal(clear.text, 'Clear skies');
  assert.equal(clear.emoji, '☀️');

  const rain = getWmoCondition(61);
  assert.equal(rain.text, 'Rain');
  assert.equal(rain.emoji, '🌧️');

  const storm = getWmoCondition(95);
  assert.equal(storm.text, 'Thunderstorm');
  assert.equal(storm.emoji, '⛈️');
});

test('WeatherNormalizer - Normalizes Open-Meteo response into CanonicalWeatherData', () => {
  const mockOpenMeteo = {
    latitude: 12.97,
    longitude: 77.59,
    current: {
      time: '2026-09-08T14:00:00Z',
      temperature_2m: 29.4,
      apparent_temperature: 32.1,
      relative_humidity_2m: 58,
      wind_speed_10m: 14.2,
      weather_code: 1,
    },
    hourly: {
      time: ['2026-09-08T14:00:00Z', '2026-09-08T15:00:00Z'],
      temperature_2m: [29.4, 28.1],
      precipitation_probability: [10, 65],
      weather_code: [1, 61],
    },
    daily: {
      time: ['2026-09-08', '2026-09-09'],
      temperature_2m_max: [33.2, 31.0],
      temperature_2m_min: [23.5, 22.8],
      precipitation_probability_max: [40, 80],
      weather_code: [1, 61],
    },
  };

  const canonical = normalizeOpenMeteoResponse(mockOpenMeteo, 'Bengaluru');

  assert.equal(canonical.locationName, 'Bengaluru');
  assert.equal(canonical.current.temperature, 29.4);
  assert.equal(canonical.current.feelsLike, 32.1);
  assert.equal(canonical.hourly.length, 2);
  assert.equal(canonical.hourly[1].rainProb, 65);
  assert.equal(canonical.daily.length, 2);
  assert.equal(canonical.daily[0].dayName, 'Today');
  assert.equal(canonical.daily[1].dayName, 'Tomorrow');
});

test('WeatherNormalizer - Does not fabricate missing optional values', () => {
  const minimal = {
    current: {
      temperature_2m: 25,
    },
  };

  const canonical = normalizeOpenMeteoResponse(minimal, 'Delhi');
  assert.equal(canonical.current.uvIndex, undefined); // Not fabricated!
  assert.equal(canonical.current.visibility, undefined); // Not fabricated!
});
