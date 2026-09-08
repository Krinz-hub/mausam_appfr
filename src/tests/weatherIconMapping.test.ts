import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  determineIsNight,
  resolveWeatherIcon,
} from '../services/weather/weatherIconMapping';

test('WeatherIconMapping - Night hours return clear night moon icon, not sun', () => {
  const nightHours = [0, 1, 2, 3, 4, 5]; // 12 AM, 1 AM, 2 AM, 3 AM, 4 AM, 5 AM
  const sunrise = '2026-09-08T06:08';
  const sunset = '2026-09-08T18:26';

  nightHours.forEach((hour) => {
    const isNight = determineIsNight(undefined, hour, sunrise, sunset);
    assert.equal(isNight, true, `Hour ${hour} should be night`);

    const icon = resolveWeatherIcon({
      condition: 'Clear skies',
      hour,
      sunrise,
      sunset,
    });
    assert.equal(icon.name, 'moon-outline', `Hour ${hour} should render moon-outline`);
    assert.equal(icon.isNight, true);
    assert.notEqual(icon.name, 'sunny-outline', `Hour ${hour} must NEVER render sun-style icon`);
  });
});

test('WeatherIconMapping - Day hours return sunny icon for clear skies', () => {
  const dayHours = [8, 11, 13, 16]; // 8 AM, 11 AM, 1 PM, 4 PM
  const sunrise = '2026-09-08T06:08';
  const sunset = '2026-09-08T18:26';

  dayHours.forEach((hour) => {
    const isNight = determineIsNight(undefined, hour, sunrise, sunset);
    assert.equal(isNight, false, `Hour ${hour} should be day`);

    const icon = resolveWeatherIcon({
      condition: 'Clear skies',
      hour,
      sunrise,
      sunset,
    });
    assert.equal(icon.name, 'sunny-outline', `Hour ${hour} should render sunny-outline`);
    assert.equal(icon.isNight, false);
  });
});

test('WeatherIconMapping - Dynamic sunrise/sunset determines twilight transition', () => {
  // Northern summer: sunrise 05:15, sunset 20:45
  const sunrise = '2026-06-21T05:15';
  const sunset = '2026-06-21T20:45';

  // 5:00 AM (hour 5 mid-hour is 5:30 -> after 5:15 sunrise)
  const at4am = determineIsNight(undefined, 4, sunrise, sunset);
  assert.equal(at4am, true, '4 AM should be night before 5:15 sunrise');

  const at6am = determineIsNight(undefined, 6, sunrise, sunset);
  assert.equal(at6am, false, '6 AM should be day after 5:15 sunrise');

  const at8pm = determineIsNight(undefined, 20, sunrise, sunset);
  assert.equal(at8pm, false, '8 PM (20:30) is before 20:45 sunset in summer');

  const at10pm = determineIsNight(undefined, 22, sunrise, sunset);
  assert.equal(at10pm, true, '10 PM is night after 20:45 sunset');
});

test('WeatherIconMapping - Standard conditions map to appropriate real vector icons', () => {
  const rain = resolveWeatherIcon({ condition: 'Rain showers', hour: 14 });
  assert.equal(rain.name, 'rainy-outline');

  const storm = resolveWeatherIcon({ condition: 'Thunderstorm', hour: 14 });
  assert.equal(storm.name, 'thunderstorm-outline');

  const cloudy = resolveWeatherIcon({ condition: 'Overcast', hour: 14 });
  assert.equal(cloudy.name, 'cloudy-outline');

  const partlyDay = resolveWeatherIcon({ condition: 'Partly cloudy', hour: 14, isNight: false });
  assert.equal(partlyDay.name, 'partly-sunny-outline');

  const partlyNight = resolveWeatherIcon({ condition: 'Partly cloudy', hour: 2, isNight: true });
  assert.equal(partlyNight.name, 'cloudy-night-outline');

  const fog = resolveWeatherIcon({ condition: 'Dense Fog', hour: 7 });
  assert.equal(fog.name, 'cloud-outline');

  const snow = resolveWeatherIcon({ condition: 'Moderate Snow', hour: 10 });
  assert.equal(snow.name, 'snow-outline');
});
