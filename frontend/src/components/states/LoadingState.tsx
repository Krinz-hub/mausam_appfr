import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { useTheme } from '../../design';
import { Character } from '../character/Character';

export interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Consulting the skies for you...',
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Character state="thinking" size="lg" />
      <Text
        style={[
          styles.text,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.sizes.body,
            marginTop: theme.spacing.md,
            fontWeight: theme.typography.weights.medium,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  text: {
    textAlign: 'center',
  },
});
