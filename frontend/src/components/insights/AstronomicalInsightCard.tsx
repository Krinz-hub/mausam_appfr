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

  // Pick appropriate icon based on event type
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
    ? `${insight.type.includes('sunset') ? 'Sunset' : 'Sunrise'} ${insight.eventTime}`
    : insight.minutesUntilEvent !== null && insight.minutesUntilEvent > 0
    ? `In ${insight.minutesUntilEvent} min`
    : 'Atmospheric Timing';

  const isNight = theme.isNight;
  const cardBg = isNight ? '#102A3B' : theme.colors.surfaceSecondary;
  const accentColor = isNight ? '#35B7F2' : theme.colors.primary;
  const badgeBg = isNight ? 'rgba(53, 183, 242, 0.15)' : 'rgba(53, 183, 242, 0.12)';

  return (
    <View
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`${insight.title}. ${insight.message}`}
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderRadius: theme.radius.cardLarge,
        },
        style,
      ]}
    >
      {/* Top Header Row: Badge & Event Time */}
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Ionicons name={getEventIcon()} size={14} color={accentColor} style={{ marginRight: 5 }} />
          <Text
            style={[
              styles.badgeText,
              {
                color: accentColor,
                fontSize: theme.typography.sizes.caption,
                fontWeight: theme.typography.weights.semibold,
              },
            ]}
          >
            {badgeText}
          </Text>
        </View>

        {insight.activity && (
          <Text
            style={[
              styles.activityTag,
              {
                color: isNight ? '#B9CEDA' : theme.colors.textMuted,
                fontSize: theme.typography.sizes.caption,
                fontWeight: theme.typography.weights.medium,
                textTransform: 'capitalize',
              },
            ]}
          >
            {insight.activity}
          </Text>
        )}
      </View>

      {/* Main Headline */}
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.typography.sizes.headline,
            fontWeight: theme.typography.weights.bold,
          },
        ]}
      >
        {insight.title}
      </Text>

      {/* Actionable Narrative Message */}
      <Text
        style={[
          styles.message,
          {
            color: isNight ? '#D1E6F3' : theme.colors.textSecondary,
            fontSize: theme.typography.sizes.callout,
            lineHeight: theme.typography.lineHeights.callout,
          },
        ]}
      >
        {insight.message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginVertical: 10,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    letterSpacing: 0.1,
  },
  activityTag: {
    letterSpacing: 0.2,
  },
  title: {
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  message: {
    letterSpacing: -0.1,
  },
});
