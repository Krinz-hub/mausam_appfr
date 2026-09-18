import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { Character } from '../character/Character';

import { useTheme } from '../../design';

export interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Consulting the skies for you...',
  style,
}) => {
  const theme = useTheme();
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 450);
    return () => clearInterval(timer);
  }, []);

  const dots = [1, 2, 3].map((i) => (i <= dotCount ? '●' : '○')).join(' ');

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.underlay, theme.isNight && { backgroundColor: '#000000' }]} />
      <View style={[styles.card, theme.isNight && { backgroundColor: '#242424', borderColor: '#3A3A3A' }]}>
        <Character state="thinking" size="lg" />

        <View style={[styles.loadingBanner, theme.isNight && { backgroundColor: '#2E2416', borderColor: '#3A3A3A' }]}>
          <Text style={[styles.loadingLabel, theme.isNight && { color: '#FFB21A' }]}>LOADING</Text>
          <Text style={styles.dotsText}>{dots}</Text>
        </View>

        <Text style={[styles.messageText, theme.isNight && { color: '#E8E8E8' }]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingRight: 4,
    paddingBottom: 4,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 360,
  },
  underlay: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#171717',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0D4',
    borderWidth: 1.5,
    borderColor: '#171717',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 14,
    marginBottom: 8,
  },
  loadingLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 1,
    marginRight: 6,
  },
  dotsText: {
    fontSize: 12,
    color: '#FF5533',
    letterSpacing: 2,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4A4A',
    textAlign: 'center',
    marginTop: 4,
  },
});
