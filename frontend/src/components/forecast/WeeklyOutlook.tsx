import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { WeatherIcon } from '../icons/WeatherIcon';
import { useTheme } from '../../design';
import { DailyForecastItem } from '../../services/weather/canonicalModel';
import { PersonaProfile } from '../../engine/types';
import { getDailyPersonalizedRecommendation } from '../../engine/decision/forecastRecommendations';

export { getDailyPersonalizedRecommendation };

export interface WeeklyOutlookProps {
  daily: DailyForecastItem[];
  persona?: PersonaProfile | null;
  aqi?: number;
  onPressDay?: (day: DailyForecastItem, index: number) => void;
}

export const WeeklyOutlook: React.FC<WeeklyOutlookProps> = ({
  daily,
  persona,
  aqi,
  onPressDay,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.heading,
          {
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.weights.bold,
          },
        ]}
      >
        7-Day Personalized Outlook
      </Text>

      <View style={styles.listContainer}>
        {daily.map((day, idx) => {
          const recommendation = getDailyPersonalizedRecommendation(day, persona, aqi);

          return (
            <View
              key={idx}
              style={[
                styles.dayCard,
                {
                  backgroundColor: theme.colors.backgroundCard,
                },
              ]}
            >
              <View style={styles.dayCol}>
                <Text
                  style={[
                    styles.dayName,
                    {
                      color: theme.colors.textPrimary,
                      fontWeight: theme.typography.weights.bold,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {day.dayName}
                </Text>
                <View style={styles.iconWrap}>
                  <WeatherIcon condition={day.conditionText} size={18} />
                </View>
              </View>

              <View style={styles.recommendationCol}>
                <Text
                  style={[
                    styles.recommendationText,
                    {
                      color: theme.colors.primary,
                      fontWeight: theme.typography.weights.medium,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  • {recommendation}
                </Text>
              </View>

              <View style={styles.tempCol}>
                <Text
                  style={[
                    styles.tempMin,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  {Math.round(day.minTemp)}°
                </Text>
                <Text
                  style={[
                    styles.tempSlash,
                    { color: theme.colors.textDisabled },
                  ]}
                >
                  /
                </Text>
                <Text
                  style={[
                    styles.tempMax,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {Math.round(day.maxTemp)}°
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 14,
    marginBottom: 12,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  listContainer: {
    gap: 8,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  dayCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 82,
  },
  dayName: {
    fontSize: 14,
    width: 56,
  },
  iconWrap: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationCol: {
    flex: 1,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  recommendationText: {
    fontSize: 12,
    lineHeight: 16,
  },
  tempCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 62,
  },
  tempMin: {
    fontSize: 13,
    fontWeight: '500',
  },
  tempSlash: {
    marginHorizontal: 3,
    fontSize: 13,
  },
  tempMax: {
    fontSize: 14,
    fontWeight: '700',
  },
});
