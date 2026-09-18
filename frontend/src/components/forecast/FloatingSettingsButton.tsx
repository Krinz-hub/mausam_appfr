import React from 'react';
import { StyleSheet, Pressable, ViewStyle, View } from 'react-native';
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
    <View style={[styles.wrapper, style]}>
      <View style={styles.underlay} />
      <Pressable
        onPress={handlePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Open settings and profile"
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Ionicons name="options-outline" size={18} color="#171717" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: 44,
    height: 44,
    paddingRight: 3,
    paddingBottom: 3,
  },
  underlay: {
    position: 'absolute',
    left: 3,
    top: 3,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 8,
  },
  button: {
    width: 41,
    height: 41,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#171717',
    backgroundColor: '#FFB21A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
});
