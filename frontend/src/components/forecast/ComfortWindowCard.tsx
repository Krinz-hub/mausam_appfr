import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '../common/AppText';
import { useTheme } from '../../design';
import { ActivityWindowResult } from '../../engine/decision/activityCalculators';

export interface ComfortWindowCardProps {
  windowData: ActivityWindowResult | null;
  isFitnessPersona?: boolean;
}

export const ComfortWindowCard: React.FC<ComfortWindowCardProps> = ({
  windowData,
  isFitnessPersona = false,
}) => {
  const theme = useTheme();

  if (!windowData) return null;

  const categoryLabel = isFitnessPersona ? 'FITNESS ADVISORY' : 'COMFORT ADVISORY';
  const hasGoodWindow = windowData.score >= 0.5;
  const timeWindow = windowData.start && windowData.end
    ? `${windowData.start} – ${windowData.end}`
    : 'No optimal window';

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.underlay,
          { backgroundColor: theme.isNight ? '#000000' : '#171717' },
        ]}
      />

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.isNight ? '#242424' : '#FFFFFF',
            borderColor: theme.isNight ? '#3A3A3A' : '#171717',
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryDot}>●</Text>
            <Text
              style={[
                styles.categoryLabel,
                { color: theme.isNight ? '#FFFDF7' : '#171717' },
              ]}
            >
              {categoryLabel}
            </Text>
          </View>

          <View
            style={[
              styles.severityPill,
              {
                backgroundColor: theme.isNight
                  ? hasGoodWindow
                    ? '#192C1D'
                    : '#362910'
                  : hasGoodWindow
                  ? '#EAF4EC'
                  : '#FFF6E0',
                borderColor: theme.isNight
                  ? hasGoodWindow
                    ? '#7A9E7E'
                    : '#FFB21A'
                  : '#171717',
              },
            ]}
          >
            <Text
              style={[
                styles.severityText,
                {
                  color: theme.isNight
                    ? hasGoodWindow
                      ? '#7A9E7E'
                      : '#FFB21A'
                    : hasGoodWindow
                    ? '#2E6635'
                    : '#8A5D00',
                },
              ]}
            >
              {hasGoodWindow ? 'OPTIMAL' : 'MODERATE'}
            </Text>
          </View>
        </View>

        <View style={styles.contentRow}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isFitnessPersona
                  ? '#FFB21A'
                  : theme.isNight
                  ? '#1F2A38'
                  : '#A8C7FF',
                borderColor: theme.isNight ? '#3A3A3A' : '#171717',
              },
            ]}
          >
            <Ionicons
              name={isFitnessPersona ? 'fitness' : 'partly-sunny'}
              size={18}
              color={isFitnessPersona || !theme.isNight ? '#171717' : '#A8C7FF'}
            />
          </View>

          <View style={styles.textColumn}>
            <Text
              style={[
                styles.windowTime,
                { color: theme.isNight ? '#FFFDF7' : '#171717' },
              ]}
            >
              {timeWindow}
            </Text>
            <Text
              style={[
                styles.summaryText,
                { color: theme.isNight ? '#E8E8E8' : '#2E2E2E' },
              ]}
              numberOfLines={2}
            >
              {windowData.summary}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginVertical: 8,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#171717',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    fontSize: 9,
    color: '#FF5533',
    marginRight: 5,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.8,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#171717',
  },
  severityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  windowTime: {
    fontSize: 15,
    fontWeight: '800',
    color: '#171717',
    marginBottom: 2,
  },
  summaryText: {
    fontSize: 12,
    color: '#2E2E2E',
    lineHeight: 16,
    fontWeight: '500',
  },
});
