import { StyleSheet, ViewStyle } from 'react-native';
import { radius } from './radius';
import { spacing } from './spacing';

export const cardTokens = {
  borderWidth: 2,
  borderColor: '#171717',
  borderRadius: radius.card, // 10
  padding: spacing.cardPadding, // 16
  paddingLarge: spacing.cardPaddingLarge, // 20
  paddingDense: spacing.cardPaddingDense, // 12
  shadowOffset: 4,
  underlayColor: '#171717',
  bgDefault: '#FFFFFF',
  bgPrimary: '#FFF7DE',
  bgMuted: '#F7F4EB',
  bgNight: '#242424',
};

export const cardStyles = StyleSheet.create({
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
});
