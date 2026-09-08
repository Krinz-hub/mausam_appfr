import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '../../design';

export interface WeatherHeroProps {
  greeting: string;
  locationName: string;
  temperature: number;
  feelsLike: number;
  conditionText: string;
  conditionEmoji: string;
  style?: ViewStyle;
  isPrecise?: boolean;
  isLocating?: boolean;
  onPressLocation?: () => void;
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({
  greeting,
  locationName,
  temperature,
  feelsLike,
  conditionText,
  conditionEmoji,
  style,
  isPrecise = false,
  isLocating = false,
  onPressLocation,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {/* Top Bar: Greeting & Location Pill */}
      <View style={styles.topRow}>
        <View>
          <Text
            style={[
              styles.greeting,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizes.body,
                fontWeight: theme.typography.weights.medium,
              },
            ]}
          >
            {greeting}
          </Text>
          <Pressable
            onPress={onPressLocation}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Location: ${locationName}. Tap to change or refresh GPS`}
            style={styles.locationContainer}
          >
            <Text style={styles.locationPin}>📍</Text>
            <Text
              numberOfLines={1}
              style={[
                styles.locationText,
                {
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.headline,
                  fontWeight: theme.typography.weights.bold,
                  maxWidth: 210,
                },
              ]}
            >
              {isLocating ? 'Locating...' : locationName}
            </Text>
            <Text style={[styles.locationIndicator, { color: theme.colors.textMuted }]}>
              {isPrecise ? ' 🎯' : ' ▾'}
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.conditionBadge,
            {
              backgroundColor: theme.colors.backgroundSky,
              borderRadius: theme.radius.pill,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={styles.conditionEmoji}>{conditionEmoji}</Text>
          <Text
            style={[
              styles.conditionText,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizes.caption,
                fontWeight: theme.typography.weights.semibold,
              },
            ]}
          >
            {conditionText}
          </Text>
        </View>
      </View>

      {/* Large Temperature Display */}
      <View style={styles.tempRow}>
        <Text
          style={[
            styles.tempText,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.heroTemp,
              lineHeight: theme.typography.lineHeights.heroTemp,
              fontWeight: theme.typography.weights.heavy,
            },
          ]}
        >
          {Math.round(temperature)}°
        </Text>
        <View style={styles.feelsLikeContainer}>
          <Text
            style={[
              styles.feelsLikeText,
              {
                color: theme.colors.textMuted,
                fontSize: theme.typography.sizes.callout,
                fontWeight: theme.typography.weights.medium,
              },
            ]}
          >
            Feels like {Math.round(feelsLike)}°
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPin: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    letterSpacing: -0.2,
  },
  locationIndicator: {
    fontSize: 13,
    marginLeft: 2,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  conditionEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  conditionText: {
    textTransform: 'capitalize',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  tempText: {
    letterSpacing: -2,
  },
  feelsLikeContainer: {
    marginLeft: 12,
  },
  feelsLikeText: {
    letterSpacing: -0.2,
  },
});
