import { useRef, useState } from 'react';
import type { FocusEvent } from 'react';
import { flushSync } from 'react-dom';
import { useArrowNavigation } from '@/hooks/use-arrow-navigation';
import { useDismissOnOutsidePointer } from './use-dismiss-on-outside-pointer';

export function useQuickAccessMenu(itemIds: readonly string[]) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isPressingMenuRef = useRef(false);
  const { registerItem, handleKeyDown, getItem } = useArrowNavigation(itemIds);

  useDismissOnOutsidePointer(containerRef, () => setIsOpen(false), isOpen);

  const open = () => {
    flushSync(() => setIsOpen(true));
    const firstItemId = itemIds[0];
    if (firstItemId !== undefined) getItem(firstItemId)?.focus();
  };

  const closeAndRestoreFocus = () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  };

  const closeWhenFocusLeaves = (event: FocusEvent<HTMLElement>) => {
    const nextFocus = event.relatedTarget;
    if (nextFocus === null && isPressingMenuRef.current) return;
    if (nextFocus instanceof Node && event.currentTarget.contains(nextFocus)) return;
    setIsOpen(false);
  };

  const menu = {
    isOpen,
    registerItem,
    handleKeyDown,
    toggle: () => (isOpen ? setIsOpen(false) : open()),
    closeAndRestoreFocus,
    closeWhenFocusLeaves,
    markPressStart: () => {
      isPressingMenuRef.current = true;
    },
    markPressEnd: () => {
      isPressingMenuRef.current = false;
    },
  };

  return { containerRef, toggleRef, menu };
}
