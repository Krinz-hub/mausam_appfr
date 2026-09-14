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

  // 1. Tired / Exhausted / Resting / Yawning / Night sleep
  if (
    combined.includes('tired') ||
    combined.includes('give me some rest') ||
    combined.includes('rest well') ||
    combined.includes('take a rest') ||
    combined.includes('need rest') ||
    combined.includes('get some rest') ||
    combined.includes('resting') ||
    combined.includes('calm night') ||
    combined.includes('goodnight') ||
    combined.includes('bedtime') ||
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

  // 3. Bad Air Quality / AQI / Smog / Pollution / Mask (Check before general heat/sun)
  if (
    combined.includes('air quality is poor') ||
    combined.includes('air quality check') ||
    combined.includes('poor air') ||
    combined.includes('unhealthy air') ||
    combined.includes('aqi') ||
    combined.includes('smog') ||
    combined.includes('pollution') ||
    combined.includes('mask') ||
    combined.includes('smoke') ||
    combined.includes('haze') ||
    combined.includes('dust') ||
    combined.includes('respiratory') ||
    combined.includes('🌫️') ||
    combined.includes('😷')
  ) {
    return 'bad_air_quality'; // Character wearing protective mask
  }

  // 4. Extreme Heat / Dehydration / High Temperature / Boiling
  if (
    combined.includes('beat the heat') ||
    combined.includes('warm afternoon') ||
    combined.includes('warm day') ||
    combined.includes('warmer') ||
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
    combined.includes('feels like') ||
    combined.includes('🔥') ||
    combined.includes('💧')
  ) {
    return 'extreme_heat'; // Overheated/panting character with water drops
  }

  // 5. UV / Sun Glare / Sunglasses / Sunscreen
  if (
    combined.includes('uv') ||
    combined.includes('sunglasses') ||
    combined.includes('sun protection') ||
    combined.includes('sunscreen') ||
    combined.includes('glare') ||
    combined.includes('bright sun') ||
    combined.includes('shade') ||
    combined.includes('stay shaded') ||
    combined.includes('protect from uv') ||
    combined.includes('high uv') ||
    combined.includes('🕶️')
  ) {
    return 'bright_sun'; // Cool character with dark sunglasses
  }

  // 6. Thunderstorm / Storm / Angry Lightning
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

  // 7. Heavy Rain / Pouring / Monsoon / Downpour
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

  // 8. Rain / Umbrella / Showers / Drizzle / Puddles / Wet Commute
  if (
    combined.includes('rain on the horizon') ||
    combined.includes('rain likely') ||
    combined.includes('rain expected') ||
    combined.includes('wet commute') ||
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

  // 9. Freezing / Extreme Cold / Shivering / Warm Layers / Scarf
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
    combined.includes('layer up') ||
    combined.includes('dress warmly') ||
    combined.includes('frost') ||
    combined.includes('🧤') ||
    combined.includes('🧣') ||
    combined.includes('🥶')
  ) {
    return 'extreme_cold'; // Character with warm winter earmuffs and scarf
  }

  // 10. Snow / Sleet / Blizzard / Ice / Snowman
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

  // 11. Strong Wind / Gale
  if (
    combined.includes('strong wind') ||
    combined.includes('gale') ||
    combined.includes('high winds') ||
    combined.includes('blustery')
  ) {
    return 'strong_wind';
  }

  // 12. Breezy / Windy / Wind / Gusts
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

  // 13. Rainbow / Fresh / Clean Air
  if (
    combined.includes('crisp & clean air') ||
    combined.includes('clean air') ||
    combined.includes('air quality is crisp') ||
    combined.includes('rainbow') ||
    combined.includes('clarity') ||
    combined.includes('delight') ||
    combined.includes('fresh') ||
    combined.includes('post-rain') ||
    combined.includes('🌿') ||
    combined.includes('🌈') ||
    combined.includes('✨')
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

  // 16. Workout / Active Fitness
  if (
    combined.includes('workout') ||
    combined.includes('running') ||
    combined.includes('fitness') ||
    combined.includes('cycling') ||
    combined.includes('riding') ||
    combined.includes('jog')
  ) {
    return 'sunny'; // Healthy bright cheerful cloud for outdoor workout
  }

  // 17. Sunny / Clear Skies / Bright / Cheerful / Companion Greeting
  if (
    combined.includes('sunny vibes') ||
    combined.includes('sunny') ||
    combined.includes('sun') ||
    combined.includes('clear skies') ||
    combined.includes('clear sky') ||
    combined.includes('smooth commute') ||
    combined.includes('clear roads') ||
    combined.includes('bright') ||
    combined.includes('good day') ||
    combined.includes('looking good') ||
    combined.includes('smile') ||
    combined.includes('keeping watch') ||
    combined.includes('happy') ||
    combined.includes('comfortable') ||
    combined.includes('☀️') ||
    combined.includes('😊') ||
    combined.includes('👋')
  ) {
    return 'sunny';
  }

  return fallbackState;
}
