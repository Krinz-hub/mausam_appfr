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

  const timePrefix = isCurrentHour ? 'NOW' : selectedHour.time;
  const title = `${timePrefix} // ${selectedHour.conditionText.toUpperCase()}`;

  // Compute metric display values
  let metricLabel = 'Rain Probability';
  let metricValueFormatted = `${selectedHour.rainProb}%`;
  let barValue = selectedHour.rainProb;
  let barColor = '#4B88E8';

  if (selectedFactor === 'temp') {
    metricLabel = 'Temperature';
    metricValueFormatted = `${Math.round(selectedHour.temp)}°C`;
    barValue = Math.min(100, Math.max(0, ((selectedHour.temp - 10) / 35) * 100));
    barColor = '#FF5533';
  } else if (selectedFactor === 'wind') {
    metricLabel = 'Wind Speed';
    metricValueFormatted = `${Math.round(selectedHour.windSpeed)} km/h`;
    barValue = Math.min(100, (selectedHour.windSpeed / 50) * 100);
    barColor = '#7A9E7E';
  } else if (selectedFactor === 'uv') {
    metricLabel = 'UV Index';
    metricValueFormatted = `${selectedHour.uvIndex} / 12`;
    barValue = Math.min(100, (selectedHour.uvIndex / 12) * 100);
    barColor = '#FFB21A';
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.underlay} />

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.headerDot}>●</Text>
          <Text style={styles.title}>
            {title}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>
            {metricLabel.toUpperCase()}
          </Text>
          <Text style={styles.metricValue}>
            {metricValueFormatted}
          </Text>
        </View>

        <View style={styles.barContainer}>
          <AnimatedBar
            label=""
            value={barValue}
            unit=""
            color={barColor}
            height={10}
          />
        </View>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerDot: {
    color: '#FF5533',
    fontSize: 10,
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.5,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#717171',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#171717',
  },
  barContainer: {
    marginTop: 4,
  },
});
