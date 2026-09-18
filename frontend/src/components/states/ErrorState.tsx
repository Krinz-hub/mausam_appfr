import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { Character } from '../character/Character';
import { PrimaryButton } from '../buttons/PrimaryButton';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'SOMETHING BROKE',
  message = "We couldn't load the skies right now. Let's give it another spin!",
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.underlay} />
      <View style={styles.card}>
        <Character state="concerned" size="lg" />

        <View style={styles.alertBadge}>
          <Text style={styles.alertIcon}>⚠</Text>
          <Text style={styles.alertText}>{title}</Text>
        </View>

        <Text style={styles.messageText}>
          {message}
        </Text>

        {onRetry && (
          <View style={styles.buttonBox}>
            <PrimaryButton
              label="TRY AGAIN"
              onPress={onRetry}
              variant="primary"
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingRight: 4,
    paddingBottom: 4,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 360,
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
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBE6',
    borderWidth: 1.5,
    borderColor: '#171717',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 14,
    marginBottom: 8,
  },
  alertIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.8,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  buttonBox: {
    width: '100%',
    maxWidth: 180,
  },
});
