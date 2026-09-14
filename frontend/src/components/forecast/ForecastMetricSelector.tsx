import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '../common/AppText';
import { useTheme } from '../../design';
import { audioManager } from '../../services/audio/audioManager';
import { hapticManager } from '../../services/haptics/hapticManager';

export type FactorTab = 'rain' | 'temp' | 'wind' | 'uv';

export interface MetricTabItem {
  id: FactorTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const METRIC_TABS: MetricTabItem[] = [
  { id: 'rain', label: 'Rain %', icon: 'rainy-outline' },
  { id: 'temp', label: 'Temp', icon: 'thermometer-outline' },
  { id: 'wind', label: 'Wind', icon: 'speedometer-outline' },
  { id: 'uv', label: 'UV Index', icon: 'sunny-outline' },
];

export interface ForecastMetricSelectorProps {
  selectedFactor: FactorTab;
  onSelectFactor: (factor: FactorTab) => void;
}

export const ForecastMetricSelector: React.FC<ForecastMetricSelectorProps> = ({
  selectedFactor,
  onSelectFactor,
}) => {
  const theme = useTheme();

  const handlePress = (id: FactorTab) => {
    audioManager.play('selection');
    hapticManager.impact('light');
    onSelectFactor(id);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.scrollContent}
      >
        {METRIC_TABS.map((tab) => {
          const isSelected = selectedFactor === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => handlePress(tab.id)}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${tab.label} metric`}
              style={({ pressed }) => [
                styles.tabPill,
                {
                  backgroundColor: isSelected
                    ? (theme.isNight ? theme.colors.cardSelectedBg : theme.colors.surfaceBlue)
                    : theme.colors.backgroundCard,
                  borderColor: isSelected ? theme.colors.primary : 'transparent',
                  borderWidth: isSelected ? 2 : 0,
                  shadowColor: isSelected ? theme.colors.primary : '#0F172A',
                  shadowOpacity: isSelected ? 0.15 : 0.04,
                  shadowRadius: isSelected ? 8 : 6,
                  elevation: isSelected ? 4 : 2,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                    fontSize: theme.typography.sizes.subhead,
                    fontWeight: isSelected
                      ? theme.typography.weights.bold
                      : theme.typography.weights.medium,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingVertical: 2,
    paddingRight: 16,
    flexDirection: 'row',
    gap: 10,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 2 },
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 13,
  },
});
