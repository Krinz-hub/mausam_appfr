import test from 'node:test';
import assert from 'node:assert/strict';
import { getCharacterStateForMessage } from '../engines/weather/characterMessageMatcher';

test('Character Message Matcher - Tired and dizzy rapid-tap reactions', () => {
  assert.strictEqual(
    getCharacterStateForMessage('Stop, I am tired! Give me some rest 😴', 'Phew! Too many taps too fast.'),
    'fog'
  );

  assert.strictEqual(
    getCharacterStateForMessage('Whoa there, slow down! 😵‍💫', 'My cloud brain is spinning! Take a breather and tap gently.'),
    'lightning'
  );

  assert.strictEqual(
    getCharacterStateForMessage('Zzz... taking a mini recharge nap! 💤', 'Give me a couple seconds of rest'),
    'fog'
  );
});

test('Character Message Matcher - Weather insights map to matching visual states', () => {
  // Heat & hydration
  assert.strictEqual(
    getCharacterStateForMessage('Beat The Heat 💧', 'Feels like 34°! Stay well-hydrated and seek shade.'),
    'extreme_heat'
  );

  // UV & sunglasses
  assert.strictEqual(
    getCharacterStateForMessage('Protect from UV 🕶️', 'UV index reaches 8. Wear sunglasses today.'),
    'bright_sun'
  );

  // Rain & umbrella
  assert.strictEqual(
    getCharacterStateForMessage('Umbrella Advisory ☔', 'Rain chance is around 60%. Keep rain gear handy!'),
    'rain'
  );

  // Cold & scarf
  assert.strictEqual(
    getCharacterStateForMessage('Crisp Weather 🧣', 'Chilly 12° air. Dress warmly in comfortable layers.'),
    'extreme_cold'
  );

  // Wind & breeze
  assert.strictEqual(
    getCharacterStateForMessage('Breezy Outlook 💨', 'Winds active around 25 km/h.'),
    'windy'
  );

  // Air Quality
  assert.strictEqual(
    getCharacterStateForMessage('Air Quality Check 🌫️', 'AQI is 120. Sensitive groups should wear a mask.'),
    'bad_air_quality'
  );

  // Clean air & rainbow
  assert.strictEqual(
    getCharacterStateForMessage('Crisp & Clean Air 🌿', 'Great atmospheric clarity for walking and outdoor workouts.'),
    'rainbow'
  );

  // Thunderstorm
  assert.strictEqual(
    getCharacterStateForMessage('Severe Thunderstorm ⛈️', 'Dangerous lightning and heavy rain expected.'),
    'thunderstorm'
  );

  // Tomorrow weather forecasts
  assert.strictEqual(
    getCharacterStateForMessage('Rain in store tomorrow', 'Showers expected tomorrow with 65% rain chance.'),
    'rain'
  );

  assert.strictEqual(
    getCharacterStateForMessage('Warm afternoon tomorrow', 'Peak heat reaching 36°C tomorrow. Best outdoor workout window early.'),
    'extreme_heat'
  );

  // Phrases containing 'rest of the day' should NOT falsely trigger sleeping/fog
  assert.strictEqual(
    getCharacterStateForMessage('Smooth commute conditions', 'Clear roads and pleasant skies for the rest of your trip.', 'sunny'),
    'sunny'
  );
});

test('Character Message Matcher - Fallback preserves base weather state', () => {
  const fallback = 'rain' as const;
  assert.strictEqual(
    getCharacterStateForMessage('Custom unknown message without keywords', 'Random tip', fallback),
    'rain'
  );
});
