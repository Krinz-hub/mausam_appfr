import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { AppText as Text } from '../common/AppText';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../design';
import { audioManager } from '../../services/audio/audioManager';
import { hapticManager } from '../../services/haptics/hapticManager';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface SelectionCardProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onToggle: (id: string) => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  layout?: 'grid' | 'row' | 'pill';
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  id,
  title,
  subtitle,
  icon,
  iconName,
  selected,
  onToggle,
  style,
  titleStyle,
  layout = 'grid',
}) => {
  const theme = useTheme();
  const offset = useSharedValue(0);

  const handlePressIn = () => {
    offset.value = withTiming(2, { duration: 70 });
  };

  const handlePressOut = () => {
    offset.value = withTiming(0, { duration: 100 });
  };

  const handlePress = () => {
    hapticManager.selection();
    audioManager.play('selection');
    onToggle(id);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value },
      { translateY: offset.value },
    ],
  }));

  const isPill = layout === 'pill';
  const isRow = layout === 'row';

  return (
    <View style={[styles.wrapper, style]}>
      {/* Physical hard shadow underlay */}
      <View
        style={[
          styles.underlay,
          {
            borderRadius: theme.radius.card,
            backgroundColor: theme.isNight ? '#000000' : '#171717',
          },
        ]}
      />

      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible={true}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}`}
        style={[
          styles.card,
          {
            backgroundColor: selected
              ? (theme.isNight ? '#362910' : '#FFF0D4')
              : (theme.isNight ? '#242424' : '#FFFFFF'),
            borderColor: theme.isNight ? (selected ? '#FFB21A' : '#3A3A3A') : '#171717',
            borderWidth: selected ? 3 : 2.5,
            borderRadius: theme.radius.card,
            paddingHorizontal: isPill ? theme.spacing.md : theme.spacing.cardPadding,
            paddingVertical: isPill ? theme.spacing.sm : theme.spacing.cardPadding,
            flexDirection: isRow || isPill ? 'row' : 'column',
            alignItems: isRow || isPill ? 'center' : 'flex-start',
          },
          animatedStyle,
        ]}
      >
        {/* Icon */}
        {(iconName || icon) && (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: selected
                  ? '#FFB21A'
                  : (theme.isNight ? '#1C1C1C' : '#F7F4EB'),
                borderColor: theme.isNight ? (selected ? '#FFB21A' : '#3A3A3A') : '#171717',
                borderWidth: 2,
                borderRadius: 8,
                marginRight: isRow || isPill ? theme.spacing.md : 0,
                marginBottom: isRow || isPill ? 0 : theme.spacing.sm,
              },
            ]}
          >
            {iconName ? (
              <Ionicons
                name={iconName}
                size={20}
                color={selected ? '#171717' : (theme.isNight ? '#FFFDF7' : '#171717')}
              />
            ) : (
              <Text style={styles.iconText}>{icon}</Text>
            )}
          </View>
        )}

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.isNight ? '#FFFDF7' : '#171717',
                  fontSize: isPill ? theme.typography.sizes.headline : theme.typography.sizes.body,
                  fontWeight: theme.typography.weights.bold,
                },
                titleStyle,
              ]}
            >
              {title}
            </Text>
            {selected && (
              <Text style={styles.selectedIndicator}>●</Text>
            )}
          </View>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.isNight ? '#BFBFBF' : '#4A4A4A',
                  fontSize: theme.typography.sizes.footnote,
                  marginTop: theme.spacing.xxs,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Check indicator square badge */}
        <View
          style={[
            styles.checkBadge,
            {
              backgroundColor: selected
                ? (theme.isNight ? '#FFB21A' : '#171717')
                : (theme.isNight ? '#1C1C1C' : '#FFFFFF'),
              borderColor: theme.isNight ? (selected ? '#FFB21A' : '#3A3A3A') : '#171717',
              borderWidth: 2,
              borderRadius: 6,
              marginLeft: theme.spacing.sm,
            },
          ]}
        >
          {selected && (
            <Text style={[styles.checkMark, theme.isNight && selected && { color: '#171717' }]}>
              ✓
            </Text>
          )}
        </View>
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginVertical: 5,
    paddingRight: 4,
    paddingBottom: 4,
  },
  underlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
  },
  card: {
    justifyContent: 'space-between',
    minHeight: 56,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedIndicator: {
    marginLeft: 6,
    color: '#FF5533',
    fontSize: 12,
  },
  title: {
    lineHeight: 20,
  },
  subtitle: {
    lineHeight: 16,
  },
  checkBadge: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#FFFDF7',
    fontSize: 12,
    fontWeight: '900',
  },
});
