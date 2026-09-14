import { test } from 'node:test';
import assert from 'node:assert/strict';

test('Swipeable Suggestions - Circular Navigation Forward and Backward', () => {
  const total = 5;

  const navigateNext = (current: number) => (current + 1) % total;
  const navigatePrev = (current: number) => (current - 1 + total) % total;

  // 1. Forward progression (Swipe Left)
  assert.equal(navigateNext(0), 1);
  assert.equal(navigateNext(1), 2);
  assert.equal(navigateNext(2), 3);
  assert.equal(navigateNext(3), 4);
  assert.equal(navigateNext(4), 0); // Wraps back to start

  // 2. Backward progression (Swipe Right)
  assert.equal(navigatePrev(0), 4); // Wraps to end
  assert.equal(navigatePrev(4), 3);
  assert.equal(navigatePrev(3), 2);
  assert.equal(navigatePrev(2), 1);
  assert.equal(navigatePrev(1), 0);
});

test('Swipeable Suggestions - Horizontal Gesture Disambiguation', () => {
  interface SwipeResult {
    direction: 'left' | 'right' | 'none';
  }

  function detectSwipe(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    durationMs: number
  ): SwipeResult {
    const dx = endX - startX;
    const dy = endY - startY;

    // Minimum distance 35px, horizontal dominance ratio 1.2, max 800ms
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.2 && durationMs < 800) {
      return { direction: dx < 0 ? 'left' : 'right' };
    }
    return { direction: 'none' };
  }

  // Pure horizontal swipe left (next)
  assert.deepEqual(detectSwipe(200, 100, 120, 105, 200), { direction: 'left' });

  // Pure horizontal swipe right (prev)
  assert.deepEqual(detectSwipe(100, 100, 180, 95, 220), { direction: 'right' });

  // Vertical scroll (should be ignored so page scrolls smoothly)
  assert.deepEqual(detectSwipe(100, 100, 110, 250, 300), { direction: 'none' });

  // Diagonal movement where vertical is stronger (should be ignored)
  assert.deepEqual(detectSwipe(100, 100, 150, 180, 250), { direction: 'none' });

  // Micro tap without enough distance (should not trigger swipe)
  assert.deepEqual(detectSwipe(100, 100, 115, 102, 100), { direction: 'none' });

  // Extremely slow drag > 800ms
  assert.deepEqual(detectSwipe(100, 100, 300, 100, 950), { direction: 'none' });
});

test('Swipeable Suggestions - Deduplicated Topic Mapping', () => {
  const getTopicForInsight = (title: string, msg: string): string => {
    const combined = `${title} ${msg}`.toLowerCase();
    if (combined.includes('rain') || combined.includes('umbrella') || combined.includes('shower') || combined.includes('downpour')) return 'rain';
    if (combined.includes('uv') || combined.includes('sunscreen') || combined.includes('sunglasses') || combined.includes('spf')) return 'uv';
    if (combined.includes('heat') || combined.includes('warmer') || combined.includes('warm afternoon') || combined.includes('warm day') || combined.includes('hydrate') || combined.includes('hot') || combined.includes('feels like')) return 'heat';
    if (combined.includes('cold') || combined.includes('chilly') || combined.includes('freezing') || combined.includes('layers') || combined.includes('sweater') || combined.includes('scarf') || combined.includes('jacket')) return 'cold';
    if (combined.includes('aqi') || combined.includes('air quality') || combined.includes('pollution') || combined.includes('smog') || combined.includes('mask')) return 'aqi';
    if (combined.includes('wind') || combined.includes('breeze') || combined.includes('gust')) return 'wind';
    if (combined.includes('commute') || combined.includes('traffic') || combined.includes('transit') || combined.includes('roads')) return 'commute';
    if (combined.includes('fitness') || combined.includes('workout') || combined.includes('running') || combined.includes('cycling')) return 'fitness';
    if (combined.includes('storm') || combined.includes('thunder') || combined.includes('lightning')) return 'storm';
    return 'general';
  };

  assert.equal(getTopicForInsight('High UV Alert ☀️', 'Wear SPF 30+ sunscreen'), 'uv');
  assert.equal(getTopicForInsight('Umbrella Advisory ☔', 'Keep rain gear handy'), 'rain');
  assert.equal(getTopicForInsight('Beat The Heat 💧', 'Stay well-hydrated outdoors'), 'heat');
  assert.equal(getTopicForInsight('Crisp Weather 🧣', 'Dress in warm layers'), 'cold');
  assert.equal(getTopicForInsight('Breezy Outlook 💨', 'Winds active at 25 km/h'), 'wind');
  assert.equal(getTopicForInsight('Air Quality Check 🌫️', 'AQI is 95'), 'aqi');
  assert.equal(getTopicForInsight('Morning Commute', 'Roads are clear'), 'commute');
  assert.equal(getTopicForInsight('Running Conditions', 'Optimal workout hour'), 'fitness');
});
