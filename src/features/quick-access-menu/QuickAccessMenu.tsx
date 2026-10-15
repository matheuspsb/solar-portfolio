import { useId } from 'react';
import type { CSSProperties } from 'react';
import { useViewportSize } from '@/hooks/use-viewport-size';
import type { PlanetTone } from '@/domain/celestial-body';
import { joinClassNames } from '@/lib/join-class-names';
import { uiContent } from '@/content/ui';
import { getMenuLayout, getOrbitItems } from './orbit-layout';
import { OrbitMenuItem } from './OrbitMenuItem';
import { OrbitMenuToggle } from './OrbitMenuToggle';
import { OrbitRing } from './OrbitRing';
import { useQuickAccessMenu } from './use-quick-access-menu';

type QuickAccessMenuProps = {
  items: ReadonlyArray<{ id: string; label: string; tone: PlanetTone }>;
  onSelectItem: (id: string) => void;
};

type OrbitItemStyle = CSSProperties & {
  '--orbit-x': string;
  '--orbit-y': string;
  '--orbit-delay': string;
};

const itemOpenClasses =
  'translate-x-(--orbit-x) translate-y-(--orbit-y) scale-100 opacity-100 transition-orbit-item-open';
const itemClosedClasses =
  'pointer-events-none translate-x-0 translate-y-0 scale-30 opacity-0 transition-orbit-item-close';

export function QuickAccessMenu({ items, onSelectItem }: QuickAccessMenuProps) {
  const { width: viewportWidth } = useViewportSize();
  const listId = useId();
  const { containerRef, toggleRef, menu } = useQuickAccessMenu(items.map((item) => item.id));

  if (items.length === 0) return null;

  const layout = getMenuLayout({ count: items.length, viewportWidth });
  const orbitItems = getOrbitItems({ items, positions: layout.positions });
  const itemState = menu.isOpen ? itemOpenClasses : itemClosedClasses;

  const selectItem = (id: string) => {
    menu.closeAndRestoreFocus();
    onSelectItem(id);
  };

  return (
    <nav
      aria-label={uiContent.quickAccess}
      ref={containerRef}
      className="fixed top-5 right-5 z-(--z-chrome)"
      onBlur={menu.closeWhenFocusLeaves}
      onPointerDown={menu.markPressStart}
      onPointerUp={menu.markPressEnd}
      onPointerCancel={menu.markPressEnd}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && menu.isOpen) {
          event.stopPropagation();
          menu.closeAndRestoreFocus();
        }
      }}
    >
      <OrbitMenuToggle
        ref={toggleRef}
        label={uiContent.quickAccess}
        isOpen={menu.isOpen}
        controlsId={listId}
        onClick={menu.toggle}
      />
      <div className="pointer-events-none absolute top-5.5 right-5.5 size-0">
        <OrbitRing
          isOpen={menu.isOpen}
          isRingShown={menu.isOpen && layout.kind === 'arc'}
          radius={layout.radius}
        />
        <ul
          id={listId}
          className="m-0 list-none p-0"
          inert={!menu.isOpen}
          aria-hidden={!menu.isOpen}
        >
          {orbitItems.map((item) => {
            const style: OrbitItemStyle = {
              '--orbit-x': `${item.position.x}px`,
              '--orbit-y': `${item.position.y}px`,
              '--orbit-delay': `${item.delaySeconds}s`,
            };
            return (
              <li
                key={item.id}
                className={joinClassNames('pointer-events-auto absolute top-0 left-0', itemState)}
                style={style}
              >
                <OrbitMenuItem
                  ref={menu.registerItem(item.id)}
                  label={item.label}
                  code={item.code}
                  tone={item.tone}
                  onKeyDown={(event) => menu.handleKeyDown(event, item.id)}
                  onClick={() => selectItem(item.id)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
