import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { WeatherIcon } from '../icons/WeatherIcon';
import { useTheme } from '../../design';
import { HourlyForecastItem } from '../../services/weather/canonicalModel';
import { audioManager } from '../../services/audio/audioManager';
import { hapticManager } from '../../services/haptics/hapticManager';

export interface HourlyConditionsProps {
  hourly: HourlyForecastItem[];
  selectedHourIndex: number;
  onSelectHour: (index: number) => void;
  sunrise?: string;
  sunset?: string;
}

export const HourlyConditions: React.FC<HourlyConditionsProps> = ({
  hourly,
  selectedHourIndex,
  onSelectHour,
  sunrise,
  sunset,
}) => {
  const theme = useTheme();

  const handleSelect = (idx: number) => {
    audioManager.play('selection');
    hapticManager.impact('light');
    onSelectHour(idx);
  };

  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.heading,
          {
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.weights.bold,
          },
        ]}
      >
        Hourly Conditions
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.carouselContainer}
      >
        {hourly.map((item, index) => {
          const isSelected = selectedHourIndex === index;
          const displayTime = index === 0 ? 'NOW' : item.time;

          return (
            <Pressable
              key={index}
              onPress={() => handleSelect(index)}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${displayTime}, ${Math.round(item.temp)} degrees, ${item.conditionText}`}
              style={({ pressed }) => [
                styles.hourCard,
                {
                  backgroundColor: isSelected
                    ? theme.colors.cardSelectedBg
                    : theme.colors.backgroundCard,
                  borderColor: isSelected ? theme.colors.primary : 'transparent',
                  borderWidth: isSelected ? 2 : 0,
                  shadowColor: isSelected ? theme.colors.primary : '#0F172A',
                  shadowOpacity: isSelected ? 0.18 : 0.05,
                  shadowRadius: isSelected ? 10 : 6,
                  elevation: isSelected ? 5 : 2,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : isSelected ? 1.02 : 1 }],
                },
              ]}
            >
              <Text
                style={[
                  styles.hourTime,
                  {
                    color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                    fontWeight: isSelected
                      ? theme.typography.weights.bold
                      : theme.typography.weights.semibold,
                  },
                ]}
              >
                {displayTime}
              </Text>

              <View style={styles.iconContainer}>
                <WeatherIcon
                  condition={item.conditionText}
                  hour={item.hour}
                  time={item.timestamp || item.time}
                  isNight={item.isNight}
                  sunrise={sunrise}
                  sunset={sunset}
                  size={26}
                />
              </View>

              <Text
                style={[
                  styles.hourTemp,
                  {
                    color: theme.colors.textPrimary,
                    fontWeight: theme.typography.weights.bold,
                  },
                ]}
              >
                {Math.round(item.temp)}°
              </Text>

              {item.rainProb > 0 ? (
                <Text
                  style={[
                    styles.hourRainProb,
                    { color: theme.colors.weatherRain },
                  ]}
                >
                  {item.rainProb}%
                </Text>
              ) : (
                <Text style={styles.hourRainEmpty}> </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 14,
    marginBottom: 4,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  carouselContainer: {
    paddingVertical: 4,
    paddingRight: 20,
    flexDirection: 'row',
    gap: 10,
  },
  hourCard: {
    width: 110,
    height: 160,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 2 },
  },
  hourTime: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  iconContainer: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourTemp: {
    fontSize: 20,
    lineHeight: 26,
  },
  hourRainProb: {
    fontSize: 12,
    fontWeight: '700',
  },
  hourRainEmpty: {
    fontSize: 12,
  },
});
