// Use case: the scene's camera distance, quality tier and panel shift all derive from the screen
// size, the bodies and the visitor's preferences. Keeping the derivation in one pure function lets
// us test the awkward inputs (empty list, unmeasured viewport, reduced motion) without WebGL.
import { describe, expect, it } from 'vitest';
import { INSTANT_EASING_RATE } from './motion';
import { getSceneSettings } from './scene-settings';

const base = {
  bodyRadii: [2.4],
  viewport: { width: 1280, height: 800 },
  prefersReducedMotion: false,
  isPanelOpen: false,
  panelWidthPixels: 448,
  fieldOfViewDegrees: 50,
  screenFill: 0.55,
  panelShiftSeconds: 0.7,
};

describe('getSceneSettings', () => {
  it('picks the high quality tier for desktop widths and the low one for phones', () => {
    expect(getSceneSettings(base).quality.tier).toBe('high');
    expect(getSceneSettings({ ...base, viewport: { width: 375, height: 700 } }).quality.tier).toBe(
      'low',
    );
  });

  it('backs the camera off on portrait screens', () => {
    const landscape = getSceneSettings(base).cameraDistance;
    const portrait = getSceneSettings({
      ...base,
      viewport: { width: 375, height: 800 },
    }).cameraDistance;
    expect(portrait).toBeGreaterThan(landscape);
  });

  it('frames the largest body', () => {
    const small = getSceneSettings({ ...base, bodyRadii: [1] }).cameraDistance;
    const mixed = getSceneSettings({ ...base, bodyRadii: [1, 3] }).cameraDistance;
    expect(mixed).toBeGreaterThan(small);
  });

  it('still returns a usable distance with no bodies', () => {
    const { cameraDistance } = getSceneSettings({ ...base, bodyRadii: [] });
    expect(Number.isFinite(cameraDistance)).toBe(true);
    expect(cameraDistance).toBeGreaterThan(0);
  });

  it('survives an unmeasured viewport (0 x 0)', () => {
    const settings = getSceneSettings({ ...base, viewport: { width: 0, height: 0 } });
    expect(Number.isFinite(settings.cameraDistance)).toBe(true);
    expect(settings.quality.tier).toBe('low');
    expect(settings.viewOffsetPixels).toBe(0);
  });

  it('shifts the view aside only while the panel is open on wide screens', () => {
    expect(getSceneSettings(base).viewOffsetPixels).toBe(0);
    expect(getSceneSettings({ ...base, isPanelOpen: true }).viewOffsetPixels).toBe(224);
    expect(
      getSceneSettings({ ...base, isPanelOpen: true, viewport: { width: 375, height: 700 } })
        .viewOffsetPixels,
    ).toBe(0);
  });

  it('glides at a finite rate normally and jumps with reduced motion', () => {
    const normal = getSceneSettings(base).viewOffsetEasingRate;
    expect(Number.isFinite(normal)).toBe(true);
    expect(normal).toBeGreaterThan(0);
    expect(getSceneSettings({ ...base, prefersReducedMotion: true }).viewOffsetEasingRate).toBe(
      INSTANT_EASING_RATE,
    );
  });
});
