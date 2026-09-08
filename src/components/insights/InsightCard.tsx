import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../design';
import { audioManager } from '../../services/audio/audioManager';

export interface InsightCardProps {
  decisionId: string;
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

export const InsightCard: React.FC<InsightCardProps> = ({
  decisionId,
  type,
  title,
  shortMessage,
  reasonCodes = [],
  priority,
  icon = '💡',
  feedbackGiven,
  onFeedback,
  style,
  isPrimary = false,
}) => {
  const theme = useTheme();

  const handlePositive = () => {
    audioManager.play('feedback_positive');
    onFeedback?.(decisionId, 'positive');
  };

  const handleNegative = () => {
    audioManager.play('feedback_negative');
    onFeedback?.(decisionId, 'negative');
  };

  return (
    <View
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${shortMessage}`}
      style={[
        styles.card,
        {
          backgroundColor: isPrimary
            ? theme.colors.primaryLight
            : theme.colors.backgroundCard,
          borderColor: isPrimary
            ? theme.colors.borderSelected
            : theme.colors.border,
          borderWidth: isPrimary ? 2 : 1.5,
          borderRadius: theme.radius.cardLarge,
          padding: theme.spacing.cardPadding,
          ...theme.shadows.md,
        },
        style,
      ]}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{icon}</Text>
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

        {isPrimary && (
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.pill,
              },
            ]}
          >
            <Text style={styles.priorityBadgeText}>Focus</Text>
          </View>
        )}
      </View>

      {/* Conversational Short Message */}
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

      {/* Reason Codes (Explainability) */}
      {reasonCodes.length > 0 && (
        <View style={styles.tagsRow}>
          {reasonCodes.slice(0, 2).map((reason, idx) => (
            <View
              key={idx}
              style={[
                styles.reasonTag,
                {
                  backgroundColor: '#E2E8F0',
                  borderRadius: theme.radius.pill,
                },
              ]}
            >
              <Text style={[styles.reasonText, { color: theme.colors.textSecondary }]}>
                {reason.replace(/_/g, ' ').toLowerCase()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Specific Feedback Controls */}
      <View style={[styles.footer, { borderTopColor: theme.colors.borderLight }]}>
        <Text style={[styles.decisionMeta, { color: theme.colors.textMuted }]}>
          decision #{decisionId.slice(-5)}
        </Text>

        <View style={styles.feedbackControls}>
          <Pressable
            onPress={handlePositive}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Helpful recommendation"
            style={[
              styles.feedbackBtn,
              {
                backgroundColor:
                  feedbackGiven === 'positive'
                    ? theme.colors.successLight
                    : theme.colors.backgroundCardMuted,
                borderColor:
                  feedbackGiven === 'positive'
                    ? theme.colors.success
                    : theme.colors.border,
              },
            ]}
          >
            <Text style={styles.feedbackEmoji}>👍</Text>
            <Text
              style={[
                styles.feedbackText,
                {
                  color:
                    feedbackGiven === 'positive'
                      ? theme.colors.success
                      : theme.colors.textSecondary,
                  fontWeight:
                    feedbackGiven === 'positive'
                      ? theme.typography.weights.bold
                      : theme.typography.weights.medium,
                },
              ]}
            >
              Helpful
            </Text>
          </Pressable>

          <Pressable
            onPress={handleNegative}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Not helpful recommendation"
            style={[
              styles.feedbackBtn,
              {
                backgroundColor:
                  feedbackGiven === 'negative'
                    ? theme.colors.errorLight
                    : theme.colors.backgroundCardMuted,
                borderColor:
                  feedbackGiven === 'negative'
                    ? theme.colors.error
                    : theme.colors.border,
                marginLeft: 8,
              },
            ]}
          >
            <Text style={styles.feedbackEmoji}>👎</Text>
            <Text
              style={[
                styles.feedbackText,
                {
                  color:
                    feedbackGiven === 'negative'
                      ? theme.colors.error
                      : theme.colors.textSecondary,
                  fontWeight:
                    feedbackGiven === 'negative'
                      ? theme.typography.weights.bold
                      : theme.typography.weights.medium,
                },
              ]}
            >
              Not helpful
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    flex: 1,
    letterSpacing: -0.2,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 8,
  },
  priorityBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  shortMessage: {
    marginTop: 4,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  reasonTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reasonText: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  decisionMeta: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  feedbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  feedbackEmoji: {
    fontSize: 13,
    marginRight: 4,
  },
  feedbackText: {
    fontSize: 12,
  },
});
