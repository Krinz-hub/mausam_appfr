import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { AnimatedBar } from '../weather/AnimatedBar';
import { useTheme } from '../../design';
import { HourlyForecastItem } from '../../services/weather/canonicalModel';
import { FactorTab } from './ForecastMetricSelector';

export interface CurrentOutlookCardProps {
  selectedHour: HourlyForecastItem;
  isCurrentHour: boolean;
  selectedFactor: FactorTab;
}

export const CurrentOutlookCard: React.FC<CurrentOutlookCardProps> = ({
  selectedHour,
  isCurrentHour,
  selectedFactor,
}) => {
  const theme = useTheme();

  const timePrefix = isCurrentHour ? 'Now' : selectedHour.time;
  const title = `${timePrefix} Outlook: ${selectedHour.conditionText}`;

  // Compute metric display values
  let metricLabel = 'Rain Probability';
  let metricValueFormatted = `${selectedHour.rainProb}%`;
  let barValue = selectedHour.rainProb;
  let barColor = theme.colors.weatherRain;

  if (selectedFactor === 'temp') {
    metricLabel = 'Temperature';
    metricValueFormatted = `${Math.round(selectedHour.temp)}°C`;
    barValue = Math.min(100, Math.max(0, ((selectedHour.temp - 10) / 35) * 100));
    barColor = theme.colors.weatherHeat;
  } else if (selectedFactor === 'wind') {
    metricLabel = 'Wind Speed';
    metricValueFormatted = `${Math.round(selectedHour.windSpeed)} km/h`;
    barValue = Math.min(100, (selectedHour.windSpeed / 50) * 100);
    barColor = theme.colors.weatherWind;
  } else if (selectedFactor === 'uv') {
    metricLabel = 'UV Index';
    metricValueFormatted = `${selectedHour.uvIndex} / 12`;
    barValue = Math.min(100, (selectedHour.uvIndex / 12) * 100);
    barColor = theme.colors.weatherUV;
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.backgroundCard }]}>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.weights.bold,
          },
        ]}
      >
        {title}
      </Text>

      <View style={styles.metricRow}>
        <Text
          style={[
            styles.metricLabel,
            {
              color: theme.colors.textSecondary,
              fontWeight: theme.typography.weights.medium,
            },
          ]}
        >
          {metricLabel}
        </Text>
        <Text
          style={[
            styles.metricValue,
            {
              color: theme.colors.textPrimary,
              fontWeight: theme.typography.weights.bold,
            },
          ]}
        >
          {metricValueFormatted}
        </Text>
      </View>

      <View style={styles.barContainer}>
        <AnimatedBar
          label=""
          value={barValue}
          unit=""
          color={barColor}
          height={8}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 135,
    justifyContent: 'space-between',
    marginVertical: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 14,
    letterSpacing: -0.1,
  },
  metricValue: {
    fontSize: 22,
    letterSpacing: -0.3,
  },
  barContainer: {
    marginTop: -2,
  },
});
