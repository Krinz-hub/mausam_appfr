// Hand-Drawn Neo-Brutalism / Retro Web UI Color System
// Primary background: #FFFDF7, Dark ink: #171717
// Accents: #FF5533 (Coral), #FFB21A (Amber), #7A9E7E (Sage), #A8C7FF (Periwinkle), #F5D6E5 (Pink)

export const neoBrutalistAccents = {
  coral: '#FF5533',
  amber: '#FFB21A',
  sage: '#7A9E7E',
  blue: '#A8C7FF',
  pink: '#F5D6E5',
  ink: '#171717',
  paper: '#FFFDF7',
  white: '#FFFFFF',
  creamy: '#F7F4EB',
};

// Day Theme (Primary default)
export const dayColors = {
  // Brand
  primary: '#FF5533',
  primaryHover: '#E0482B',
  primaryPressed: '#C73B20',
  primaryLight: '#FFEBE6',
  primaryUltraLight: '#FFF5F2',
  primaryDark: '#B8321B',

  // Curated Neo-Brutalist Accents
  accentCoral: '#FF5533',
  accentAmber: '#FFB21A',
  accentSage: '#7A9E7E',
  accentBlue: '#A8C7FF',
  accentPink: '#F5D6E5',

  // Sketchbook Paper Backgrounds
  background: '#FFFDF7',
  backgroundSecondary: '#F7F4EB',
  backgroundSky: '#EBF3FF',
  backgroundCard: '#FFFFFF',
  backgroundCardMuted: '#FFFDF7',
  backgroundOverlay: 'rgba(23, 23, 23, 0.40)',
  backgroundDarkOverlay: 'rgba(23, 23, 23, 0.70)',

  // Surfaces
  surfacePrimary: '#FFFFFF',
  surfaceSecondary: '#F7F4EB',
  surfaceBlue: '#A8C7FF',

  // Borders (Thick almost-black outlines)
  border: '#171717',
  borderLight: '#171717',
  borderFunctional: '#171717',
  borderSelected: '#171717',
  borderHighlight: '#FF5533',

  // Text Hierarchy
  textPrimary: '#171717',
  textSecondary: '#4A4A4A',
  textMuted: '#717171',
  textDisabled: '#A0A0A0',
  textInverse: '#FFFDF7',
  textLink: '#FF5533',

  // Semantic Status Colors
  good: '#7A9E7E',
  goodSurface: '#EAF4EC',
  warning: '#FFB21A',
  warningSurface: '#FFF6E0',
  danger: '#FF5533',
  dangerSurface: '#FFEBE6',
  info: '#4B88E8',
  infoSurface: '#EBF3FF',

  // Contextual Weather & Health Accents
  weatherRain: '#4B88E8',
  weatherRainLight: '#EBF3FF',
  weatherHeat: '#FF5533',
  weatherHeatLight: '#FFEBE6',
  weatherCold: '#4B88E8',
  weatherColdLight: '#EBF3FF',
  weatherWind: '#7A9E7E',
  weatherWindLight: '#EAF4EC',
  weatherUV: '#FFB21A',
  weatherUVLight: '#FFF6E0',
  weatherAQI: '#717171',
  weatherAQILight: '#F7F4EB',
  weatherStorm: '#171717',
  weatherStormLight: '#FFEBE6',

  // Tactile States
  cardSelectedBg: '#FFF7DE',
  cardUnselectedBg: '#FFFFFF',
  badgeBg: '#FFF0D4',

  // Success / Error aliases for compatibility
  success: '#7A9E7E',
  successLight: '#EAF4EC',
  error: '#FF5533',
  errorLight: '#FFEBE6',
};

// Night Theme (Inverted Ink Paper Neo-Brutalist)
export const nightColors = {
  // Brand
  primary: '#FFB21A',
  primaryHover: '#E59F13',
  primaryPressed: '#CC8C0E',
  primaryLight: '#382B14',
  primaryUltraLight: '#282010',
  primaryDark: '#E59F13',

  // Curated Neo-Brutalist Accents
  accentCoral: '#FF5533',
  accentAmber: '#FFB21A',
  accentSage: '#7A9E7E',
  accentBlue: '#A8C7FF',
  accentPink: '#F5D6E5',

  // Dark Canvas Backgrounds
  background: '#171717',
  backgroundSecondary: '#1F1F1F',
  backgroundSky: '#242424',
  backgroundCard: '#242424',
  backgroundCardMuted: '#1C1C1C',
  backgroundOverlay: 'rgba(0, 0, 0, 0.70)',
  backgroundDarkOverlay: 'rgba(0, 0, 0, 0.85)',

  // Surfaces
  surfacePrimary: '#242424',
  surfaceSecondary: '#1C1C1C',
  surfaceBlue: '#1F2A38',

  // Borders
  border: '#FFFDF7',
  borderLight: '#FFFDF7',
  borderFunctional: '#FFFDF7',
  borderSelected: '#FFB21A',
  borderHighlight: '#FFB21A',

  // Text Hierarchy
  textPrimary: '#FFFDF7',
  textSecondary: '#D0D0D0',
  textMuted: '#9E9E9E',
  textDisabled: '#686868',
  textInverse: '#171717',
  textLink: '#FFB21A',

  // Semantic Status Colors
  good: '#7A9E7E',
  goodSurface: '#192C1D',
  warning: '#FFB21A',
  warningSurface: '#362910',
  danger: '#FF5533',
  dangerSurface: '#361814',
  info: '#A8C7FF',
  infoSurface: '#192538',

  // Contextual Weather & Health Accents
  weatherRain: '#A8C7FF',
  weatherRainLight: '#192538',
  weatherHeat: '#FFB21A',
  weatherHeatLight: '#362910',
  weatherCold: '#A8C7FF',
  weatherColdLight: '#192538',
  weatherWind: '#7A9E7E',
  weatherWindLight: '#192C1D',
  weatherUV: '#FFB21A',
  weatherUVLight: '#362910',
  weatherAQI: '#D0D0D0',
  weatherAQILight: '#1C1C1C',
  weatherStorm: '#FF5533',
  weatherStormLight: '#361814',

  // Tactile States
  cardSelectedBg: '#362910',
  cardUnselectedBg: '#242424',
  badgeBg: '#2E220C',

  // Success / Error aliases
  success: '#7A9E7E',
  successLight: '#192C1D',
  error: '#FF5533',
  errorLight: '#361814',
};

// Day-Cycle Gradients kept as flat accents or subtle steps for retro themes
export const dayCycleGradients = {
  dawn: { top: '#FFFDF7', bottom: '#FFFDF7', accent: '#FFB21A' },
  morning: { top: '#FFFDF7', bottom: '#FFFDF7', accent: '#FF5533' },
  afternoon: { top: '#FFFDF7', bottom: '#FFFDF7', accent: '#FF5533' },
  sunset: { top: '#FFFDF7', bottom: '#FFFDF7', accent: '#FF5533' },
  evening: { top: '#171717', bottom: '#171717', accent: '#A8C7FF' },
  night: { top: '#171717', bottom: '#171717', accent: '#FFB21A' },
};

export const colors = dayColors;
export type Colors = typeof dayColors;
