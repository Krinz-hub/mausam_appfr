import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../design';
import { WeatherIcon } from '../icons/WeatherIcon';
import { audioManager } from '../../services/audio/audioManager';
import { hapticManager } from '../../services/haptics/hapticManager';

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

  const handleLocationPress = () => {
    hapticManager.selection();
    audioManager.play('selection');
    onPressLocation?.();
  };

  return (
    <View style={[styles.container, style]}>
      {/* 1. Top Expressive Retro Header Bar (56-64px height) */}
      <View style={styles.topHeaderBar}>
        <View style={styles.brandTitleBox}>
          <Text style={styles.brandDot}>●</Text>
          <Text style={styles.brandTitle}>MAUSAM</Text>
          <Text style={styles.brandSubtitle}>// LIVE</Text>
        </View>

        <Pressable
          onPress={handleLocationPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Location: ${locationName}. Tap to change or refresh GPS`}
          style={({ pressed }) => [
            styles.locationButton,
            pressed && styles.locationButtonPressed,
          ]}
        >
          <Ionicons
            name="location-sharp"
            size={14}
            color="#171717"
            style={{ marginRight: 4 }}
          />
          <Text numberOfLines={1} style={styles.locationButtonText}>
            {isLocating ? 'Locating...' : locationName}
          </Text>
          <Ionicons
            name={isPrecise ? 'navigate-circle' : 'chevron-down'}
            size={13}
            color="#171717"
            style={{ marginLeft: 4 }}
          />
        </Pressable>
      </View>

      {/* Greeting tag */}
      <Text style={styles.greetingText}>
        {greeting}
      </Text>

      {/* 2. Main Physical Weather Panel */}
      <View style={styles.cardWrapper}>
        {/* Physical hard shadow underlay */}
        <View style={styles.cardUnderlay} />

        <View style={styles.cardBody}>
          {/* Card retro title bar */}
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>WEATHER REPORT</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeDot}>●</Text>
              <Text style={styles.liveBadgeText}>ONLINE</Text>
            </View>
          </View>

          {/* Large Hero Temperature Display */}
          <View style={styles.tempSection}>
            <Text style={styles.tempText}>
              {Math.round(temperature)}°
            </Text>

            <View style={styles.conditionBox}>
              <View style={styles.conditionRow}>
                <WeatherIcon
                  condition={conditionText}
                  isNight={nightActive}
                  sunrise={sunrise}
                  sunset={sunset}
                  size={24}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.conditionSummary}>
                  {conditionText}
                </Text>
              </View>

              <View style={styles.feelsLikeBadge}>
                <Text style={styles.feelsLikeText}>
                  Feels like {Math.round(feelsLike)}°
                </Text>
              </View>
            </View>
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Structured Metrics Row */}
          {humidity !== undefined && (
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>HUMIDITY</Text>
                <Text style={styles.metricValue}>{Math.round(humidity)}%</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>WIND</Text>
                <Text style={styles.metricValue}>{Math.round(windSpeed ?? 0)} km/h</Text>
              </View>

              {uvIndex !== undefined && (
                <>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>UV INDEX</Text>
                    <Text style={styles.metricValue}>{Math.round(uvIndex)}</Text>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    minHeight: 48,
  },
  brandTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF7',
    borderWidth: 2,
    borderColor: '#171717',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  brandDot: {
    color: '#7A9E7E',
    fontSize: 12,
    marginRight: 6,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5533',
    marginLeft: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#171717',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 190,
  },
  locationButtonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  locationButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#171717',
    maxWidth: 125,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  cardWrapper: {
    position: 'relative',
    marginVertical: 4,
    paddingRight: 5,
    paddingBottom: 5,
  },
  cardUnderlay: {
    position: 'absolute',
    left: 5,
    top: 5,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 12,
  },
  cardBody: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#171717',
    borderRadius: 12,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0D4',
    borderWidth: 1.5,
    borderColor: '#171717',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveBadgeDot: {
    color: '#FF5533',
    fontSize: 8,
    marginRight: 4,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.5,
  },
  tempSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  tempText: {
    fontSize: 68,
    lineHeight: 74,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: -2,
  },
  conditionBox: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 12,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  conditionSummary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171717',
    textTransform: 'capitalize',
  },
  feelsLikeBadge: {
    backgroundColor: '#F7F4EB',
    borderWidth: 1.5,
    borderColor: '#171717',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  feelsLikeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#171717',
  },
  separator: {
    height: 2,
    backgroundColor: '#171717',
    marginVertical: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 2,
    height: 24,
    backgroundColor: '#171717',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#717171',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#171717',
  },
});
