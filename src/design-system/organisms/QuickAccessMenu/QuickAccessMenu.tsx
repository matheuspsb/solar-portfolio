import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import type { FocusEvent } from 'react';
import { useArrowNavigation } from '@/hooks/use-arrow-navigation';
import { Button } from '../../atoms/Button/Button';
import { MenuItem } from '../../molecules/MenuItem/MenuItem';

type QuickAccessMenuProps = {
  items: ReadonlyArray<{ id: string; label: string }>;
  onSelectItem: (id: string) => void;
};

export function QuickAccessMenu({ items, onSelectItem }: QuickAccessMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { registerItem, handleKeyDown, getItem } = useArrowNavigation(items.map((item) => item.id));
  const firstItemId = items[0]?.id;
  const focusFirstItem = useEffectEvent(() => {
    if (firstItemId !== undefined) getItem(firstItemId)?.focus();
  });

  useEffect(() => {
    if (!isOpen) return;
    focusFirstItem();

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [isOpen]);

  if (items.length === 0) return null;

  const closeAndRestoreFocus = () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  };

  const closeWhenFocusLeaves = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocus = event.relatedTarget;
    if (nextFocus instanceof Node && event.currentTarget.contains(nextFocus)) return;
    setIsOpen(false);
  };

  const controlledListId = isOpen ? listId : undefined;

  const selectItem = (id: string) => {
    closeAndRestoreFocus();
    onSelectItem(id);
  };

  return (
    <div
      ref={containerRef}
      className="fixed top-4 right-4 z-(--z-chrome) flex flex-col items-end gap-2"
      onBlur={closeWhenFocusLeaves}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          event.stopPropagation();
          closeAndRestoreFocus();
        }
      }}
    >
      <Button
        ref={toggleRef}
        variant="floating"
        aria-expanded={isOpen}
        aria-controls={controlledListId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        Acesso rápido
      </Button>
      {isOpen && (
        <ul
          id={listId}
          className="m-0 flex min-w-48 list-none flex-col gap-1 rounded-lg border border-border bg-surface p-2 shadow-panel backdrop-blur-md"
        >
          {items.map((item) => (
            <li key={item.id}>
              <MenuItem
                ref={registerItem(item.id)}
                onKeyDown={(event) => handleKeyDown(event, item.id)}
                onClick={() => selectItem(item.id)}
              >
                {item.label}
              </MenuItem>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
