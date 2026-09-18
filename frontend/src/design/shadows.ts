import { ViewStyle, Platform } from 'react-native';

// Hand-Drawn Neo-Brutalism Hard Offset Shadows
// No blurry material shadows; crisp printed/sticker-like hard offsets with #171717 ink

export const hardShadow = (
  x: number = 4,
  y: number = 4,
  color: string = '#171717'
): ViewStyle => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `${x}px ${y}px 0px ${color}`,
    } as any;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: x, height: y },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: Math.max(x, y),
  };
};

export const shadows = {
  none: (Platform.OS === 'web'
    ? ({ boxShadow: 'none' } as any)
    : {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      }) as ViewStyle,

  // Subtle 2px 2px offset for small tags, badges, chips
  sm: hardShadow(2, 2, '#171717'),

  // Default 4px 4px hard offset for standard cards, inputs, buttons
  md: hardShadow(4, 4, '#171717'),

  // Pronounced 5px 5px hard offset for major containers, dialogs, heroes
  lg: hardShadow(5, 5, '#171717'),

  // Card unselected & selected tactile offsets
  card: hardShadow(4, 4, '#171717'),
  cardSelected: hardShadow(4, 4, '#171717'),

  // Button normal tactile state (collapses to pressed)
  buttonNormal: hardShadow(4, 4, '#171717'),
  buttonPressed: hardShadow(1, 1, '#171717'),

  // Accent hard shadow (e.g. coral or amber printed stamp)
  accentCoral: hardShadow(3, 3, '#FF5533'),
  accentAmber: hardShadow(3, 3, '#FFB21A'),

  // Legacy alias replaced with crisp accent shadow
  softGlow: hardShadow(3, 3, '#FF5533'),
};

export type Shadows = typeof shadows;
