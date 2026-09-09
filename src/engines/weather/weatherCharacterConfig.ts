import {
  CharacterState,
  CharacterMood,
  HapticIntensity,
  TimeOfDay,
} from './weatherCharacterTypes';

export interface CharacterRuleConfig {
  state: CharacterState;
  priority: number;
  mood: CharacterMood;
  haptic: HapticIntensity;
  accessibilityLabel: string;
  defaultMessage: string;
  defaultTip: string;
  timeOfDayMessages?: Partial<Record<TimeOfDay, string>>;
  timeOfDayTips?: Partial<Record<TimeOfDay, string>>;
}

export const WEATHER_CHARACTER_CONFIGS: Record<CharacterState, CharacterRuleConfig> = {
  lightning: {
    state: 'lightning',
    priority: 100,
    mood: 'surprised',
    haptic: 'heavy',
    accessibilityLabel: 'Weather character reacting to lightning',
    defaultMessage: 'Lightning detected. Take shelter.',
    defaultTip: 'Move indoors immediately and avoid exposed areas.',
    timeOfDayMessages: {
      night: 'Lightning strikes in the dark. Please stay indoors and safe!',
      evening: 'Lightning detected this evening. Head inside right away.',
    },
  },
  thunderstorm: {
    state: 'thunderstorm',
    priority: 95,
    mood: 'angry',
    haptic: 'heavy',
    accessibilityLabel: 'Weather character reacting to thunderstorm',
    defaultMessage: 'Storm alert! Best to stay somewhere safe.',
    defaultTip: 'Move indoors and avoid exposed areas.',
    timeOfDayMessages: {
      night: 'Stormy thunder tonight. Cozy up safely inside!',
      evening: 'Thunderstorms rolling in this evening. Keep under cover.',
    },
  },
  hail: {
    state: 'hail',
    priority: 94,
    mood: 'surprised',
    haptic: 'medium',
    accessibilityLabel: 'Weather character reacting to hail',
    defaultMessage: 'Whoa, is that hail falling?!',
    defaultTip: 'Seek shelter immediately to protect yourself and your belongings.',
  },
  bad_air_quality: {
    state: 'bad_air_quality',
    priority: 90,
    mood: 'concerned',
    haptic: 'medium',
    accessibilityLabel: 'Weather character reacting to bad air quality',
    defaultMessage: "The air isn't great today.",
    defaultTip: 'Consider limiting prolonged outdoor exposure. A mask may help when appropriate.',
    timeOfDayMessages: {
      morning: 'Air quality is poor this morning. Keep outdoor exercise light.',
      evening: 'Hazy air this evening. Better to spend time indoors.',
      night: 'Air quality remains low tonight. Keep windows closed.',
    },
  },
  extreme_heat: {
    state: 'extreme_heat',
    priority: 85,
    mood: 'overheated',
    haptic: 'medium',
    accessibilityLabel: 'Weather character reacting to extreme heat',
    defaultMessage: "That's seriously hot!",
    defaultTip: 'Stay hydrated, seek shade, and avoid prolonged direct sun.',
    timeOfDayMessages: {
      afternoon: "Blazing afternoon heat! Drink plenty of water and stay cool.",
      evening: 'Still very hot this evening. Stay cool and hydrated.',
    },
    timeOfDayTips: {
      afternoon: 'Peak sun intensity—rest in air-conditioned spaces if possible.',
    },
  },
  extreme_cold: {
    state: 'extreme_cold',
    priority: 84,
    mood: 'freezing',
    haptic: 'medium',
    accessibilityLabel: 'Weather character reacting to cold weather',
    defaultMessage: "Bundle up. It's chilly out there.",
    defaultTip: 'Wear warm layers and stay dry to keep comfortable.',
    timeOfDayMessages: {
      morning: 'Bracing chill this morning. Zip up and grab a warm drink!',
      night: 'Freezing cold tonight. Extra blankets recommended!',
    },
  },
  heavy_rain: {
    state: 'heavy_rain',
    priority: 80,
    mood: 'sad',
    haptic: 'medium',
    accessibilityLabel: 'Weather character reacting to heavy rain',
    defaultMessage: "Whoa, it's coming down hard!",
    defaultTip: 'Carry rain protection and be cautious while traveling.',
    timeOfDayMessages: {
      night: 'Heavy rain pounding down tonight. Safe travels if on the road.',
    },
  },
  snow: {
    state: 'snow',
    priority: 78,
    mood: 'freezing',
    haptic: 'light',
    accessibilityLabel: 'Weather character reacting to snow',
    defaultMessage: "Bundle up. It's snowing!",
    defaultTip: 'Watch your step on slippery surfaces and keep warm.',
    timeOfDayMessages: {
      night: 'Quiet snow falling tonight. Stay warm and rested.',
    },
  },
  strong_wind: {
    state: 'strong_wind',
    priority: 75,
    mood: 'cautious',
    haptic: 'medium',
    accessibilityLabel: 'Weather character reacting to strong wind',
    defaultMessage: 'Hold on to your hat! Very strong winds today.',
    defaultTip: 'Be careful around exposed areas and loose objects.',
  },
  windy: {
    state: 'windy',
    priority: 70,
    mood: 'breezy',
    haptic: 'light',
    accessibilityLabel: 'Weather character reacting to windy conditions',
    defaultMessage: "Whoa! It's really windy today.",
    defaultTip: 'Secure light outdoor items and watch for sudden gusts.',
  },
  fog: {
    state: 'fog',
    priority: 65,
    mood: 'sleepy',
    haptic: 'light',
    accessibilityLabel: 'Weather character reacting to fog',
    defaultMessage: 'Visibility is low. Take it slow.',
    defaultTip: 'Visibility is reduced, so take extra care while traveling.',
    timeOfDayMessages: {
      night: 'Thick night fog. Visibility is low, drive extra carefully.',
      dawn: 'Misty dawn. Take your time as the day wakes up.',
      morning: 'Morning fog lingering. Headlights on for your commute!',
    },
  },
  stormy_rain: {
    state: 'stormy_rain',
    priority: 60,
    mood: 'concerned',
    haptic: 'medium',
    accessibilityLabel: 'Weather character reacting to stormy rain',
    defaultMessage: 'Stormy rain outside. Stay cozy indoors if you can.',
    defaultTip: 'Wet roads and blustery conditions—take extra care.',
  },
  rainbow: {
    state: 'rainbow',
    priority: 55,
    mood: 'happy',
    haptic: 'light',
    accessibilityLabel: 'Weather character celebrating a rainbow',
    defaultMessage: 'Look up! A rainbow after the shower!',
    defaultTip: 'Enjoy the fresh post-rain air and clear skies.',
  },
  rain: {
    state: 'rain',
    priority: 50,
    mood: 'concerned',
    haptic: 'light',
    accessibilityLabel: 'Weather character with umbrella for rain',
    defaultMessage: 'Looks like rain. Grab your umbrella!',
    defaultTip: 'Keep an umbrella handy and plan for wet commutes.',
    timeOfDayMessages: {
      evening: 'Rainy evening ahead. Grab an umbrella on your way home!',
      night: 'Pitter-patter of rain tonight. Perfect sound to sleep to.',
    },
  },
  overcast: {
    state: 'overcast',
    priority: 40,
    mood: 'neutral',
    haptic: 'light',
    accessibilityLabel: 'Weather character under overcast skies',
    defaultMessage: 'Grey and overcast today, but dry.',
    defaultTip: 'Good day for indoor focus or a calm walk.',
  },
  cloudy: {
    state: 'cloudy',
    priority: 30,
    mood: 'happy',
    haptic: 'light',
    accessibilityLabel: 'Weather character enjoying cloudy weather',
    defaultMessage: 'A little cloudy, but still looking good.',
    defaultTip: 'Comfortable daylight with pleasant cloud cover.',
    timeOfDayMessages: {
      morning: 'Partly cloudy morning. Great weather to kick off your day!',
      night: 'Clouds drifting across the night sky. Rest well!',
    },
  },
  bright_sun: {
    state: 'bright_sun',
    priority: 20,
    mood: 'cool',
    haptic: 'light',
    accessibilityLabel: 'Weather character wearing sunglasses for bright sun',
    defaultMessage: "Whoa, it's bright out!",
    defaultTip: 'Consider shade, sunscreen, and sunglasses.',
    timeOfDayMessages: {
      afternoon: 'Bright afternoon sun! Keep your shades handy.',
    },
  },
  sunny: {
    state: 'sunny',
    priority: 20,
    mood: 'happy',
    haptic: 'light',
    accessibilityLabel: 'Weather character enjoying sunny day',
    defaultMessage: 'Looks like a beautiful day!',
    defaultTip: 'Great conditions to get outside and enjoy the sunshine.',
    timeOfDayMessages: {
      dawn: 'The sun is rising! Fresh start to the day.',
      morning: 'Morning sunshine! A great start to your day.',
      afternoon: 'Lovely sunny afternoon out there.',
      evening: 'Golden evening light as the day winds down.',
      night: 'Clear starry skies tonight. Sleep peacefully!',
    },
    timeOfDayTips: {
      night: 'Clear skies often mean cooler overnight temperatures.',
    },
  },
};
