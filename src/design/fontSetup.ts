import React from 'react';
import * as ReactNative from 'react-native';
import { StyleSheet, Platform, TextStyle } from 'react-native';

import { getComfortaaFontFamily } from './typography';

/**
 * Universal font family resolver for Comfortaa.
 * On Android, custom fonts must map directly to the weight-specific font variant name
 * (e.g. Comfortaa_700Bold) and clear fontWeight, otherwise Android fails to synthesize bold
 * and silently falls back to system Roboto.
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

  return [
    style,
    {
      fontFamily: family,
    },
  ];
}

// Keep references to original primitives
const OriginalText = ReactNative.Text;
const OriginalTextInput = ReactNative.TextInput;

// ForwardRef patched components using React.createElement (pure TS, no JSX compilation dependency)
export const PatchedText = React.forwardRef<any, any>((props, ref) => {
  const customStyle = resolveComfortaaStyle(props?.style);
  return React.createElement(OriginalText, {
    ...props,
    ref,
    style: customStyle,
  });
});
(PatchedText as any).displayName = 'Text';

export const PatchedTextInput = React.forwardRef<any, any>((props, ref) => {
  const customStyle = resolveComfortaaStyle(props?.style);
  return React.createElement(OriginalTextInput, {
    ...props,
    ref,
    style: customStyle,
  });
});
(PatchedTextInput as any).displayName = 'TextInput';

// Patch react-native named export getters if configurable
try {
  Object.defineProperty(ReactNative, 'Text', {
    get() {
      return PatchedText;
    },
    configurable: true,
    enumerable: true,
  });

  Object.defineProperty(ReactNative, 'TextInput', {
    get() {
      return PatchedTextInput;
    },
    configurable: true,
    enumerable: true,
  });
} catch {}

// Patch Text.render if present
try {
  if (OriginalText && typeof (OriginalText as any).render === 'function') {
    const origRender = (OriginalText as any).render;
    (OriginalText as any).render = function (props: any, ref: any) {
      return origRender({ ...props, style: resolveComfortaaStyle(props?.style) }, ref);
    };
  }
} catch {}

// Patch TextInput.render if present
try {
  if (OriginalTextInput && typeof (OriginalTextInput as any).render === 'function') {
    const origInputRender = (OriginalTextInput as any).render;
    (OriginalTextInput as any).render = function (props: any, ref: any) {
      return origInputRender({ ...props, style: resolveComfortaaStyle(props?.style) }, ref);
    };
  }
} catch {}

// DefaultProps fallback for older environments
try {
  if ((OriginalText as any).defaultProps == null) {
    (OriginalText as any).defaultProps = {};
  }
  (OriginalText as any).defaultProps.style = [
    { fontFamily: Platform.OS === 'android' ? 'Comfortaa_400Regular' : 'Comfortaa' },
    (OriginalText as any).defaultProps.style,
  ];

  if ((OriginalTextInput as any).defaultProps == null) {
    (OriginalTextInput as any).defaultProps = {};
  }
  (OriginalTextInput as any).defaultProps.style = [
    { fontFamily: Platform.OS === 'android' ? 'Comfortaa_400Regular' : 'Comfortaa' },
    (OriginalTextInput as any).defaultProps.style,
  ];
} catch {}

// Web font injection
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const STYLE_ID = 'comfortaa-font-global';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap');

      html, body, #root, [class*="css-text-"], [class*="r-"], [class*="css-"], div, span, p, a, button, input, textarea, select, * {
        font-family: 'Comfortaa', cursive, sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  }
}
