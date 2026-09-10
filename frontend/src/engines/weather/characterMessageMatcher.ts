import { CharacterState } from './weatherCharacterTypes';

/**
 * Determines the most expressive CharacterState based on a spoken message,
 * supporting tip, and optional fallback state.
 */
export function getCharacterStateForMessage(
  message: string,
  tip?: string,
  fallbackState: CharacterState = 'sunny'
): CharacterState {
  const combined = `${message} ${tip || ''}`.toLowerCase();

  // 1. Tired / Exhausted / Resting / Yawning (Rapid tap tired responses, rest reminders)
  if (
    combined.includes('tired') ||
    combined.includes('give me some rest') ||
    combined.includes('resting') ||
    combined.includes('catch my breath') ||
    combined.includes('recharge') ||
    combined.includes('sleep') ||
    combined.includes('nap') ||
    combined.includes('yawn') ||
    combined.includes('phew') ||
    combined.includes('sleeping') ||
    combined.includes('😴') ||
    combined.includes('😮‍💨') ||
    combined.includes('💤') ||
    combined.includes('🧘')
  ) {
    return 'fog'; // Sleepy character wearing cute nightcap
  }

  // 2. Dizzy / Spinning / Whoa / Shock / Rapid-Tap overwhelm
  if (
    combined.includes('slow down') ||
    combined.includes('whoa') ||
    combined.includes('spinning') ||
    combined.includes('dizzy') ||
    combined.includes('too fast') ||
    combined.includes('cloud brain') ||
    combined.includes('shock') ||
    combined.includes('😵‍💫') ||
    combined.includes('⚡')
  ) {
    return 'lightning'; // Surprised / dizzy lightning character
  }

  // 3. Extreme Heat / Dehydration / High Temperature / Boiling
  if (
    combined.includes('beat the heat') ||
    combined.includes('heat') ||
    combined.includes('hydrate') ||
    combined.includes('hydration') ||
    combined.includes('sweat') ||
    combined.includes('thirst') ||
    combined.includes('boiling') ||
    combined.includes('scorching') ||
    combined.includes('sweltering') ||
    combined.includes('hot') ||
    combined.includes('overheat') ||
    combined.includes('🔥') ||
    combined.includes('💧')
  ) {
    return 'extreme_heat'; // Overheated/panting character with water drops
  }

  // 4. UV / Sun Glare / Sunglasses / Sunscreen
  if (
    combined.includes('uv') ||
    combined.includes('sunglasses') ||
    combined.includes('sun protection') ||
    combined.includes('sunscreen') ||
    combined.includes('glare') ||
    combined.includes('bright sun') ||
    combined.includes('shade') ||
    combined.includes('protect from uv') ||
    combined.includes('high uv') ||
    combined.includes('🕶️')
  ) {
    return 'bright_sun'; // Cool character with dark sunglasses
  }

  // 5. Thunderstorm / Storm / Angry Lightning
  if (
    combined.includes('thunderstorm') ||
    combined.includes('thunder') ||
    combined.includes('severe storm') ||
    combined.includes('stormy') ||
    combined.includes('tempest') ||
    combined.includes('lightning storm') ||
    combined.includes('angry') ||
    combined.includes('🌩️') ||
    combined.includes('⛈️')
  ) {
    return 'thunderstorm';
  }

  // 6. Heavy Rain / Pouring / Monsoon / Downpour
  if (
    combined.includes('heavy rain') ||
    combined.includes('downpour') ||
    combined.includes('pouring') ||
    combined.includes('torrential') ||
    combined.includes('monsoon') ||
    combined.includes('soaked')
  ) {
    return 'heavy_rain';
  }

  // 7. Rain / Umbrella / Showers / Drizzle / Puddles
  if (
    combined.includes('rain on the horizon') ||
    combined.includes('rain likely') ||
    combined.includes('rain') ||
    combined.includes('shower') ||
    combined.includes('umbrella') ||
    combined.includes('drizzle') ||
    combined.includes('puddle') ||
    combined.includes('wet') ||
    combined.includes('🌧️') ||
    combined.includes('☔')
  ) {
    return 'rain'; // Character holding umbrella
  }

  // 8. Freezing / Extreme Cold / Shivering / Warm Layers / Scarf
  if (
    combined.includes('crisp weather') ||
    combined.includes('cold') ||
    combined.includes('freezing') ||
    combined.includes('chilly') ||
    combined.includes('shiver') ||
    combined.includes('scarf') ||
    combined.includes('jacket') ||
    combined.includes('sweater') ||
    combined.includes('layers') ||
    combined.includes('dress warmly') ||
    combined.includes('frost') ||
    combined.includes('🧤') ||
    combined.includes('🧣') ||
    combined.includes('🥶')
  ) {
    return 'extreme_cold'; // Character with warm winter earmuffs and scarf
  }

  // 9. Snow / Sleet / Blizzard / Ice / Snowman
  if (
    combined.includes('snow') ||
    combined.includes('blizzard') ||
    combined.includes('flurry') ||
    combined.includes('ice') ||
    combined.includes('sleet') ||
    combined.includes('snowman') ||
    combined.includes('❄️') ||
    combined.includes('⛄')
  ) {
    return 'snow';
  }

  // 10. Strong Wind / Gale
  if (
    combined.includes('strong wind') ||
    combined.includes('gale') ||
    combined.includes('high winds') ||
    combined.includes('blustery')
  ) {
    return 'strong_wind';
  }

  // 11. Breezy / Windy / Wind / Gusts
  if (
    combined.includes('breezy') ||
    combined.includes('windy') ||
    combined.includes('wind') ||
    combined.includes('gust') ||
    combined.includes('breeze') ||
    combined.includes('blow') ||
    combined.includes('💨')
  ) {
    return 'windy';
  }

  // 12. Bad Air Quality / AQI / Smog / Pollution / Mask
  if (
    combined.includes('air quality') ||
    combined.includes('aqi') ||
    combined.includes('smog') ||
    combined.includes('pollution') ||
    combined.includes('mask') ||
    combined.includes('smoke') ||
    combined.includes('haze') ||
    combined.includes('dust') ||
    combined.includes('poor air') ||
    combined.includes('unhealthy air') ||
    combined.includes('🌫️') ||
    combined.includes('😷')
  ) {
    return 'bad_air_quality'; // Character wearing protective mask
  }

  // 13. Rainbow / Fresh / Clean Air / Outdoor Workout / Fitness
  if (
    combined.includes('crisp & clean air') ||
    combined.includes('clean air') ||
    combined.includes('rainbow') ||
    combined.includes('workout') ||
    combined.includes('running') ||
    combined.includes('fitness') ||
    combined.includes('jog') ||
    combined.includes('clarity') ||
    combined.includes('delight') ||
    combined.includes('celebrate') ||
    combined.includes('joy') ||
    combined.includes('fresh') ||
    combined.includes('post-rain') ||
    combined.includes('🌿') ||
    combined.includes('🌈') ||
    combined.includes('✨') ||
    combined.includes('🏃')
  ) {
    return 'rainbow';
  }

  // 14. Overcast / Gloomy / Dull / Low Clouds
  if (
    combined.includes('overcast') ||
    combined.includes('gloomy') ||
    combined.includes('gray') ||
    combined.includes('grey') ||
    combined.includes('dull') ||
    combined.includes('cloud cover')
  ) {
    return 'overcast';
  }

  // 15. Cloudy / Partly Cloudy / Thinking
  if (
    combined.includes('cloud') ||
    combined.includes('partly cloudy') ||
    combined.includes('thinking') ||
    combined.includes('mild') ||
    combined.includes('🌤️') ||
    combined.includes('🌥️')
  ) {
    return 'cloudy';
  }

  // 16. Sunny / Clear Skies / Bright / Cheerful / Companion Greeting
  if (
    combined.includes('sunny vibes') ||
    combined.includes('sunny') ||
    combined.includes('sun') ||
    combined.includes('clear skies') ||
    combined.includes('clear sky') ||
    combined.includes('bright') ||
    combined.includes('good day') ||
    combined.includes('looking good') ||
    combined.includes('smile') ||
    combined.includes('keeping watch') ||
    combined.includes('happy') ||
    combined.includes('☀️') ||
    combined.includes('😊') ||
    combined.includes('👋')
  ) {
    return 'sunny';
  }

  return fallbackState;
}
