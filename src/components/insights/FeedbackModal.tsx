import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../design';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { audioManager } from '../../services/audio/audioManager';

export type FeedbackReason =
  | 'too_early'
  | 'too_late'
  | 'not_relevant'
  | 'forecast_changed'
  | 'other';

export interface FeedbackModalProps {
  visible: boolean;
  decisionId: string;
  onClose: () => void;
  onSubmitReason: (decisionId: string, reason: FeedbackReason) => void;
}

const REASONS: { id: FeedbackReason; label: string; icon: string }[] = [
  { id: 'too_early', label: 'Too early', icon: '⏱️' },
  { id: 'too_late', label: 'Too late', icon: '⌛' },
  { id: 'not_relevant', label: 'Not relevant to me', icon: '🎯' },
  { id: 'forecast_changed', label: 'Forecast changed / wrong', icon: '🌧️' },
  { id: 'other', label: 'Other', icon: '💬' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  decisionId,
  onClose,
  onSubmitReason,
}) => {
  const theme = useTheme();
  const [selectedReason, setSelectedReason] = useState<FeedbackReason | null>(null);

  const handleSubmit = () => {
    if (!selectedReason) return;
    audioManager.play('feedback_positive');
    onSubmitReason(decisionId, selectedReason);
    setSelectedReason(null);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.backgroundCard,
              borderRadius: theme.radius.cardLarge,
              padding: theme.spacing.xl,
              ...theme.shadows.lg,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.textPrimary,
                fontSize: theme.typography.sizes.title3,
                fontWeight: theme.typography.weights.bold,
              },
            ]}
          >
            What was off?
          </Text>

          <Text
            style={[
              styles.subtext,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizes.body,
                marginTop: theme.spacing.xs,
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            Help us understand so tomorrow's weather companion is more accurate.
          </Text>

          <ScrollView style={{ maxHeight: 280 }}>
            {REASONS.map((r) => {
              const isSelected = selectedReason === r.id;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => {
                    audioManager.play('selection');
                    setSelectedReason(r.id);
                  }}
                  style={[
                    styles.reasonItem,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.cardSelectedBg
                        : theme.colors.backgroundCardMuted,
                      borderColor: isSelected
                        ? theme.colors.borderSelected
                        : theme.colors.border,
                      borderRadius: theme.radius.sm,
                    },
                  ]}
                >
                  <Text style={styles.reasonIcon}>{r.icon}</Text>
                  <Text
                    style={[
                      styles.reasonLabel,
                      {
                        color: isSelected
                          ? theme.colors.primaryDark
                          : theme.colors.textPrimary,
                        fontWeight: isSelected
                          ? theme.typography.weights.bold
                          : theme.typography.weights.medium,
                      },
                    ]}
                  >
                    {r.label}
                  </Text>
                  {isSelected && <Text style={{ color: theme.colors.primary }}>✓</Text>}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.buttonRow}>
            <SecondaryButton
              label="Skip"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8, height: 46 }}
            />
            <PrimaryButton
              label="Submit"
              onPress={handleSubmit}
              disabled={!selectedReason}
              style={{ flex: 1, marginLeft: 8, height: 46 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    textAlign: 'center',
  },
  subtext: {
    textAlign: 'center',
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 4,
    borderWidth: 1.5,
  },
  reasonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  reasonLabel: {
    flex: 1,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
});
