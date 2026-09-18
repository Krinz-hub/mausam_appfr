export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  smd: 12,
  md: 16,
  base: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,

  // Standardized Spacing Scale (4, 8, 12, 16, 20, 24, 32, 40)
  scale: [4, 8, 12, 16, 20, 24, 32, 40],

  // Semantic Section & Card Tokens
  sectionSpacing: 24,
  sectionSpacingLarge: 32,
  cardPadding: 16,
  cardPaddingLarge: 20,
  cardPaddingDense: 12,
  elementSpacing: 8,
  elementSpacingSmall: 4,
  elementSpacingMedium: 12,

  // Responsive screen padding standards
  screenHorizontal: 20,
  screenVertical: 16,
  inputPadding: 16,

  // Android and iOS Navigation Clearance
  bottomNavHeight: 60,
  bottomNavClearance: 88, // Safe scrolling room above bottom navigation

  // Touch Targets (Apple & Android Guidelines)
  minTouchTarget: 44,
  buttonHeight: 52,
  buttonHeightSmall: 44,
  iconSizeSm: 16,
  iconSizeMd: 20,
  iconSizeLg: 28,
  iconSizeXl: 40,
};

export type Spacing = typeof spacing;
