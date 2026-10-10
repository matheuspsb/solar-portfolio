import type { ThreeEvent } from '@react-three/fiber';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useBodyPointerHandlers } from './use-body-pointer-handlers';

type PointerKind = 'mouse' | 'touch' | 'pen';

function fakeEvent(options: { pointerType?: PointerKind; delta?: number } = {}) {
  const { pointerType = 'mouse', delta = 0 } = options;
  return {
    delta,
    stopPropagation: vi.fn(),
    nativeEvent: { pointerType },
  } as unknown as ThreeEvent<PointerEvent> & ThreeEvent<MouseEvent>;
}

function setup(isArmed = false) {
  const callbacks = { onPointerOver: vi.fn(), onPointerOut: vi.fn(), onSelect: vi.fn() };
  const { result } = renderHook(() => useBodyPointerHandlers({ ...callbacks, isArmed }));
  return { handlers: result.current, ...callbacks };
}

describe('useBodyPointerHandlers', () => {
  it('ignores a click that was really a drag of the camera', () => {
    const { handlers, onSelect } = setup();
    handlers.handleClick(fakeEvent({ delta: 40 }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  describe('touch, which has no hover', () => {
    it('the first tap only shows the target, it does not open the body', () => {
      const { handlers, onPointerOver, onSelect } = setup(false);
      handlers.handleClick(fakeEvent({ pointerType: 'touch' }));
      expect(onPointerOver).toHaveBeenCalledOnce();
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('the second tap, on the target that is already showing, opens the body', () => {
      const { handlers, onPointerOver, onSelect } = setup(true);
      handlers.handleClick(fakeEvent({ pointerType: 'touch' }));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onPointerOver).not.toHaveBeenCalled();
    });

    it('keeps the target showing when the finger lifts (the browser sends a pointer out)', () => {
      const { handlers, onPointerOut } = setup(true);
      handlers.handlePointerOut(fakeEvent({ pointerType: 'touch' }));
      expect(onPointerOut).not.toHaveBeenCalled();
    });
  });

  it('treats a pen like a mouse', () => {
    const { handlers, onSelect } = setup(false);
    handlers.handleClick(fakeEvent({ pointerType: 'pen' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
