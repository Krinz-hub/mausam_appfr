import React, { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../design';
import { audioManager } from '../../services/audio/audioManager';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface SelectionCardProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
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
  selected,
  onToggle,
  style,
  titleStyle,
  layout = 'grid',
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    // Subtle bounce on selection
    scale.value = withSpring(selected ? 1.02 : 1, theme.motion.spring.responsive);
  }, [selected]);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, theme.motion.spring.stiff);
  };

  const handlePressOut = () => {
    scale.value = withSpring(selected ? 1.02 : 1, theme.motion.spring.responsive);
  };

  const handlePress = () => {
    audioManager.play('selection');
    onToggle(id);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPill = layout === 'pill';
  const isRow = layout === 'row';

  return (
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
            ? theme.colors.cardSelectedBg
            : theme.colors.cardUnselectedBg,
          borderColor: selected
            ? theme.colors.borderSelected
            : theme.colors.border,
          borderWidth: selected ? 2 : 1.5,
          borderRadius: isPill ? theme.radius.pill : theme.radius.card,
          paddingHorizontal: isPill ? theme.spacing.lg : theme.spacing.cardPadding,
          paddingVertical: isPill ? theme.spacing.md : theme.spacing.cardPadding,
          flexDirection: isRow || isPill ? 'row' : 'column',
          alignItems: isRow || isPill ? 'center' : 'flex-start',
          ...(selected ? theme.shadows.cardSelected : theme.shadows.sm),
        },
        animatedStyle,
        style,
      ]}
    >
      {/* Icon */}
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: selected ? '#DBEAFE' : theme.colors.backgroundSky,
              borderRadius: theme.radius.sm,
              marginRight: isRow || isPill ? theme.spacing.md : 0,
              marginBottom: isRow || isPill ? 0 : theme.spacing.sm,
            },
          ]}
        >
          <Text style={styles.iconText}>{icon}</Text>
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.title,
            {
              color: selected ? theme.colors.primaryDark : theme.colors.textPrimary,
              fontSize: isPill ? theme.typography.sizes.headline : theme.typography.sizes.body,
              fontWeight: selected
                ? theme.typography.weights.bold
                : theme.typography.weights.medium,
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              {
                color: selected ? theme.colors.primaryHover : theme.colors.textSecondary,
                fontSize: theme.typography.sizes.footnote,
                marginTop: theme.spacing.xxs,
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Check Indicator */}
      <View
        style={[
          styles.checkBadge,
          {
            backgroundColor: selected ? theme.colors.primary : 'transparent',
            borderColor: selected ? theme.colors.primary : theme.colors.border,
            borderWidth: 1.5,
            borderRadius: theme.radius.circle,
            marginLeft: theme.spacing.sm,
          },
        ]}
      >
        {selected && <Text style={styles.checkMark}>✓</Text>}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    justifyContent: 'space-between',
    minHeight: 56,
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 22,
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
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
