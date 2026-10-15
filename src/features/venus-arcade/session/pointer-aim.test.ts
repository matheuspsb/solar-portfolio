import { describe, expect, it } from 'vitest';
import { aimFromPointer, startDrag } from './pointer-aim';

describe('startDrag', () => {
  it('remembers where the drone is relative to the finger', () => {
    expect(startDrag({ x: 300, y: 500 }, { x: 250, y: 560 })).toEqual({ x: 50, y: -60 });
  });
});

describe('aimFromPointer', () => {
  it('sends the drone straight to the mouse', () => {
    expect(aimFromPointer({ pointerType: 'mouse', point: { x: 10, y: 20 }, drag: null })).toEqual({
      x: 10,
      y: 20,
    });
  });

  it('keeps the offset of the first touch so the finger does not cover the drone', () => {
    const aim = aimFromPointer({
      pointerType: 'touch',
      point: { x: 100, y: 200 },
      drag: { x: 50, y: -60 },
    });
    expect(aim).toEqual({ x: 150, y: 140 });
  });

  it.each(['touch', 'pen'])('ignores a %s that did not start a drag', (pointerType) => {
    expect(aimFromPointer({ pointerType, point: { x: 1, y: 1 }, drag: null })).toBeNull();
  });
});
