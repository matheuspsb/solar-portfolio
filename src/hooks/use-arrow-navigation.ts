import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { getAdjacentId } from '@/lib/circular-navigation';
import type { NavigationDirection } from '@/lib/circular-navigation';

const directionByKey: Partial<Record<string, NavigationDirection>> = {
  ArrowRight: 'next',
  ArrowDown: 'next',
  ArrowLeft: 'previous',
  ArrowUp: 'previous',
};

export type ArrowNavigation = {
  registerItem: (id: string) => (element: HTMLElement | null) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>, currentId: string) => void;
};

/** Moves DOM focus between registered items with the arrow keys, wrapping at the ends. */
export function useArrowNavigation(ids: readonly string[]): ArrowNavigation {
  const elementsById = useRef(new Map<string, HTMLElement>());

  const registerItem = (id: string) => (element: HTMLElement | null) => {
    if (element) elementsById.current.set(id, element);
    else elementsById.current.delete(id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, currentId: string) => {
    const direction = directionByKey[event.key];
    if (!direction) return;
    event.preventDefault();
    const nextId = getAdjacentId(ids, currentId, direction);
    if (nextId !== null) elementsById.current.get(nextId)?.focus();
  };

  return { registerItem, handleKeyDown };
}
