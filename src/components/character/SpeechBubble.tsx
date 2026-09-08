import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../design';

export interface SpeechBubbleProps {
  text: string;
  subtext?: string;
  style?: ViewStyle;
  pointerDirection?: 'down' | 'up';
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  subtext,
  style,
  pointerDirection = 'down',
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {pointerDirection === 'up' && <View style={[styles.pointerUp, { borderBottomColor: theme.colors.backgroundCard }]} />}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: theme.colors.backgroundCard,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.bubble,
            padding: theme.spacing.md,
            ...theme.shadows.sm,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.headline,
              fontWeight: theme.typography.weights.bold,
              lineHeight: theme.typography.lineHeights.headline,
            },
          ]}
        >
          {text}
        </Text>
        {subtext && (
          <Text
            style={[
              styles.subtext,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizes.callout,
                marginTop: theme.spacing.xs,
                lineHeight: theme.typography.lineHeights.callout,
              },
            ]}
          >
            {subtext}
          </Text>
        )}
      </View>
      {pointerDirection === 'down' && <View style={[styles.pointerDown, { borderTopColor: theme.colors.backgroundCard }]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  bubble: {
    borderWidth: 1.5,
    minWidth: 180,
    maxWidth: '92%',
  },
  title: {
    textAlign: 'center',
  },
  subtext: {
    textAlign: 'center',
  },
  pointerDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  pointerUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -1,
  },
});
