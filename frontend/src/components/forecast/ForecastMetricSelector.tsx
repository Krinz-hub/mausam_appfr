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
            <View key={tab.id} style={styles.tabWrapper}>
              {/* Hard shadow underlay */}
              <View style={styles.tabUnderlay} />

              <Pressable
                onPress={() => handlePress(tab.id)}
                accessible={true}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${tab.label} metric`}
                style={({ pressed }) => [
                  styles.tabButton,
                  {
                    backgroundColor: isSelected ? '#FFB21A' : '#FFFFFF',
                    borderWidth: isSelected ? 2.5 : 2,
                  },
                  (pressed || isSelected) && styles.tabButtonPressed,
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={16}
                  color="#171717"
                  style={styles.tabIcon}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: '#171717',
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                {isSelected && <Text style={styles.activeDot}>●</Text>}
              </Pressable>
            </View>
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
    paddingVertical: 4,
    paddingRight: 16,
    flexDirection: 'row',
  },
  tabWrapper: {
    position: 'relative',
    marginRight: 10,
    paddingRight: 3,
    paddingBottom: 3,
  },
  tabUnderlay: {
    position: 'absolute',
    left: 3,
    top: 3,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderColor: '#171717',
    minHeight: 40,
  },
  tabButtonPressed: {
    transform: [{ translateX: 1.5 }, { translateY: 1.5 }],
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  activeDot: {
    marginLeft: 6,
    color: '#FF5533',
    fontSize: 9,
  },
});
