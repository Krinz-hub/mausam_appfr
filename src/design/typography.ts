import { TextStyle } from 'react-native';

export const typography = {
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

export type Typography = typeof typography;
