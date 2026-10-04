import { describe, expect, it } from 'vitest';
import { getPanelViewOffsetPixels } from './panel-offset';

const base = { viewportWidth: 1280, panelWidthPixels: 448, isPanelOpen: true };

describe('getPanelViewOffsetPixels', () => {
  it('shifts by half the panel width so the Sun centers in the free area', () => {
    expect(getPanelViewOffsetPixels(base)).toBe(224);
  });

  it('does not shift when the panel is closed', () => {
    expect(getPanelViewOffsetPixels({ ...base, isPanelOpen: false })).toBe(0);
  });

  it('does not shift on narrow screens where the panel covers everything', () => {
    expect(getPanelViewOffsetPixels({ ...base, viewportWidth: 375 })).toBe(0);
  });

  it('does not shift when the panel is as wide as the viewport or wider', () => {
    expect(getPanelViewOffsetPixels({ ...base, viewportWidth: 700, panelWidthPixels: 700 })).toBe(
      0,
    );
    expect(getPanelViewOffsetPixels({ ...base, viewportWidth: 700, panelWidthPixels: 900 })).toBe(
      0,
    );
  });

  it.each([0, -10, Number.NaN, Number.POSITIVE_INFINITY])(
    'does not shift for an invalid viewport width %s',
    (viewportWidth) => {
      expect(getPanelViewOffsetPixels({ ...base, viewportWidth })).toBe(0);
    },
  );

  it.each([0, -10, Number.NaN])(
    'does not shift for an invalid panel width %s',
    (panelWidthPixels) => {
      expect(getPanelViewOffsetPixels({ ...base, panelWidthPixels })).toBe(0);
    },
  );
});
