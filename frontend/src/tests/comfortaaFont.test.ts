import test from 'node:test';
import assert from 'node:assert/strict';
import { getComfortaaFontFamily, typography } from '../design/typography';

test('Comfortaa Font - Weight mapping assigns correct variant', () => {
  assert.strictEqual(getComfortaaFontFamily('bold'), 'Comfortaa_700Bold');
  assert.strictEqual(getComfortaaFontFamily('heavy'), 'Comfortaa_700Bold');
  assert.strictEqual(getComfortaaFontFamily('700'), 'Comfortaa_700Bold');
  assert.strictEqual(getComfortaaFontFamily('800'), 'Comfortaa_700Bold');
  assert.strictEqual(getComfortaaFontFamily('900'), 'Comfortaa_700Bold');
  assert.strictEqual(getComfortaaFontFamily('600'), 'Comfortaa_600SemiBold');
  assert.strictEqual(getComfortaaFontFamily('semibold'), 'Comfortaa_600SemiBold');
  assert.strictEqual(getComfortaaFontFamily('500'), 'Comfortaa_500Medium');
  assert.strictEqual(getComfortaaFontFamily('medium'), 'Comfortaa_500Medium');
  assert.strictEqual(getComfortaaFontFamily('400'), 'Comfortaa_400Regular');
  assert.strictEqual(getComfortaaFontFamily('normal'), 'Comfortaa_400Regular');
  assert.strictEqual(getComfortaaFontFamily('300'), 'Comfortaa_300Light');
  assert.strictEqual(getComfortaaFontFamily('100'), 'Comfortaa_300Light');
  assert.strictEqual(getComfortaaFontFamily('light'), 'Comfortaa_300Light');
  assert.strictEqual(getComfortaaFontFamily(undefined), 'Comfortaa_400Regular');
});

test('Comfortaa Font - Design system tokens expose registered font aliases', () => {
  assert.strictEqual(typography.fontFamily, 'Comfortaa');
  assert.strictEqual(typography.fontFamilies.bold, 'Comfortaa_700Bold');
  assert.strictEqual(typography.fontFamilies.semibold, 'Comfortaa_600SemiBold');
  assert.strictEqual(typography.fontFamilies.medium, 'Comfortaa_500Medium');
  assert.strictEqual(typography.fontFamilies.regular, 'Comfortaa_400Regular');
  assert.strictEqual(typography.fontFamilies.light, 'Comfortaa_300Light');
});
