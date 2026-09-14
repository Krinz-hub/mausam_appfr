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
    ? 'Best Outdoor Workout Window'
    : 'Optimal Comfort Window';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.isNight
            ? theme.colors.cardSelectedBg
            : theme.colors.surfaceBlue,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.backgroundCard },
        ]}
      >
        <Ionicons
          name={isFitnessPersona ? 'fitness' : 'partly-sunny'}
          size={22}
          color={theme.colors.primary}
        />
      </View>

      <View style={styles.textColumn}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.primary,
              fontSize: theme.typography.sizes.headline,
              fontWeight: theme.typography.weights.bold,
            },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizes.subhead,
              fontWeight: theme.typography.weights.medium,
            },
          ]}
          numberOfLines={2}
        >
          {windowData.summary}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F7FD',
    borderRadius: 22,
    minHeight: 88,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginVertical: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    lineHeight: 21,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
