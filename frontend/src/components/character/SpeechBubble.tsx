import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText as Text } from '../common/AppText';
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
      {pointerDirection === 'up' && (
        <View style={[styles.pointerUp, theme.isNight && { borderBottomColor: '#3A3A3A' }]} />
      )}

      <View style={styles.wrapper}>
        <View style={[styles.underlay, theme.isNight && { backgroundColor: '#000000' }]} />
        <View style={[styles.bubble, theme.isNight && { backgroundColor: '#242424', borderColor: '#3A3A3A' }]}>
          <Text style={[styles.title, theme.isNight && { color: '#FFFDF7' }]}>
            {text}
          </Text>
          {subtext && (
            <Text style={[styles.subtext, theme.isNight && { color: '#BFBFBF' }]}>
              {subtext}
            </Text>
          )}
        </View>
      </View>

      {pointerDirection === 'down' && (
        <View style={[styles.pointerDown, theme.isNight && { borderTopColor: '#3A3A3A' }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  wrapper: {
    position: 'relative',
    paddingRight: 4,
    paddingBottom: 4,
    maxWidth: '92%',
    minWidth: 200,
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
  bubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#171717',
    borderRadius: 10,
    padding: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#171717',
    textAlign: 'center',
    lineHeight: 20,
  },
  subtext: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A4A4A',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  pointerDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#171717',
    marginTop: -2,
  },
  pointerUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#171717',
    marginBottom: -2,
  },
});
