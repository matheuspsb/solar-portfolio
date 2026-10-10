import { useImperativeHandle } from 'react';
import type { Ref } from 'react';
import { useArrowNavigation } from '@/hooks/use-arrow-navigation';
import { VisuallyHidden } from '@/components/VisuallyHidden';

export type SceneKeyboardControlsHandle = {
  focusItem: (id: string) => HTMLElement | null;
};

type SceneKeyboardControlsProps = {
  groupLabel: string;
  items: ReadonlyArray<{ id: string; label: string }>;
  onItemFocus: (id: string) => void;
  onItemBlur: (id: string) => void;
  onItemActivate: (id: string) => void;
  ref?: Ref<SceneKeyboardControlsHandle>;
};

export function SceneKeyboardControls({
  groupLabel,
  items,
  onItemFocus,
  onItemBlur,
  onItemActivate,
  ref,
}: SceneKeyboardControlsProps) {
  const { registerItem, handleKeyDown, getItem } = useArrowNavigation(items.map((item) => item.id));

  useImperativeHandle(ref, () => ({
    focusItem: (id) => {
      const element = getItem(id);
      element?.focus();
      return element;
    },
  }));

  if (items.length === 0) return null;

  return (
    <VisuallyHidden as="div" role="group" aria-label={groupLabel}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          ref={registerItem(item.id)}
          onFocus={() => onItemFocus(item.id)}
          onBlur={() => onItemBlur(item.id)}
          onClick={() => onItemActivate(item.id)}
          onKeyDown={(event) => handleKeyDown(event, item.id)}
        >
          {item.label}
        </button>
      ))}
    </VisuallyHidden>
  );
}
