import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import type { CSSProperties, FocusEvent } from 'react';
import { useArrowNavigation } from '@/hooks/use-arrow-navigation';
import { useViewportSize } from '@/hooks/use-viewport-size';
import type { PlanetTone } from '@/lib/celestial-body';
import { joinClassNames } from '@/lib/join-class-names';
import {
  formatObjectCode,
  getOrbitDelaySeconds,
  getOrbitPositions,
  getOrbitRadius,
} from './orbit-layout';
import { OrbitMenuItem } from './OrbitMenuItem';
import { OrbitMenuToggle } from './OrbitMenuToggle';

type QuickAccessMenuProps = {
  items: ReadonlyArray<{ id: string; label: string; tone: PlanetTone }>;
  onSelectItem: (id: string) => void;
};

type OrbitItemStyle = CSSProperties & {
  '--orbit-x': string;
  '--orbit-y': string;
  '--orbit-delay': string;
};

const ringClasses =
  'transition-orbit-ring absolute rounded-full border border-dashed border-ember-400/33';
const glowClasses =
  'transition-orbit-glow absolute -top-32.5 -left-32.5 size-65 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-ember-400)_12%,transparent),transparent_65%)]';
const itemOpenClasses =
  'translate-x-(--orbit-x) translate-y-(--orbit-y) scale-100 opacity-100 transition-orbit-item-open';
const itemClosedClasses =
  'pointer-events-none translate-x-0 translate-y-0 scale-30 opacity-0 transition-orbit-item-close';

export function QuickAccessMenu({ items, onSelectItem }: QuickAccessMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { width: viewportWidth } = useViewportSize();
  const listId = useId();
  const containerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isPressingMenuRef = useRef(false);
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

  const orbitRadius = getOrbitRadius(viewportWidth);
  const positions = getOrbitPositions({ count: items.length, radius: orbitRadius });
  const ringDiameter = orbitRadius * 2;
  const ringStyle: CSSProperties = {
    width: ringDiameter,
    height: ringDiameter,
    top: -orbitRadius,
    left: -orbitRadius,
  };
  const ringState = isOpen ? 'scale-100 opacity-100' : 'scale-20 opacity-0';
  const glowState = isOpen ? 'opacity-100' : 'opacity-0';
  const itemState = isOpen ? itemOpenClasses : itemClosedClasses;

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

  const selectItem = (id: string) => {
    closeAndRestoreFocus();
    onSelectItem(id);
  };

  return (
    <nav
      aria-label="Acesso rápido"
      ref={containerRef}
      className="fixed top-5 right-5 z-(--z-chrome)"
      onBlur={closeWhenFocusLeaves}
      onPointerDown={() => {
        isPressingMenuRef.current = true;
      }}
      onPointerUp={() => {
        isPressingMenuRef.current = false;
      }}
      onPointerCancel={() => {
        isPressingMenuRef.current = false;
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          event.stopPropagation();
          closeAndRestoreFocus();
        }
      }}
    >
      <OrbitMenuToggle
        ref={toggleRef}
        label="Acesso rápido"
        isOpen={isOpen}
        controlsId={listId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      />
      <div className="pointer-events-none absolute top-5.5 right-5.5 size-0">
        <div aria-hidden="true" className={joinClassNames(glowClasses, glowState)} />
        <div
          aria-hidden="true"
          className={joinClassNames(ringClasses, ringState)}
          style={ringStyle}
        />
        <ul id={listId} className="m-0 list-none p-0" inert={!isOpen} aria-hidden={!isOpen}>
          {items.map((item, index) => {
            const position = positions[index] ?? { x: 0, y: 0 };
            const style: OrbitItemStyle = {
              '--orbit-x': `${position.x}px`,
              '--orbit-y': `${position.y}px`,
              '--orbit-delay': `${getOrbitDelaySeconds(index)}s`,
            };
            return (
              <li
                key={item.id}
                className={joinClassNames('pointer-events-auto absolute top-0 left-0', itemState)}
                style={style}
              >
                <OrbitMenuItem
                  ref={registerItem(item.id)}
                  label={item.label}
                  code={formatObjectCode(index)}
                  tone={item.tone}
                  onKeyDown={(event) => handleKeyDown(event, item.id)}
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
