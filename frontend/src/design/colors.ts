// Day Theme (Primary default according to Section 6 of spec)
export const dayColors = {
  // Brand
  primary: '#159FE3',
  primaryHover: '#0C87C7',
  primaryPressed: '#0C87C7',
  primaryLight: '#E7F6FC',
  primaryUltraLight: '#F7FCFE',
  primaryDark: '#0C87C7',

  // Atmospheric Backgrounds
  background: '#F4FAFD',
  backgroundSecondary: '#EAF6FB',
  backgroundSky: '#E7F6FC',
  backgroundCard: '#FFFFFF',
  backgroundCardMuted: '#F7FCFE',
  backgroundOverlay: 'rgba(244, 250, 253, 0.90)',
  backgroundDarkOverlay: 'rgba(7, 21, 33, 0.45)',

  // Surfaces (Section 6)
  surfacePrimary: '#FFFFFF',
  surfaceSecondary: '#F7FCFE',
  surfaceBlue: '#E7F6FC',

  // Borders (Section 9: default 0, soft subtle tones when functional)
  border: 'transparent',
  borderLight: 'transparent',
  borderFunctional: '#E2EAF4',
  borderSelected: '#159FE3',
  borderHighlight: '#35B7F2',

  // Text Hierarchy (Section 6)
  textPrimary: '#12324A',
  textSecondary: '#587184',
  textMuted: '#8499A8',
  textDisabled: '#AEBFC9',
  textInverse: '#FFFFFF',
  textLink: '#159FE3',

  // Semantic Status Colors (Section 7)
  good: '#21B77A',
  goodSurface: '#E7F8F0',
  warning: '#F2A93B',
  warningSurface: '#FFF5DF',
  danger: '#E85C5C',
  dangerSurface: '#FDECEC',
  info: '#159FE3',
  infoSurface: '#E6F6FC',

  // Contextual Weather & Health Accents
  weatherRain: '#159FE3',
  weatherRainLight: '#E7F6FC',
  weatherHeat: '#F2A93B',
  weatherHeatLight: '#FFF5DF',
  weatherCold: '#159FE3',
  weatherColdLight: '#E7F6FC',
  weatherWind: '#21B77A',
  weatherWindLight: '#E7F8F0',
  weatherUV: '#F2A93B',
  weatherUVLight: '#FFF5DF',
  weatherAQI: '#8499A8',
  weatherAQILight: '#F4FAFD',
  weatherStorm: '#E85C5C',
  weatherStormLight: '#FDECEC',

  // Tactile States
  cardSelectedBg: '#E7F6FC',
  cardUnselectedBg: '#FFFFFF',
  badgeBg: '#EAF6FB',

  // Success / Error aliases for compatibility
  success: '#21B77A',
  successLight: '#E7F8F0',
  error: '#E85C5C',
  errorLight: '#FDECEC',
};

// Night Theme (Section 6 of spec: real atmospheric dark, not an inverted day theme)
export const nightColors = {
  // Brand
  primary: '#35B7F2',
  primaryHover: '#1599D5',
  primaryPressed: '#1599D5',
  primaryLight: '#123A52',
  primaryUltraLight: '#153449',
  primaryDark: '#1599D5',

  // Atmospheric Backgrounds
  background: '#071521',
  backgroundSecondary: '#0B1F2E',
  backgroundSky: '#123A52',
  backgroundCard: '#102A3B',
  backgroundCardMuted: '#153449',
  backgroundOverlay: 'rgba(7, 21, 33, 0.90)',
  backgroundDarkOverlay: 'rgba(3, 10, 16, 0.70)',

  // Surfaces (Section 6)
  surfacePrimary: '#102A3B',
  surfaceSecondary: '#153449',
  surfaceBlue: '#123A52',

  // Borders
  border: 'transparent',
  borderLight: 'transparent',
  borderFunctional: '#153449',
  borderSelected: '#35B7F2',
  borderHighlight: '#66B9E8',

  // Text Hierarchy (Section 6)
  textPrimary: '#F3FAFF',
  textSecondary: '#B9CEDA',
  textMuted: '#8199A8',
  textDisabled: '#587184',
  textInverse: '#071521',
  textLink: '#35B7F2',

  // Semantic Status Colors (Section 7)
  good: '#21B77A',
  goodSurface: '#0E3024',
  warning: '#F2A93B',
  warningSurface: '#35250E',
  danger: '#E85C5C',
  dangerSurface: '#361414',
  info: '#35B7F2',
  infoSurface: '#123A52',

  // Contextual Weather & Health Accents
  weatherRain: '#35B7F2',
  weatherRainLight: '#123A52',
  weatherHeat: '#F2A93B',
  weatherHeatLight: '#35250E',
  weatherCold: '#66B9E8',
  weatherColdLight: '#123A52',
  weatherWind: '#21B77A',
  weatherWindLight: '#0E3024',
  weatherUV: '#F2A93B',
  weatherUVLight: '#35250E',
  weatherAQI: '#B9CEDA',
  weatherAQILight: '#153449',
  weatherStorm: '#E85C5C',
  weatherStormLight: '#361414',

  // Tactile States
  cardSelectedBg: '#153449',
  cardUnselectedBg: '#102A3B',
  badgeBg: '#0B1F2E',

  // Success / Error aliases
  success: '#21B77A',
  successLight: '#0E3024',
  error: '#E85C5C',
  errorLight: '#361414',
};

// Day-Cycle Atmospheric Gradients (Section 6)
export const dayCycleGradients = {
  dawn: {
    top: '#DCEFFF',
    bottom: '#F9F7F1',
    accent: '#FFB45E',
  },
  morning: {
    top: '#BFEAFF',
    bottom: '#F4FBFF',
    accent: '#159FE3',
  },
  afternoon: {
    top: '#B7E6FA',
    bottom: '#F4FBFD',
    accent: '#159FE3',
  },
  sunset: {
    top: '#FFD9B0',
    bottom: '#F7C8D5',
    accent: '#E9876C',
  },
  evening: {
    top: '#203A5A',
    bottom: '#0E2338',
    accent: '#66B9E8',
  },
  night: {
    top: '#071521',
    bottom: '#0B1F2E',
    accent: '#35B7F2',
  },
};

// Default export
export const colors = dayColors;
export type Colors = typeof dayColors;

