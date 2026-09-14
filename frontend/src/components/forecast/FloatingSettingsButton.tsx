import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../design';
import { audioManager } from '../../services/audio/audioManager';
import { hapticManager } from '../../services/haptics/hapticManager';

export interface FloatingSettingsButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

export const FloatingSettingsButton: React.FC<FloatingSettingsButtonProps> = ({
  onPress,
  style,
}) => {
  const theme = useTheme();

  const handlePress = () => {
    audioManager.play('selection');
    hapticManager.impact('light');
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Open settings and profile"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.colors.primary,
          shadowColor: theme.colors.primary,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
        style,
      ]}
    >
      <Ionicons name="options-outline" size={18} color="#FFFFFF" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});
