import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  useWindowDimensions,
  Platform,
} from 'react-native';

export type StageSize = 'sm' | 'md' | 'lg' | 'hero' | number;

export interface CharacterStageProps {
  size?: StageSize;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export const CharacterStage: React.FC<CharacterStageProps> = ({
  size,
  children,
  style,
  testID = 'character-stage',
}) => {
  const { width } = useWindowDimensions();

  // Compute responsive default stage dimension based on device viewport
  const responsiveDimension = React.useMemo(() => {
    if (typeof size === 'number') return size;
    if (size === 'sm') return 56;
    if (size === 'md') return 88;
    if (size === 'lg') return 140;
    if (size === 'hero') return 200;

    // Viewport-based responsive sizing:
    // Small phone: 160-190px (width < 380)
    // Large phone: 180-210px (380 <= width < 600)
    // Tablet: 190-230px (600 <= width < 1024)
    // Desktop: 200-260px (width >= 1024)
    if (width < 380) return 175;
    if (width < 600) return 195;
    if (width < 1024) return 220;
    return 240;
  }, [size, width]);

  return (
    <View
      testID={testID}
      style={[
        styles.stage,
        {
          width: responsiveDimension,
          height: responsiveDimension,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  stage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        userSelect: 'none',
      },
      default: {},
    }),
  },
});
