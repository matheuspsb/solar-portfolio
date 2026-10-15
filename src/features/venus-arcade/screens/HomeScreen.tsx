import { useEffect, useEffectEvent } from 'react';
import type { RefObject } from 'react';
import { arcadeContent } from '@/content/arcade';
import { VisuallyHidden } from '@/components/VisuallyHidden';
import type { ArcadeFlow } from '../flow/arcade-flow';
import { CARTRIDGE_IDS } from '../flow/cartridges';
import type { CartridgeId } from '../flow/cartridges';
import { getCartridgeView, getHomeDetails } from '../flow/home-view';
import { CartridgeButton } from './CartridgeButton';

const { home, a11y } = arcadeContent;

const BEST_DIGITS = 6;

type CartridgeRefs = RefObject<Partial<Record<CartridgeId, HTMLButtonElement | null>>>;

type HomeScreenProps = {
  flow: ArcadeFlow;
  isRootUnlocked: boolean;
  bestScore: number;
  cartridgeRefs: CartridgeRefs;
  onSelect: (id: CartridgeId) => void;
  onInsert: (id: CartridgeId) => void;
};

export function HomeScreen({
  flow,
  isRootUnlocked,
  bestScore,
  cartridgeRefs,
  onSelect,
  onInsert,
}: HomeScreenProps) {
  const focusSelectedCartridge = useEffectEvent(() => {
    cartridgeRefs.current[flow.selectedId]?.focus();
  });
  useEffect(() => {
    focusSelectedCartridge();
  }, []);

  const details = getHomeDetails({
    selectedId: flow.selectedId,
    isRootUnlocked,
    rejection: flow.rejection,
  });
  const bestText = String(bestScore).padStart(BEST_DIGITS, '0');
  const hintClasses = details.isRejected ? 'text-venus-alert' : 'text-arcade-ink-300';

  return (
    <div className="@container absolute inset-0 overflow-auto">
      <div className="flex min-h-full flex-col items-center gap-[clamp(0.75rem,2.4cqw,1.5rem)] p-[clamp(1.125rem,4cqw,2.75rem)_clamp(0.875rem,4cqw,3rem)]">
        <header className="flex flex-col items-center gap-2 text-center">
          <p className="font-pixel text-arcade-kicker tracking-caps text-venus-copper">
            {home.kicker}
          </p>
          <h2 className="font-pixel text-arcade-home-title leading-none text-venus-phosphor text-shadow-pixel-glow">
            {arcadeContent.title}
          </h2>
          <p className="font-mono text-arcade-best tracking-[0.14em] text-arcade-ink-300">
            {home.bestLabel} · {bestText}
          </p>
        </header>
        <div
          role="group"
          aria-label={a11y.cartridgeGroup}
          className="grid w-[min(760px,100%)] grid-cols-3 gap-[clamp(0.625rem,2.4cqw,1.75rem)] pt-3"
        >
          {CARTRIDGE_IDS.map((id) => (
            <CartridgeButton
              key={id}
              view={getCartridgeView(id, isRootUnlocked)}
              isSelected={flow.selectedId === id}
              isRejected={flow.rejection?.id === id}
              buttonRef={(element) => {
                if (cartridgeRefs.current) cartridgeRefs.current[id] = element;
              }}
              onHover={() => onSelect(id)}
              onFocus={() => onSelect(id)}
              onInsert={() => onInsert(id)}
            />
          ))}
        </div>
        <section className="flex min-h-24 w-[min(620px,100%)] flex-col items-center gap-2 text-center">
          <h3 className="font-pixel text-arcade-detail-title text-venus-phosphor">
            {details.title}
          </h3>
          <p className="text-arcade-detail leading-normal text-balance text-arcade-ink-200">
            {details.description}
          </p>
          <p className={`font-mono text-arcade-hint tracking-[0.16em] ${hintClasses}`}>
            {details.hint}
          </p>
        </section>
        <VisuallyHidden role="status">{details.announcement}</VisuallyHidden>
      </div>
    </div>
  );
}
