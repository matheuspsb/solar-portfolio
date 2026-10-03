import { useArrowNavigation } from '@/hooks/use-arrow-navigation';
import { VisuallyHidden } from '../../atoms/VisuallyHidden/VisuallyHidden';

type SceneKeyboardControlsProps = {
  groupLabel: string;
  items: ReadonlyArray<{ id: string; label: string }>;
  onItemFocus: (id: string) => void;
  onItemBlur: (id: string) => void;
  onItemActivate: (id: string) => void;
};

export function SceneKeyboardControls({
  groupLabel,
  items,
  onItemFocus,
  onItemBlur,
  onItemActivate,
}: SceneKeyboardControlsProps) {
  const { registerItem, handleKeyDown } = useArrowNavigation(items.map((item) => item.id));

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
