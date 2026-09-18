import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { AppText as Text } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../design';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { audioManager } from '../../services/audio/audioManager';
import { hapticManager } from '../../services/haptics/hapticManager';

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

const REASONS: { id: FeedbackReason; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'too_early', label: 'Too early in the day', icon: 'alarm-outline' },
  { id: 'too_late', label: 'Arrived too late', icon: 'hourglass-outline' },
  { id: 'not_relevant', label: 'Not relevant to my routine', icon: 'close-circle-outline' },
  { id: 'forecast_changed', label: 'Forecast changed / inaccurate', icon: 'rainy-outline' },
  { id: 'other', label: 'Other feedback', icon: 'chatbubble-ellipses-outline' },
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
    hapticManager.impact('medium');
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
        <View style={styles.wrapper}>
          <View style={styles.underlay} />

          <View style={styles.modalContainer}>
            {/* Retro window header */}
            <View style={styles.windowHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.dot}>●</Text>
                <Text style={styles.headerTitle}>DIAGNOSTIC FEEDBACK</Text>
              </View>
              <Pressable onPress={onClose}>
                <Text style={styles.headerClose}>[ ✕ ]</Text>
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.title}>
                What was off?
              </Text>

              <Text style={styles.subtext}>
                Help your companion understand so tomorrow's forecast is dialed in.
              </Text>

              <ScrollView style={{ maxHeight: 260 }}>
                {REASONS.map((r) => {
                  const isSelected = selectedReason === r.id;
                  return (
                    <Pressable
                      key={r.id}
                      onPress={() => {
                        hapticManager.selection();
                        audioManager.play('selection');
                        setSelectedReason(r.id);
                      }}
                      style={[
                        styles.reasonItem,
                        {
                          backgroundColor: isSelected ? '#FFB21A' : '#FFFFFF',
                          borderWidth: isSelected ? 2.5 : 2,
                        },
                      ]}
                    >
                      <Ionicons
                        name={r.icon}
                        size={18}
                        color="#171717"
                        style={{ marginRight: 10 }}
                      />
                      <Text
                        style={[
                          styles.reasonLabel,
                          {
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {r.label}
                      </Text>
                      {isSelected && (
                        <Text style={{ fontWeight: '900', color: '#171717' }}>●</Text>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.buttonRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <SecondaryButton
                    label="Skip"
                    onPress={onClose}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <PrimaryButton
                    label="Submit ➔"
                    onPress={handleSubmit}
                    disabled={!selectedReason}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 23, 23, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  wrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 380,
    paddingRight: 5,
    paddingBottom: 5,
  },
  underlay: {
    position: 'absolute',
    left: 5,
    top: 5,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 12,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#171717',
    borderRadius: 12,
    overflow: 'hidden',
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F4EB',
    borderBottomWidth: 2,
    borderBottomColor: '#171717',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    color: '#FF5533',
    fontSize: 10,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.8,
  },
  headerClose: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
  },
  modalBody: {
    padding: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#171717',
    textAlign: 'center',
  },
  subtext: {
    fontSize: 13,
    color: '#4A4A4A',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderColor: '#171717',
  },
  reasonLabel: {
    flex: 1,
    fontSize: 13,
    color: '#171717',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
});
