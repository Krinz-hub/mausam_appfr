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
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionDot}>●</Text>
        <Text
          style={[
            styles.heading,
            { color: theme.isNight ? '#FFFDF7' : '#171717' },
          ]}
        >
          HOURLY CONDITIONS
        </Text>
      </View>

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
            <View key={index} style={styles.cardWrapper}>
              <View
                style={[
                  styles.cardUnderlay,
                  { backgroundColor: theme.isNight ? '#000000' : '#171717' },
                ]}
              />

              <Pressable
                onPress={() => handleSelect(index)}
                accessible={true}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${displayTime}, ${Math.round(item.temp)} degrees, ${item.conditionText}`}
                style={({ pressed }) => [
                  styles.hourCard,
                  {
                    backgroundColor: isSelected
                      ? '#FFB21A'
                      : theme.isNight
                      ? '#242424'
                      : '#FFFFFF',
                    borderColor:
                      isSelected || !theme.isNight ? '#171717' : '#3A3A3A',
                  },
                  pressed && styles.cardPressed,
                ]}
              >
                <Text
                  style={[
                    styles.hourTime,
                    {
                      fontWeight: isSelected ? '800' : '700',
                      color: isSelected
                        ? '#171717'
                        : theme.isNight
                        ? '#E8E8E8'
                        : '#171717',
                    },
                  ]}
                >
                  {displayTime}
                </Text>

                <View style={styles.iconBox}>
                  <WeatherIcon
                    condition={item.conditionText}
                    hour={item.hour}
                    time={item.timestamp || item.time}
                    isNight={item.isNight}
                    sunrise={sunrise}
                    sunset={sunset}
                    size={22}
                  />
                </View>

                <Text
                  style={[
                    styles.hourTemp,
                    {
                      color: isSelected
                        ? '#171717'
                        : theme.isNight
                        ? '#FFFDF7'
                        : '#171717',
                    },
                  ]}
                >
                  {Math.round(item.temp)}°
                </Text>

                {item.rainProb > 0 ? (
                  <View
                    style={[
                      styles.rainBadge,
                      theme.isNight && {
                        backgroundColor: '#1F2A38',
                        borderColor: '#3A3A3A',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rainText,
                        theme.isNight && { color: '#A8C7FF' },
                      ]}
                    >
                      {item.rainProb}%
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyBadgeSpacer} />
                )}
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionDot: {
    color: '#FF5533',
    fontSize: 10,
    marginRight: 6,
  },
  heading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: 0.8,
  },
  carouselContainer: {
    paddingVertical: 6,
    paddingRight: 24,
    flexDirection: 'row',
  },
  cardWrapper: {
    position: 'relative',
    marginRight: 10,
    paddingRight: 3,
    paddingBottom: 3,
  },
  cardUnderlay: {
    position: 'absolute',
    left: 3,
    top: 3,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderRadius: 10,
  },
  hourCard: {
    width: 72,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderColor: '#171717',
    minHeight: 114,
  },
  cardPressed: {
    transform: [{ translateX: 1.5 }, { translateY: 1.5 }],
  },
  hourTime: {
    fontSize: 12,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  iconBox: {
    marginVertical: 4,
  },
  hourTemp: {
    fontSize: 16,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: -0.5,
  },
  rainBadge: {
    backgroundColor: '#EBF3FF',
    borderWidth: 1,
    borderColor: '#171717',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 4,
  },
  rainText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#171717',
  },
  emptyBadgeSpacer: {
    height: 16,
    marginTop: 4,
  },
});
