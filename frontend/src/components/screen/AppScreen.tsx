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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  refreshControl?: React.ReactElement;
  showsVerticalScrollIndicator?: boolean;
}

export const AppScreen: React.FC<AppScreenProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  backgroundColor,
  edges = ['top', 'left', 'right'],
  refreshControl,
  showsVerticalScrollIndicator = false,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bg = backgroundColor || theme.colors.background;

  // Calculate dynamic bottom clearance ensuring content always scrolls above bottom tab navigation
  const safeBottomPadding = Math.max(insets.bottom, 8) + (theme.spacing.bottomNavClearance || 88);

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingHorizontal: theme.spacing.screenHorizontal,
          paddingBottom: safeBottomPadding,
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      nestedScrollEnabled={true}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.fixedContent,
        {
          paddingHorizontal: theme.spacing.screenHorizontal,
          paddingBottom: safeBottomPadding,
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
        barStyle={theme.isNight ? 'light-content' : 'dark-content'}
        backgroundColor={Platform.OS === 'android' ? bg : undefined}
      />
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
