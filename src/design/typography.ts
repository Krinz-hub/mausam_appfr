import { TextStyle } from 'react-native';

export const typography = {
  fontFamily: 'Comfortaa',
  fontFamilies: {
    light: 'Comfortaa_300Light',
    regular: 'Comfortaa_400Regular',
    medium: 'Comfortaa_500Medium',
    semibold: 'Comfortaa_600SemiBold',
    bold: 'Comfortaa_700Bold',
  },
  sizes: {
    heroTemp: 76,
    display: 40,
    title1: 28,
    title2: 22,
    title3: 18,
    headline: 16,
    body: 15,
    callout: 14,
    subhead: 13,
    footnote: 12,
    caption: 11,
  },
  weights: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    heavy: '800' as TextStyle['fontWeight'],
  },
  lineHeights: {
    heroTemp: 84,
    display: 48,
    title1: 34,
    title2: 28,
    title3: 24,
    headline: 22,
    body: 21,
    callout: 20,
    subhead: 18,
    footnote: 16,
    caption: 14,
  },
};

export function getComfortaaFontFamily(weight?: string): string {
  if (weight === '700' || weight === '800' || weight === '900' || weight === 'bold' || weight === 'heavy') {
    return 'Comfortaa_700Bold';
  }
  if (weight === '600' || weight === 'semibold') {
    return 'Comfortaa_600SemiBold';
  }
  if (weight === '500' || weight === 'medium') {
    return 'Comfortaa_500Medium';
  }
  if (weight === '300' || weight === '100' || weight === '200' || weight === 'light') {
    return 'Comfortaa_300Light';
  }
  return 'Comfortaa_400Regular';
}

export type Typography = typeof typography;

