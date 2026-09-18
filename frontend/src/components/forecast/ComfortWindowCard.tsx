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

  const title = isFitnessPersona
    ? 'Best Workout Window'
    : 'Optimal Comfort Window';

  return (
    <View style={styles.wrapper}>
      <View style={styles.underlay} />

      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isFitnessPersona ? 'fitness' : 'partly-sunny'}
            size={20}
            color="#171717"
          />
        </View>

        <View style={styles.textColumn}>
          <View style={styles.badgeRow}>
            <Text style={styles.badgeLabel}>
              {isFitnessPersona ? 'FITNESS ADVISORY' : 'COMFORT ADVISORY'}
            </Text>
          </View>
          <Text style={styles.title}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {windowData.summary}
          </Text>
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
    borderRadius: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#171717',
    borderRadius: 10,
    minHeight: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#A8C7FF',
    borderWidth: 2,
    borderColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeRow: {
    marginBottom: 2,
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF5533',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#171717',
    lineHeight: 20,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#4A4A4A',
    lineHeight: 16,
    fontWeight: '500',
  },
});
