import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '../common/AppText';
import { useTheme } from '../../design';
import { hapticManager } from '../../services/haptics/hapticManager';
import { audioManager } from '../../services/audio/audioManager';
import { CharacterState as EngineCharacterState } from '../../engines/weather';

export interface SuggestionInsightItem {
  id: string;
  type: string;
  message: string; // Title
  tip?: string;    // Description / body
  characterState: EngineCharacterState;
  badge?: string;
  isPrimary?: boolean;
}

export interface SwipeableInsightsCarouselProps {
  items: SuggestionInsightItem[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  style?: ViewStyle;
}

const getInsightIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'now':
      return 'flash-outline';
    case 'next':
      return 'time-outline';
    case 'tomorrow':
      return 'calendar-outline';
    case 'rain':
      return 'rainy-outline';
    case 'heat':
      return 'flame-outline';
    case 'wind':
      return 'speedometer-outline';
    case 'uv':
      return 'sunny-outline';
    case 'aqi':
      return 'leaf-outline';
    case 'cold':
      return 'snow-outline';
    case 'commute':
      return 'car-outline';
    case 'fitness':
      return 'fitness-outline';
    default:
      return 'bulb-outline';
  }
};

export const SwipeableInsightsCarousel: React.FC<SwipeableInsightsCarouselProps> = ({
  items,
  activeIndex,
  onIndexChange,
  style,
}) => {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isScrollingRef = useRef<boolean>(false);
  const lastReportedIndexRef = useRef<number>(activeIndex);

  // Measure container width dynamically to ensure pixel-perfect snapping across devices
  const handleLayout = (e: LayoutChangeEvent) => {
    const width = Math.round(e.nativeEvent.layout.width);
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  // Synchronize ScrollView offset when activeIndex is changed externally (e.g. character tap or bubble swipe)
  useEffect(() => {
    if (containerWidth > 0 && !isScrollingRef.current) {
      if (lastReportedIndexRef.current !== activeIndex) {
        lastReportedIndexRef.current = activeIndex;
        scrollViewRef.current?.scrollTo({
          x: activeIndex * containerWidth,
          animated: true,
        });
      }
    }
  }, [activeIndex, containerWidth]);

  const handleScrollBegin = () => {
    isScrollingRef.current = true;
  };

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrollingRef.current = false;
      if (containerWidth <= 0 || items.length === 0) return;

      const offsetX = e.nativeEvent.contentOffset.x;
      const rawIndex = Math.round(offsetX / containerWidth);
      const boundedIndex = Math.max(0, Math.min(rawIndex, items.length - 1));

      if (boundedIndex !== lastReportedIndexRef.current) {
        lastReportedIndexRef.current = boundedIndex;
        hapticManager.selection();
        audioManager.play('selection');
        onIndexChange(boundedIndex);
      }
    },
    [containerWidth, items.length, onIndexChange]
  );

  const handleNavigate = (targetIndex: number) => {
    if (items.length === 0) return;
    const nextIndex = (targetIndex + items.length) % items.length;
    lastReportedIndexRef.current = nextIndex;
    hapticManager.selection();
    audioManager.play('selection');
    onIndexChange(nextIndex);
    if (containerWidth > 0) {
      scrollViewRef.current?.scrollTo({
        x: nextIndex * containerWidth,
        animated: true,
      });
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  const safeIndex = Math.max(0, Math.min(activeIndex, items.length - 1));

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {/* Top Header Row with Section Title, Counter Badge, and Chevron Controls */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.isNight ? '#F3FAFF' : theme.colors.textPrimary,
                fontSize: theme.typography.sizes.headline,
                fontWeight: theme.typography.weights.bold,
              },
            ]}
          >
            Insights & Suggestions
          </Text>
          <View
            style={[
              styles.counterBadge,
              {
                backgroundColor: theme.isNight ? 'rgba(53, 183, 242, 0.18)' : theme.colors.primaryLight,
                borderColor: theme.isNight ? 'rgba(53, 183, 242, 0.35)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            <Text
              style={[
                styles.counterText,
                {
                  color: theme.isNight ? '#35B7F2' : theme.colors.primaryDark,
                },
              ]}
            >
              {safeIndex + 1}/{items.length}
            </Text>
          </View>
        </View>

        {/* Previous / Next Arrow Controls */}
        <View style={styles.navControls}>
          <Pressable
            onPress={() => handleNavigate(safeIndex - 1)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
            style={({ pressed }) => [
              styles.navButton,
              {
                backgroundColor: theme.isNight ? '#102A3B' : theme.colors.backgroundCard,
                borderColor: theme.isNight ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Previous suggestion"
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color={theme.isNight ? '#F3FAFF' : theme.colors.textPrimary}
            />
          </Pressable>

          <Pressable
            onPress={() => handleNavigate(safeIndex + 1)}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
            style={({ pressed }) => [
              styles.navButton,
              {
                backgroundColor: theme.isNight ? '#102A3B' : theme.colors.backgroundCard,
                borderColor: theme.isNight ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Next suggestion"
          >
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.isNight ? '#F3FAFF' : theme.colors.textPrimary}
            />
          </Pressable>
        </View>
      </View>

      {/* Horizontal Swipeable Cards Viewport */}
      {containerWidth > 0 && (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          snapToInterval={containerWidth}
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollBegin={handleScrollBegin}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {items.map((item, idx) => {
            const isPrimary = item.isPrimary ?? (idx === 0);
            const cardBg = isPrimary
              ? (theme.isNight ? '#102A3B' : theme.colors.primaryLight)
              : (theme.isNight ? '#0E2333' : theme.colors.backgroundCard);

            const iconColor = isPrimary
              ? (theme.isNight ? '#35B7F2' : theme.colors.primaryDark)
              : theme.colors.primary;

            return (
              <View
                key={item.id || idx}
                style={[styles.slide, { width: containerWidth }]}
              >
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: cardBg,
                      borderRadius: theme.radius.cardLarge || 22,
                      borderColor: theme.isNight ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    },
                  ]}
                >
                  {/* Top Meta Row (Badge, Category Icon, Swipe Cue) */}
                  <View style={styles.cardHeader}>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.iconCircle,
                          {
                            backgroundColor: theme.isNight
                              ? 'rgba(53, 183, 242, 0.15)'
                              : 'rgba(255, 255, 255, 0.8)',
                          },
                        ]}
                      >
                        <Ionicons name={getInsightIcon(item.type)} size={17} color={iconColor} />
                      </View>
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: iconColor,
                            fontWeight: theme.typography.weights.semibold,
                          },
                        ]}
                      >
                        {item.badge || (isPrimary ? 'Priority Intelligence' : 'Contextual Advisory')}
                      </Text>
                    </View>

                    <View style={styles.swipeCue}>
                      <Ionicons
                        name="swap-horizontal"
                        size={14}
                        color={theme.isNight ? '#7A9CB5' : theme.colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.swipeCueText,
                          {
                            color: theme.isNight ? '#7A9CB5' : theme.colors.textMuted,
                          },
                        ]}
                      >
                        Swipe
                      </Text>
                    </View>
                  </View>

                  {/* Title */}
                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        color: theme.colors.textPrimary,
                        fontSize: isPrimary
                          ? theme.typography.sizes.title3
                          : theme.typography.sizes.headline,
                        fontWeight: theme.typography.weights.bold,
                      },
                    ]}
                  >
                    {item.message}
                  </Text>

                  {/* Body / Description */}
                  {item.tip ? (
                    <Text
                      style={[
                        styles.cardMessage,
                        {
                          color: theme.colors.textSecondary,
                          fontSize: isPrimary
                            ? theme.typography.sizes.body
                            : theme.typography.sizes.callout,
                          lineHeight: isPrimary
                            ? theme.typography.lineHeights.body
                            : theme.typography.lineHeights.callout,
                        },
                      ]}
                    >
                      {item.tip}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Bottom Pagination Dots */}
      {items.length > 1 && (
        <View style={styles.paginationRow}>
          {items.map((_, idx) => {
            const isActive = idx === safeIndex;
            return (
              <Pressable
                key={idx}
                onPress={() => handleNavigate(idx)}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                style={({ pressed }) => [
                  styles.dotTouch,
                  pressed && { opacity: 0.6 },
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Go to suggestion ${idx + 1}`}
              >
                <View
                  style={[
                    styles.dot,
                    isActive ? styles.dotActive : styles.dotInactive,
                    {
                      backgroundColor: isActive
                        ? (theme.isNight ? '#35B7F2' : theme.colors.primary)
                        : (theme.isNight ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.15)'),
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  counterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
      default: {},
    }),
  },
  scrollContent: {
    alignItems: 'stretch',
  },
  slide: {
    paddingVertical: 4,
  },
  card: {
    padding: 20,
    borderWidth: 1,
    minHeight: 120,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  swipeCue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.85,
  },
  swipeCueText: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardTitle: {
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  cardMessage: {
    marginTop: 2,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
  },
  dotTouch: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotInactive: {
    width: 6,
  },
  dotActive: {
    width: 18,
  },
});
