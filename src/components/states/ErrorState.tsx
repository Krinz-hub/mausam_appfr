import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { useTheme } from '../../design';
import { Character } from '../character/Character';
import { PrimaryButton } from '../buttons/PrimaryButton';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Weather unavailable',
  message = "We couldn't get the latest weather. Try again in a moment.",
  onRetry,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Character state="concerned" size="lg" />
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.typography.sizes.title3,
            fontWeight: theme.typography.weights.bold,
            marginTop: theme.spacing.md,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.message,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.sizes.body,
            marginVertical: theme.spacing.sm,
            lineHeight: theme.typography.lineHeights.body,
          },
        ]}
      >
        {message}
      </Text>
      {onRetry && (
        <PrimaryButton
          label="Try again"
          onPress={onRetry}
          style={{ marginTop: theme.spacing.md, maxWidth: 200 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 260,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    maxWidth: 280,
  },
});
