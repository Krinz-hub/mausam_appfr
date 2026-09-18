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

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = Math.round(e.nativeEvent.layout.width);
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

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

  const handleNavigate = (newIndex: number) => {
    if (items.length === 0) return;
    const boundedIndex = Math.max(0, Math.min(newIndex, items.length - 1));
    if (boundedIndex === activeIndex) return;

    hapticManager.selection();
    audioManager.play('selection');
    onIndexChange(boundedIndex);

    if (containerWidth > 0) {
      scrollViewRef.current?.scrollTo({
        x: boundedIndex * containerWidth,
        animated: true,
      });
    }
  };

  if (!items || items.length === 0) return null;

  const safeIndex = Math.max(0, Math.min(activeIndex, items.length - 1));

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {/* Neo-brutalist carousel utility header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerDot}>●</Text>
          <Text style={styles.headerTitle}>
            INTELLIGENCE POOL
          </Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {safeIndex + 1}/{items.length}
            </Text>
          </View>
        </View>

        {/* Previous / Next Arrow Controls */}
        <View style={styles.navControls}>
          <Pressable
            onPress={() => handleNavigate(safeIndex - 1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
            style={({ pressed }) => [
              styles.navButton,
              pressed && styles.navButtonPressed,
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Previous suggestion"
          >
            <Ionicons name="chevron-back" size={15} color="#171717" />
          </Pressable>

          <Pressable
            onPress={() => handleNavigate(safeIndex + 1)}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
            style={({ pressed }) => [
              styles.navButton,
              pressed && styles.navButtonPressed,
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Next suggestion"
          >
            <Ionicons name="chevron-forward" size={15} color="#171717" />
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
            const cardBg = isPrimary ? '#FFF7DE' : '#FFFFFF';
            const badgeBg = isPrimary ? '#FFB21A' : '#EBF3FF';

            return (
              <View
                key={item.id || idx}
                style={[styles.slide, { width: containerWidth }]}
              >
                <View style={styles.cardWrapper}>
                  {/* Hard offset shadow underlay */}
                  <View style={styles.cardUnderlay} />

                  <View
                    style={[
                      styles.card,
                      { backgroundColor: cardBg },
                    ]}
                  >
                    {/* Top Meta Row (Badge, Category Icon, Swipe Cue) */}
                    <View style={styles.cardHeader}>
                      <View style={styles.badgeRow}>
                        <View
                          style={[
                            styles.iconBox,
                            { backgroundColor: badgeBg },
                          ]}
                        >
                          <Ionicons
                            name={getInsightIcon(item.type)}
                            size={16}
                            color="#171717"
                          />
                        </View>
                        <Text style={styles.badgeText}>
                          {item.badge || (isPrimary ? 'Priority Intelligence' : 'Contextual Advisory')}
                        </Text>
                      </View>

                      <View style={styles.swipeCue}>
                        <Text style={styles.swipeCueText}>
                          SWIPE ➔
                        </Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.cardTitle}>
                      {item.message}
                    </Text>

                    {/* Body / Description */}
                    {item.tip ? (
                      <Text style={styles.cardMessage}>
                        {item.tip}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Bottom Pagination Dots (Retro Squares) */}
      {items.length > 1 && (
        <View style={styles.paginationRow}>
          {items.map((_, idx) => {
            const isActive = idx === safeIndex;
            return (
              <Pressable
                key={idx}
                onPress={() => handleNavigate(idx)}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                style={styles.dotTouch}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Go to suggestion ${idx + 1}`}
              >
                <View
                  style={[
                    styles.squareDot,
                    isActive ? styles.squareDotActive : styles.squareDotInactive,
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
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerDot: {
    color: '#FF5533',
    fontSize: 10,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.8,
  },
  counterBadge: {
    backgroundColor: '#FFF0D4',
    borderWidth: 1.5,
    borderColor: '#171717',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 8,
  },
  counterText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
  },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#171717',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  navButtonPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
  },
  scrollContent: {
    alignItems: 'center',
  },
  slide: {
    paddingHorizontal: 2,
  },
  cardWrapper: {
    position: 'relative',
    marginVertical: 4,
    paddingRight: 4,
    paddingBottom: 4,
    width: '100%',
  },
  cardUnderlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 12,
  },
  card: {
    borderWidth: 2.5,
    borderColor: '#171717',
    borderRadius: 12,
    padding: 16,
    minHeight: 115,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#171717',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  swipeCue: {
    backgroundColor: '#F7F4EB',
    borderWidth: 1,
    borderColor: '#171717',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  swipeCueText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#717171',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#171717',
    lineHeight: 22,
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A4A4A',
    lineHeight: 18,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dotTouch: {
    padding: 4,
  },
  squareDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#171717',
    marginHorizontal: 3,
  },
  squareDotActive: {
    backgroundColor: '#FF5533',
  },
  squareDotInactive: {
    backgroundColor: '#FFFFFF',
  },
});
