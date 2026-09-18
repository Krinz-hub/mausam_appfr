import test from 'node:test';
import assert from 'node:assert/strict';
import { spacing } from '../design/spacing';
import { typography } from '../design/typography';
import { cardTokens } from '../design/cards';
import { dayColors, nightColors } from '../design/colors';

test('Design System Tokens - Spacing scale & semantic tokens', () => {
  assert.strictEqual(spacing.xs, 4);
  assert.strictEqual(spacing.sm, 8);
  assert.strictEqual(spacing.md, 16);
  assert.strictEqual(spacing.lg, 24);
  assert.strictEqual(spacing.xl, 32);
  assert.strictEqual(spacing.xxl, 40);

  // Semantic layout clearance tokens
  assert.strictEqual(spacing.sectionSpacing, 24);
  assert.strictEqual(spacing.cardPadding, 16);
  assert.strictEqual(spacing.elementSpacing, 8);
  assert.strictEqual(spacing.bottomNavClearance, 88);
});

test('Design System Tokens - Typography 5-tier scale & Comfortaa families', () => {
  assert.ok(typography.display.fontSize >= 32);
  assert.strictEqual(typography.display.fontFamily, 'Comfortaa_700Bold');

  assert.ok(typography.heading.fontSize >= 20);
  assert.strictEqual(typography.heading.fontFamily, 'Comfortaa_700Bold');

  assert.ok(typography.subheading.fontSize >= 16);
  assert.strictEqual(typography.subheading.fontFamily, 'Comfortaa_700Bold');

  assert.ok(typography.body.fontSize >= 14);
  assert.strictEqual(typography.body.fontFamily, 'Comfortaa_500Medium');

  assert.ok(typography.caption.fontSize <= 13);
  assert.strictEqual(typography.caption.fontFamily, 'Comfortaa_500Medium');

  assert.ok(typography.label.fontSize <= 12);
  assert.strictEqual(typography.label.fontFamily, 'Comfortaa_700Bold');
});

test('Design System Tokens - Card tokens specify 2px border and 10px radius', () => {
  assert.strictEqual(cardTokens.borderWidth, 2);
  assert.strictEqual(cardTokens.borderColor, '#171717');
  assert.strictEqual(cardTokens.borderRadius, 10);
  assert.strictEqual(cardTokens.underlayColor, '#171717');
  assert.strictEqual(cardTokens.shadowOffset, 4);
});

test('Design System Tokens - High contrast text color tokens guarantee WCAG AA', () => {
  // Day palette
  assert.strictEqual(dayColors.textPrimary, '#171717');
  assert.strictEqual(dayColors.textSecondary, '#2E2E2E');
  assert.strictEqual(dayColors.textMuted, '#525252');

  // Night palette
  assert.strictEqual(nightColors.textPrimary, '#FFFDF7');
  assert.strictEqual(nightColors.textSecondary, '#E8E8E8');
  assert.strictEqual(nightColors.textMuted, '#BFBFBF');
});
