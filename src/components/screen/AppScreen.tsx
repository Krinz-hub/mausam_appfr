import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../design';

export interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const AppScreen: React.FC<AppScreenProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  backgroundColor,
  edges = ['top', 'left', 'right'],
}) => {
  const theme = useTheme();
  const bg = backgroundColor || theme.colors.background;

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor: bg }, style]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Platform.OS === 'android' ? bg : undefined}
      />
      {scrollable ? (
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
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
