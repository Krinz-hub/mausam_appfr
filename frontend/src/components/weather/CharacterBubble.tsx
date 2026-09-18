import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle, Platform } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { useTheme } from '../../design';
import { hapticManager } from '../../services/haptics/hapticManager';

export interface CharacterBubbleProps {
  message: string;
  tip?: string;
  onPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: ViewStyle;
  pointerPosition?: 'below' | 'above' | 'none';
  testID?: string;
  isTired?: boolean;
}

export const CharacterBubble: React.FC<CharacterBubbleProps> = ({
  message,
  tip,
  onPress,
  onSwipeLeft,
  onSwipeRight,
  style,
  pointerPosition = 'none',
  testID = 'character-bubble',
  isTired = false,
}) => {
  const theme = useTheme();
  const touchStartRef = React.useRef<{ x: number; y: number; time: number } | null>(null);
  const isSwipeHandledRef = React.useRef<boolean>(false);

  const bubbleBg = theme.isNight
    ? (isTired ? '#2E2416' : '#242424')
    : (isTired ? '#FFF0D4' : '#FFFFFF');
  const headerBg = theme.isNight
    ? (isTired ? '#FFB21A' : '#1C1C1C')
    : (isTired ? '#FFB21A' : '#F7F4EB');

  const handleTouchStart = (e: any) => {
    isSwipeHandledRef.current = false;
    touchStartRef.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: any) => {
    if (!touchStartRef.current) return;
    const dx = e.nativeEvent.pageX - touchStartRef.current.x;
    const dy = e.nativeEvent.pageY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.2 && dt < 800) {
      isSwipeHandledRef.current = true;
      if (dx < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }
  };

  const handlePress = () => {
    if (isSwipeHandledRef.current) {
      isSwipeHandledRef.current = false;
      return;
    }
    hapticManager.selection();
    onPress?.();
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Pointer connection dots above bubble */}
      {pointerPosition === 'above' && (
        <View style={styles.trailAbove}>
          <View style={[styles.dotSmall, theme.isNight && { backgroundColor: '#242424', borderColor: '#3A3A3A' }]} />
          <View style={[styles.dotMedium, theme.isNight && { backgroundColor: '#242424', borderColor: '#3A3A3A' }]} />
        </View>
      )}

      {/* Physical hard shadow underlay */}
      <View style={[styles.underlay, theme.isNight && { backgroundColor: '#000000' }]} />

      <Pressable
        testID={testID}
        onPress={handlePress}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Companion reaction: ${message}${tip ? `. Tip: ${tip}` : ''}. Swipe left or right to shuffle suggestions.`}
        style={({ pressed }) => [
          styles.container,
          { backgroundColor: bubbleBg, borderColor: theme.isNight ? '#3A3A3A' : '#171717' },
          Platform.select({
            web: { cursor: 'pointer' } as any,
            default: {},
          }),
          pressed && styles.containerPressed,
        ]}
      >
        {/* Retro computer dialog title header */}
        <View style={[styles.dialogHeader, { backgroundColor: headerBg, borderBottomColor: theme.isNight ? '#3A3A3A' : '#171717' }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerDot}>●</Text>
            <Text style={[styles.headerTitle, theme.isNight && { color: '#FFFDF7' }]}>
              {isTired ? 'SYSTEM WARNING // REST' : 'COMPANION LOG // INSIGHT'}
            </Text>
          </View>
          <Text style={[styles.headerClose, theme.isNight && { color: '#FFFDF7' }]}>[ ✕ ]</Text>
        </View>

        {/* Message and tip body */}
        <View style={styles.body}>
          <Text style={[styles.messageText, theme.isNight && { color: '#FFFDF7' }]}>
            {message}
          </Text>
          {tip ? (
            <Text style={[styles.tipText, theme.isNight && { color: '#E8E8E8' }]}>
              {tip}
            </Text>
          ) : null}

          {/* Footer prompt */}
          <View style={[styles.footerRow, theme.isNight && { borderTopColor: '#3A3A3A' }]}>
            <Text style={[styles.footerHint, theme.isNight && { color: '#BFBFBF' }]}>
              TAP TO CYCLE • SWIPE TO SHUFFLE ➔
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Pointer connection dots below bubble */}
      {pointerPosition === 'below' && (
        <View style={styles.trailBelow}>
          <View style={[styles.dotMedium, theme.isNight && { backgroundColor: '#242424', borderColor: '#3A3A3A' }]} />
          <View style={[styles.dotSmall, theme.isNight && { backgroundColor: '#242424', borderColor: '#3A3A3A' }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginVertical: 6,
    paddingRight: 4,
    paddingBottom: 4,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 380,
  },
  underlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 10,
  },
  container: {
    borderWidth: 2.5,
    borderColor: '#171717',
    borderRadius: 10,
    overflow: 'hidden',
  },
  containerPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#171717',
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.8,
  },
  headerClose: {
    fontSize: 10,
    fontWeight: '700',
    color: '#171717',
  },
  body: {
    padding: 12,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171717',
    lineHeight: 20,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A4A4A',
    lineHeight: 18,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E5E0D5',
    paddingTop: 6,
    marginTop: 2,
  },
  footerHint: {
    fontSize: 9,
    fontWeight: '800',
    color: '#717171',
    letterSpacing: 0.5,
  },
  trailAbove: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  trailBelow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#171717',
    marginHorizontal: 3,
  },
  dotMedium: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#171717',
    marginHorizontal: 3,
  },
});
