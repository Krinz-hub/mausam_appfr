// Neo-Brutalist intentional corner radii
// Strictly avoiding extreme modern SaaS pills (999) on cards/buttons; keeping structured 8px-12px corners

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  pill: 10,
  circle: 999, // Reserved strictly for tiny circular status dots

  // Semantic mappings
  button: 10,
  card: 10,
  cardLarge: 12,
  hero: 12,
  bubble: 10,
  badge: 6,
  input: 8,
  chip: 8,
};

export type Radius = typeof radius;
