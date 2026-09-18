import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../design';

export interface InsightCardProps {
  decisionId?: string;
  type: string;
  title: string;
  shortMessage: string;
  reasonCodes?: string[];
  priority?: number;
  icon?: string;
  feedbackGiven?: 'positive' | 'negative';
  onFeedback?: (decisionId: string, feedback: 'positive' | 'negative') => void;
  style?: ViewStyle;
  isPrimary?: boolean;
}

const getInsightIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'now':
      return 'flash-outline';
    case 'next':
      return 'time-outline';
    case 'tomorrow':
      return 'calendar-outline';
    case 'rain':
      return 'rainy-outline';
    case 'heat':
      return 'flame-outline';
    case 'wind':
      return 'speedometer-outline';
    case 'uv':
      return 'sunny-outline';
    default:
      return 'bulb-outline';
  }
};

export const InsightCard: React.FC<InsightCardProps> = ({
  type,
  title,
  shortMessage,
  style,
  isPrimary = false,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.wrapper, style]}>
      {/* Physical hard shadow underlay */}
      <View style={[styles.underlay, theme.isNight && { backgroundColor: '#000000' }]} />

      <View
        accessible={true}
        accessibilityRole="summary"
        accessibilityLabel={`${title}. ${shortMessage}`}
        style={[
          styles.card,
          {
            backgroundColor: theme.isNight
              ? (isPrimary ? '#2E2416' : '#242424')
              : (isPrimary ? '#FFF0D4' : '#FFFFFF'),
            borderColor: theme.isNight
              ? (isPrimary ? '#FFB21A' : '#3A3A3A')
              : '#171717',
          },
        ]}
      >
        {/* Title Row with chunky icon container */}
        <View style={styles.titleRow}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: theme.isNight
                  ? (isPrimary ? '#FFB21A' : '#1C1C1C')
                  : (isPrimary ? '#FFB21A' : '#F7F4EB'),
                borderColor: theme.isNight
                  ? (isPrimary ? '#FFB21A' : '#3A3A3A')
                  : '#171717',
              },
            ]}
          >
            <Ionicons
              name={getInsightIcon(type)}
              size={18}
              color={theme.isNight && !isPrimary ? '#FFFDF7' : '#171717'}
            />
          </View>
          <Text style={[styles.title, theme.isNight && { color: '#FFFDF7' }]}>
            {title}
          </Text>
          {isPrimary && (
            <View style={[styles.primaryBadge, theme.isNight && { borderColor: '#3A3A3A' }]}>
              <Text style={styles.primaryBadgeText}>KEY</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <Text style={[styles.shortMessage, theme.isNight && { color: '#E8E8E8' }]}>
          {shortMessage}
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
    borderRadius: 10,
  },
  card: {
    borderWidth: 2,
    borderColor: '#171717',
    borderRadius: 10,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#171717',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#171717',
  },
  primaryBadge: {
    backgroundColor: '#FF5533',
    borderWidth: 1.5,
    borderColor: '#171717',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  primaryBadgeText: {
    color: '#FFFDF7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  shortMessage: {
    fontSize: 14,
    color: '#2E2E2E',
    lineHeight: 20,
    fontWeight: '500',
  },
});
