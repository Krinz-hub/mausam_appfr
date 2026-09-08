import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
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
    <View
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${shortMessage}`}
      style={[
        styles.card,
        {
          backgroundColor: isPrimary
            ? (theme.isNight ? '#102A3B' : theme.colors.primaryLight)
            : theme.colors.backgroundCard,
          borderRadius: theme.radius.cardLarge,
        },
        style,
      ]}
    >
      {/* Title Row with Real Vector Icon */}
      <View style={styles.titleRow}>
        <Ionicons
          name={getInsightIcon(type)}
          size={20}
          color={
            isPrimary
              ? (theme.isNight ? '#35B7F2' : theme.colors.primaryDark)
              : theme.colors.primary
          }
          style={styles.icon}
        />
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.textPrimary,
              fontSize: isPrimary
                ? theme.typography.sizes.title3
                : theme.typography.sizes.headline,
              fontWeight: theme.typography.weights.bold,
            },
          ]}
        >
          {title}
        </Text>
      </View>

      {/* Description with Breathing Space */}
      <Text
        style={[
          styles.shortMessage,
          {
            color: theme.colors.textSecondary,
            fontSize: isPrimary
              ? theme.typography.sizes.body
              : theme.typography.sizes.callout,
            lineHeight: isPrimary
              ? theme.typography.lineHeights.body
              : theme.typography.lineHeights.callout,
          },
        ]}
      >
        {shortMessage}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 22,
    marginVertical: 8,
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  title: {
    flex: 1,
    letterSpacing: -0.2,
  },
  shortMessage: {
    marginTop: 12,
    marginBottom: 6,
  },
});

