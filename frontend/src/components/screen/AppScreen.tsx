import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  StyleProp,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../design';

export interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  useAtmosphereGradient?: boolean;
  gradientColors?: [string, string, ...string[]];
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const AppScreen: React.FC<AppScreenProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  backgroundColor,
  useAtmosphereGradient = true,
  gradientColors,
  edges = ['top', 'left', 'right'],
}) => {
  const theme = useTheme();
  const bg = backgroundColor || theme.colors.background;
  const gradient = theme.dayCycle?.gradient;

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingHorizontal: theme.spacing.screenHorizontal,
          paddingBottom: theme.spacing.xxl,
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.fixedContent,
        {
          paddingHorizontal: theme.spacing.screenHorizontal,
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar
        barStyle={theme.dayCycle.statusBarStyle}
        backgroundColor={Platform.OS === 'android' ? 'transparent' : undefined}
        translucent={Platform.OS === 'android'}
      />
      {useAtmosphereGradient && (gradientColors || gradient) ? (
        <LinearGradient
          colors={gradientColors || [gradient!.top, gradient!.bottom]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <SafeAreaView edges={edges} style={[styles.safeArea, style]}>
        {content}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  fixedContent: {
    flex: 1,
  },
});

