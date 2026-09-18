import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '../common/AppText';
import { useTheme } from '../../design';
import { AstronomicalInsight } from '../../engine/astronomy/astronomicalTypes';

export interface AstronomicalInsightCardProps {
  insight: AstronomicalInsight;
  style?: ViewStyle;
}

export const AstronomicalInsightCard: React.FC<AstronomicalInsightCardProps> = ({
  insight,
  style,
}) => {
  const theme = useTheme();

  const getEventIcon = (): keyof typeof Ionicons.glyphMap => {
    if (insight.type.includes('sunset') || insight.type.includes('dusk') || insight.type.includes('daylight_remaining')) {
      return 'sunny';
    }
    if (insight.type === 'early_morning_outdoor_window' || insight.type === 'sunrise_activity_window') {
      return 'sunny-outline';
    }
    if (insight.type === 'uv_daylight_transition') {
      return 'shield-checkmark-outline';
    }
    if (insight.type === 'low_light_commute') {
      return 'car-outline';
    }
    return 'partly-sunny-outline';
  };

  const badgeText = insight.eventTime
    ? `${insight.type.includes('sunset') ? 'SUNSET' : 'SUNRISE'} ${insight.eventTime}`
    : insight.minutesUntilEvent !== null && insight.minutesUntilEvent > 0
    ? `IN ${insight.minutesUntilEvent} MIN`
    : 'CELESTIAL TIMING';

  return (
    <View style={[styles.wrapper, style]}>
      {/* Physical hard shadow underlay */}
      <View style={styles.underlay} />

      <View
        accessible={true}
        accessibilityRole="summary"
        accessibilityLabel={`${insight.title}. ${insight.message}`}
        style={styles.card}
      >
        {/* Retro window header */}
        <View style={styles.windowHeader}>
          <View style={styles.badge}>
            <Ionicons name={getEventIcon()} size={13} color="#171717" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>
              {badgeText}
            </Text>
          </View>

          {insight.activity && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityTag}>
                {insight.activity.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Main Headline */}
        <Text style={styles.title}>
          {insight.title}
        </Text>

        {/* Informative Explanation */}
        <Text style={styles.message}>
          {insight.message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginVertical: 6,
    paddingRight: 4,
    paddingBottom: 4,
    width: '100%',
  },
  underlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#171717',
    borderRadius: 12,
    padding: 16,
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A8C7FF',
    borderWidth: 1.5,
    borderColor: '#171717',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.5,
  },
  activityBadge: {
    backgroundColor: '#F7F4EB',
    borderWidth: 1,
    borderColor: '#171717',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activityTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#717171',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#171717',
    lineHeight: 22,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A4A4A',
    lineHeight: 18,
  },
});
