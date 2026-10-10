import { describe, expect, it } from 'vitest';
import { EDGE_MARGIN, TARGET_CARD_SIZE, getTelemetryLayout } from './telemetry-layout';

const VIEWPORT = { width: 1280, height: 800 };

describe('getTelemetryLayout', () => {
  it('mirrors to the right when the card would leave through the left edge', () => {
    const layout = getTelemetryLayout({
      frame: { x: 100, y: 400, radius: 50 },
      anchor: 'top-left',
      viewport: VIEWPORT,
    })!;
    expect(layout.end.x).toBeGreaterThan(100);
    expect(layout.card.align).toBe('right');
    expect(layout.card.left + TARGET_CARD_SIZE.width).toBe(layout.end.x);
    expect(layout.card.left).toBeGreaterThanOrEqual(EDGE_MARGIN);
  });

  it('flips downward when the line would leave through the top edge', () => {
    const layout = getTelemetryLayout({
      frame: { x: 600, y: 60, radius: 40 },
      anchor: 'top-left',
      viewport: VIEWPORT,
    })!;
    expect(layout.origin.y).toBeGreaterThan(60);
    expect(layout.elbow.y).toBeGreaterThanOrEqual(EDGE_MARGIN);
  });

  it('flips upward when the card would leave through the bottom edge', () => {
    const layout = getTelemetryLayout({
      frame: { x: 600, y: 780, radius: 32 },
      anchor: 'bottom-left',
      viewport: VIEWPORT,
    })!;
    expect(layout.origin.y).toBeLessThan(780);
    expect(layout.card.top + TARGET_CARD_SIZE.height).toBeLessThanOrEqual(
      VIEWPORT.height - EDGE_MARGIN,
    );
  });

  it('flips both ways in a corner', () => {
    const layout = getTelemetryLayout({
      frame: { x: 60, y: 50, radius: 30 },
      anchor: 'top-left',
      viewport: VIEWPORT,
    })!;
    expect(layout.origin.x).toBeGreaterThan(60);
    expect(layout.origin.y).toBeGreaterThan(50);
  });

  it('keeps the whole drawing inside the screen whenever there is a way to', () => {
    const frames = [
      { x: 40, y: 40, radius: 30 },
      { x: 1240, y: 40, radius: 30 },
      { x: 40, y: 760, radius: 30 },
      { x: 1240, y: 760, radius: 30 },
      { x: 640, y: 400, radius: 110 },
    ];
    for (const frame of frames) {
      for (const anchor of ['top-left', 'bottom-left'] as const) {
        const layout = getTelemetryLayout({ frame, anchor, viewport: VIEWPORT })!;
        const points = [layout.origin, layout.elbow, layout.end];
        for (const point of points) {
          expect(point.x).toBeGreaterThanOrEqual(0);
          expect(point.x).toBeLessThanOrEqual(VIEWPORT.width);
          expect(point.y).toBeGreaterThanOrEqual(0);
          expect(point.y).toBeLessThanOrEqual(VIEWPORT.height);
        }
        expect(layout.card.left).toBeGreaterThanOrEqual(0);
        expect(layout.card.left + TARGET_CARD_SIZE.width).toBeLessThanOrEqual(VIEWPORT.width);
      }
    }
  });

  it('falls back to the preferred side when no side fits (a tiny screen)', () => {
    const layout = getTelemetryLayout({
      frame: { x: 50, y: 50, radius: 20 },
      anchor: 'top-left',
      viewport: { width: 100, height: 100 },
    })!;
    expect(layout.origin.x).toBeLessThan(50);
    expect(layout.origin.y).toBeLessThan(50);
  });

  it.each([
    { x: Number.NaN, y: 10, radius: 10 },
    { x: 10, y: Number.POSITIVE_INFINITY, radius: 10 },
    { x: 10, y: 10, radius: -5 },
  ])('has no layout for the invalid frame %j', (frame) => {
    expect(getTelemetryLayout({ frame, anchor: 'top-left', viewport: VIEWPORT })).toBeNull();
  });

  it.each([
    { width: 0, height: 800 },
    { width: 1280, height: Number.NaN },
  ])('has no layout for the unmeasured viewport %j', (viewport) => {
    expect(
      getTelemetryLayout({ frame: { x: 10, y: 10, radius: 10 }, anchor: 'top-left', viewport }),
    ).toBeNull();
  });
});
