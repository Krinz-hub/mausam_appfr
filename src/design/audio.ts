export type AudioEventType =
  | 'selection'
  | 'progress'
  | 'success'
  | 'error'
  | 'feedback_positive'
  | 'feedback_negative'
  | 'notification';

export const audioTokens = {
  enabledDefault: true,
  defaultVolume: 0.85,
  events: {
    selection: {
      volume: 0.7,
      description: 'Soft tactile click on card or button selection',
    },
    progress: {
      volume: 0.75,
      description: 'Step transition sound on advancing onboarding',
    },
    success: {
      volume: 0.9,
      description: 'Positive chime upon completion or milestone',
    },
    error: {
      volume: 0.6,
      description: 'Gentle low double-tone on input/network issue',
    },
    feedback_positive: {
      volume: 0.85,
      description: 'Warm confirmation chime on thumbs up',
    },
    feedback_negative: {
      volume: 0.7,
      description: 'Quiet acknowledgement click on thumbs down',
    },
    notification: {
      volume: 0.9,
      description: 'Weather alert sound chime',
    },
  },
};

export type AudioTokens = typeof audioTokens;
