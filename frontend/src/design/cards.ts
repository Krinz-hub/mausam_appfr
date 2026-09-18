import { radius } from './radius';
import { spacing } from './spacing';

export const cardTokens = {
  borderWidth: 2,
  borderColor: '#171717',
  borderNight: '#3A3A3A',
  borderRadius: radius.card, // 10
  padding: spacing.cardPadding, // 16
  paddingLarge: spacing.cardPaddingLarge, // 20
  paddingDense: spacing.cardPaddingDense, // 12
  shadowOffset: 4,
  underlayColor: '#171717',
  underlayNight: '#000000',
  bgDefault: '#FFFFFF',
  bgNight: '#242424',
  bgPrimary: '#FFF7DE',
  bgPrimaryNight: '#2E2416',
  bgMuted: '#F7F4EB',
  bgMutedNight: '#1C1C1C',
} as const;

export const getCardColors = (isNight: boolean) => ({
  bg: isNight ? cardTokens.bgNight : cardTokens.bgDefault,
  bgPrimary: isNight ? cardTokens.bgPrimaryNight : cardTokens.bgPrimary,
  bgMuted: isNight ? cardTokens.bgMutedNight : cardTokens.bgMuted,
  border: isNight ? cardTokens.borderNight : cardTokens.borderColor,
  underlay: isNight ? cardTokens.underlayNight : cardTokens.underlayColor,
  text: isNight ? '#FFFDF7' : '#171717',
  textSecondary: isNight ? '#E8E8E8' : '#2E2E2E',
  textMuted: isNight ? '#BFBFBF' : '#525252',
});

export const cardStyles = {
  // Wrapper that provides offset margin for the physical shadow underlay
  wrapper: {
    position: 'relative',
    paddingRight: cardTokens.shadowOffset,
    paddingBottom: cardTokens.shadowOffset,
    width: '100%',
  },

  // The dark ink underlay providing the sharp shadow
  underlay: {
    position: 'absolute',
    left: cardTokens.shadowOffset,
    top: cardTokens.shadowOffset,
    right: 0,
    bottom: 0,
    backgroundColor: cardTokens.underlayColor,
    borderRadius: cardTokens.borderRadius,
  },

  // Standard card body
  card: {
    backgroundColor: cardTokens.bgDefault,
    borderWidth: cardTokens.borderWidth,
    borderColor: cardTokens.borderColor,
    borderRadius: cardTokens.borderRadius,
    padding: cardTokens.padding,
  },

  // Subtle pressed tactile transition
  cardPressed: {
    transform: [{ translateX: 1.5 }, { translateY: 1.5 }],
  },

  // Card header row with icon and title
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.elementSpacing,
  },

  // Badge pill row
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.elementSpacingSmall,
  },
};
