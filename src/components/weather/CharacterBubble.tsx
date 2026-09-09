import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../../design';
import { hapticManager } from '../../services/haptics/hapticManager';

export interface CharacterBubbleProps {
  message: string;
  tip?: string;
  onPress?: () => void;
  style?: ViewStyle;
  pointerPosition?: 'below' | 'above' | 'none';
  testID?: string;
}

export const CharacterBubble: React.FC<CharacterBubbleProps> = ({
  message,
  tip,
  onPress,
  style,
  pointerPosition = 'above',
  testID = 'character-bubble',
}) => {
  const theme = useTheme();

  const bubbleBg = theme.isNight ? '#102A3B' : theme.colors.backgroundCard;
  const textColor = theme.isNight ? '#F3FAFF' : theme.colors.textPrimary;
  const tipColor = theme.isNight ? '#B9CEDA' : theme.colors.textSecondary;
  const borderColor = theme.isNight
    ? 'rgba(255, 255, 255, 0.14)'
    : 'rgba(0, 0, 0, 0.08)';

  const handlePress = () => {
    hapticManager.selection();
    onPress?.();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Companion reaction: ${message}${tip ? `. Tip: ${tip}` : ''}. Tap for next insight.`}
      style={({ pressed }) => [
        styles.container,
        style,
        Platform.select({
          web: { cursor: 'pointer' } as any,
          default: {},
        }),
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
      ]}
    >
      {/* Pointer dots above bubble (when character is positioned above) */}
      {pointerPosition === 'above' && (
        <View style={styles.trailAbove}>
          <View
            style={[
              styles.dotSmall,
              { backgroundColor: bubbleBg, borderColor, borderWidth: 1 },
            ]}
          />
          <View
            style={[
              styles.dotMedium,
              { backgroundColor: bubbleBg, borderColor, borderWidth: 1 },
            ]}
          />
        </View>
      )}

      {/* Main Bubble Body */}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleBg,
            borderColor,
            borderRadius: 20,
            borderWidth: 1,
            ...theme.shadows.sm,
          },
        ]}
      >
        <Text style={[styles.message, { color: textColor }]}>
          {message}
        </Text>
        {tip ? (
          <Text style={[styles.tip, { color: tipColor }]}>
            {tip}
          </Text>
        ) : null}
      </View>

      {/* Pointer dots below bubble */}
      {pointerPosition === 'below' && (
        <View style={styles.trailBelow}>
          <View
            style={[
              styles.dotMedium,
              { backgroundColor: bubbleBg, borderColor, borderWidth: 1 },
            ]}
          />
          <View
            style={[
              styles.dotSmall,
              { backgroundColor: bubbleBg, borderColor, borderWidth: 1 },
            ]}
          />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 6,
    maxWidth: 340,
    alignSelf: 'center',
  },
  bubble: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  tip: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '400',
  },
  trailAbove: {
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  trailBelow: {
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  dotMedium: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
