import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../design';
import { WeatherIcon } from '../icons/WeatherIcon';

export interface WeatherHeroProps {
  greeting: string;
  locationName: string;
  temperature: number;
  feelsLike: number;
  conditionText: string;
  conditionEmoji?: string;
  humidity?: number;
  windSpeed?: number;
  uvIndex?: number;
  style?: ViewStyle;
  isPrecise?: boolean;
  isLocating?: boolean;
  isNight?: boolean;
  sunrise?: string;
  sunset?: string;
  onPressLocation?: () => void;
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({
  greeting,
  locationName,
  temperature,
  feelsLike,
  conditionText,
  humidity,
  windSpeed,
  uvIndex,
  style,
  isPrecise = false,
  isLocating = false,
  isNight,
  sunrise,
  sunset,
  onPressLocation,
}) => {
  const theme = useTheme();
  const nightActive = isNight !== undefined ? isNight : theme.isNight;

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
            <Ionicons
              name="location-sharp"
              size={16}
              color={theme.colors.primary}
              style={{ marginRight: 3 }}
            />
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
            <Ionicons
              name={isPrecise ? 'navigate-circle' : 'chevron-down'}
              size={14}
              color={isPrecise ? theme.colors.primary : theme.colors.textMuted}
              style={{ marginLeft: 4 }}
            />
          </Pressable>
        </View>
      </View>

      {/* Large Hero Temperature Display */}
      <View style={styles.tempRow}>
        <Text
          style={[
            styles.tempText,
            {
              color: theme.colors.textPrimary,
              fontSize: 64,
              lineHeight: 70,
              fontWeight: theme.typography.weights.heavy,
            },
          ]}
        >
          {Math.round(temperature)}°
        </Text>
        <View style={styles.feelsLikeContainer}>
          <View style={styles.conditionRow}>
            <WeatherIcon
              condition={conditionText}
              isNight={nightActive}
              sunrise={sunrise}
              sunset={sunset}
              size={18}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.conditionSummary,
                {
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.body,
                  fontWeight: theme.typography.weights.semibold,
                },
              ]}
            >
              {conditionText}
            </Text>
          </View>
          <Text
            style={[
              styles.feelsLikeText,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizes.callout,
                fontWeight: theme.typography.weights.medium,
              },
            ]}
          >
            Feels like {Math.round(feelsLike)}°
          </Text>
        </View>
      </View>

      {/* Quiet Metric Row (Section 37: Humidity 62% • Wind 12 km/h • UV 3) */}
      {humidity !== undefined && (
        <View style={styles.metricsRow}>
          <Text style={[styles.metricItem, { color: theme.colors.textSecondary }]}>
            Humidity {Math.round(humidity)}%
          </Text>
          <Text style={[styles.metricDot, { color: theme.colors.textMuted }]}>•</Text>
          <Text style={[styles.metricItem, { color: theme.colors.textSecondary }]}>
            Wind {Math.round(windSpeed ?? 0)} km/h
          </Text>
          {uvIndex !== undefined && (
            <>
              <Text style={[styles.metricDot, { color: theme.colors.textMuted }]}>•</Text>
              <Text style={[styles.metricItem, { color: theme.colors.textSecondary }]}>
                UV {Math.round(uvIndex)}
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
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
  locationText: {
    letterSpacing: -0.2,
  },
  locationIndicator: {
    fontSize: 13,
    marginLeft: 2,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  tempText: {
    letterSpacing: -2,
  },
  feelsLikeContainer: {
    marginLeft: 16,
  },
  conditionSummary: {
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  feelsLikeText: {
    letterSpacing: -0.2,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  metricItem: {
    fontSize: 13,
    fontWeight: '500',
  },
  metricDot: {
    marginHorizontal: 8,
    fontSize: 12,
  },
});

