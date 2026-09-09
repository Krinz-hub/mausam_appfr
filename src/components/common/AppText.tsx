import React from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  TextProps,
  TextInputProps,
  StyleSheet,
  Platform,
  TextStyle,
} from 'react-native';

import { getComfortaaFontFamily } from '../../design/typography';

/**
 * Normalizes text style to use Comfortaa with platform-safe font weights.
 * On Android, custom fonts must map directly to the weight-specific font variant
 * and fontWeight must be undefined to avoid silent fallback to system Roboto.
 */
export function resolveComfortaaStyle(style: any): any {
  if (!style) {
    return {
      fontFamily: Platform.OS === 'android' ? 'Comfortaa_400Regular' : 'Comfortaa',
    };
  }

  const flat = StyleSheet.flatten(style) || {};
  const weight = flat.fontWeight;
  const family = getComfortaaFontFamily(weight);

  if (Platform.OS === 'android') {
    return [
      style,
      {
        fontFamily: family,
        fontWeight: undefined,
      },
    ];
  }

  if (Platform.OS === 'web') {
    return [
      { fontFamily: "'Comfortaa', cursive, sans-serif" },
      style,
      { fontFamily: "'Comfortaa', cursive, sans-serif" },
    ];
  }

  // iOS
  return [
    style,
    {
      fontFamily: family,
    },
  ];
}

/**
 * Universal Text component preconfigured with the Comfortaa Google font.
 */
export const AppText = React.forwardRef<RNText, TextProps>((props, ref) => {
  return <RNText {...props} ref={ref} style={resolveComfortaaStyle(props.style)} />;
});

AppText.displayName = 'AppText';

/**
 * Universal TextInput component preconfigured with the Comfortaa Google font.
 */
export const AppTextInput = React.forwardRef<RNTextInput, TextInputProps>((props, ref) => {
  return <RNTextInput {...props} ref={ref} style={resolveComfortaaStyle(props.style)} />;
});

AppTextInput.displayName = 'AppTextInput';

export { AppText as Text, AppTextInput as TextInput };
export default AppText;
