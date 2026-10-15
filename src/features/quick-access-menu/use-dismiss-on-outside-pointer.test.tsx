import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useDismissOnOutsidePointer } from './use-dismiss-on-outside-pointer';

function Probe({ isActive, onDismiss }: { isActive: boolean; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDismissOnOutsidePointer(ref, onDismiss, isActive);
  return (
    <>
      <button>fora</button>
      <div ref={ref}>
        <button>dentro</button>
      </div>
    </>
  );
}

describe('useDismissOnOutsidePointer', () => {
  it('dismisses on a press outside the element', () => {
    const onDismiss = vi.fn();
    render(<Probe isActive onDismiss={onDismiss} />);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'fora' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('ignores a press inside the element', () => {
    const onDismiss = vi.fn();
    render(<Probe isActive onDismiss={onDismiss} />);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'dentro' }));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('does not listen while inactive, and starts listening when it becomes active', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<Probe isActive={false} onDismiss={onDismiss} />);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'fora' }));
    expect(onDismiss).not.toHaveBeenCalled();
    rerender(<Probe isActive onDismiss={onDismiss} />);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'fora' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('stops listening on unmount and always calls the latest callback', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, unmount } = render(<Probe isActive onDismiss={first} />);
    rerender(<Probe isActive onDismiss={second} />);
    fireEvent.pointerDown(document.body);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    unmount();
    fireEvent.pointerDown(document.body);
    expect(second).toHaveBeenCalledOnce();
  });
});
