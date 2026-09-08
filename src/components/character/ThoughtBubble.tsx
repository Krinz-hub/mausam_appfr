import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../design';
import { hapticManager } from '../../services/haptics/hapticManager';

export interface ThoughtBubbleProps {
  text: string;
  onPress?: () => void;
  style?: ViewStyle;
  pointerPosition?: 'below' | 'above'; // 'below' means thought dots point down towards character below
}

export const ThoughtBubble: React.FC<ThoughtBubbleProps> = ({
  text,
  onPress,
  style,
  pointerPosition = 'below',
}) => {
  const theme = useTheme();

  const bubbleBg = theme.isNight ? '#102A3B' : theme.colors.backgroundCard;
  const textColor = theme.isNight ? '#F3FAFF' : theme.colors.textPrimary;
  const borderColor = theme.isNight ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)';

  const handlePress = () => {
    hapticManager.selection();
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Character thought: ${text}. Tap to cycle suggestion`}
      style={({ pressed }) => [
        styles.container,
        style,
        { cursor: 'pointer' } as any,
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
      ]}
    >
      {/* If dots are above the bubble (when character is above bubble) */}
      {pointerPosition === 'above' && (
        <View style={styles.trailAbove}>
          <View style={[styles.dotSmall, { backgroundColor: bubbleBg, borderColor, borderWidth: 1 }]} />
          <View style={[styles.dotMedium, { backgroundColor: bubbleBg, borderColor, borderWidth: 1 }]} />
        </View>
      )}

      {/* Main Thought Cloud Body */}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleBg,
            borderRadius: 20,
            borderWidth: 1,
            borderColor,
            ...theme.shadows.sm,
          },
        ]}
      >
        <Text style={[styles.text, { color: textColor }]}>
          {text}
        </Text>
      </View>

      {/* If dots are below the bubble (when character is below bubble) */}
      {pointerPosition === 'below' && (
        <View style={styles.trailBelow}>
          <View style={[styles.dotMedium, { backgroundColor: bubbleBg, borderColor, borderWidth: 1 }]} />
          <View style={[styles.dotSmall, { backgroundColor: bubbleBg, borderColor, borderWidth: 1 }]} />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 4,
    maxWidth: 300,
    alignSelf: 'center',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  trailBelow: {
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  trailAbove: {
    alignItems: 'center',
    gap: 3,
    marginBottom: 3,
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
