import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
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
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionDot}>●</Text>
        <Text style={[styles.heading, theme.isNight && { color: '#FFFDF7' }]}>
          7-DAY OUTLOOK TABLE
        </Text>
      </View>

      {/* Neo-brutalist compact structured rows table */}
      <View style={styles.tableWrapper}>
        <View style={[styles.tableUnderlay, theme.isNight && { backgroundColor: '#000000' }]} />

        <View style={[styles.tableBody, theme.isNight && { backgroundColor: '#242424', borderColor: '#3A3A3A' }]}>
          {daily.map((day, idx) => {
            const isLast = idx === daily.length - 1;
            const recommendation = getDailyPersonalizedRecommendation(day, persona, aqi);

            return (
              <Pressable
                key={idx}
                onPress={() => onPressDay?.(day, idx)}
                style={({ pressed }) => [
                  styles.row,
                  theme.isNight && { backgroundColor: '#242424' },
                  !isLast && styles.rowBorder,
                  !isLast && theme.isNight && { borderBottomColor: '#383838' },
                  pressed && (theme.isNight ? { backgroundColor: '#2E2416' } : styles.rowPressed),
                ]}
              >
                {/* Day & Icon */}
                <View style={styles.dayCol}>
                  <View style={styles.iconBox}>
                    <WeatherIcon condition={day.conditionText} size={16} />
                  </View>
                  <Text style={[styles.dayName, theme.isNight && { color: '#FFFDF7' }]}>
                    {day.dayName.slice(0, 3).toUpperCase()}
                  </Text>
                </View>

                {/* Condition & Recommendation */}
                <View style={styles.recCol}>
                  <Text style={[styles.conditionText, theme.isNight && { color: '#FFFDF7' }]} numberOfLines={1}>
                    {day.conditionText}
                  </Text>
                  <Text style={[styles.recommendationText, theme.isNight && { color: '#BFBFBF' }]} numberOfLines={1}>
                    {recommendation}
                  </Text>
                </View>

                {/* Temperatures & Arrow */}
                <View style={styles.tempCol}>
                  <Text style={[styles.tempHigh, theme.isNight && { color: '#FFFDF7' }]}>
                    {Math.round(day.maxTemp)}°
                  </Text>
                  <Text style={[styles.tempLow, theme.isNight && { color: '#888888' }]}>
                    {Math.round(day.minTemp)}°
                  </Text>
                  <Text style={[styles.arrowText, theme.isNight && { color: '#FFFDF7' }]}>→</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionDot: {
    color: '#FF5533',
    fontSize: 10,
    marginRight: 6,
  },
  heading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.8,
  },
  tableWrapper: {
    position: 'relative',
    paddingRight: 4,
    paddingBottom: 4,
    width: '100%',
  },
  tableUnderlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 12,
  },
  tableBody: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#171717',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  rowBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#171717',
  },
  rowPressed: {
    backgroundColor: '#FFF0D4',
  },
  dayCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 78,
  },
  iconBox: {
    marginRight: 6,
  },
  dayName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.5,
  },
  recCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#171717',
  },
  recommendationText: {
    fontSize: 11,
    color: '#717171',
    fontWeight: '500',
    marginTop: 1,
  },
  tempCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tempHigh: {
    fontSize: 14,
    fontWeight: '800',
    color: '#171717',
    marginRight: 4,
  },
  tempLow: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8A8A',
    marginRight: 8,
  },
  arrowText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#171717',
  },
});
