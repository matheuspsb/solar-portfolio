import { useEffect, useEffectEvent } from 'react';
import type { RefObject } from 'react';
import { getTabTarget } from '../lib/focus-trap';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type ModalFocusOptions = {
  isOpen: boolean;
  containerRef: RefObject<HTMLElement | null>;
  onEscape: () => void;
  getFallbackFocus?: () => HTMLElement | null;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

function isUsableFocusTarget(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement && element.isConnected && element !== document.body;
}

export function useModalFocus({
  isOpen,
  containerRef,
  onEscape,
  getFallbackFocus,
}: ModalFocusOptions): void {
  const escape = useEffectEvent(onEscape);
  const findFallback = useEffectEvent(() => getFallbackFocus?.() ?? null);

  useEffect(() => {
    const container = containerRef.current;
    if (!isOpen || !container) return;

    const origin = document.activeElement;
    container.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        escape();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements(container);
      const activeElement = document.activeElement;
      const target = getTabTarget({
        count: focusable.length,
        activeIndex: focusable.findIndex((element) => element === activeElement),
        isShift: event.shiftKey,
      });
      if (target.action === 'native') return;
      event.preventDefault();
      if (target.action === 'focus') focusable[target.index]?.focus();
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && !container.contains(event.target)) container.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      const returnTarget = isUsableFocusTarget(origin) ? origin : findFallback();
      returnTarget?.focus();
    };
  }, [isOpen, containerRef]);
}
