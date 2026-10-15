import type { Ref } from 'react';
import { arcadeTokens } from '@/styles/arcade-tokens';
import type { CartridgeTone, CartridgeLabel, CartridgeView } from '../flow/home-view';
import { PixelSprite } from '../ui/PixelSprite';

const SPRITE_SCALE = 8;

const LABEL_CLASSES: Record<CartridgeLabel, string> = {
  bug: 'from-cartridge-bug-from to-cartridge-bug-to',
  sulfur: 'from-cartridge-sulfur-from to-cartridge-sulfur-to',
  root: 'from-cartridge-root-from to-cartridge-root-to',
  sealed: 'from-cartridge-sealed-from to-cartridge-sealed-to',
};

const STATUS_CLASSES: Record<CartridgeTone, string> = {
  ready: 'text-venus-phosphor',
  unlocked: 'text-venus-root',
  broken: 'text-venus-alert',
  sealed: 'text-arcade-ink-300',
};

type CartridgeButtonProps = {
  view: CartridgeView;
  isSelected: boolean;
  isRejected: boolean;
  buttonRef: Ref<HTMLButtonElement>;
  onHover: () => void;
  onFocus: () => void;
  onInsert: () => void;
};

export function CartridgeButton({
  view,
  isSelected,
  isRejected,
  buttonRef,
  onHover,
  onFocus,
  onInsert,
}: CartridgeButtonProps) {
  const liftClasses = isSelected ? '-translate-y-3 border-ember-400' : 'border-cartridge-edge';
  const shadowClasses = isSelected ? 'shadow-cartridge-lift' : 'shadow-cartridge-rest';
  const spriteMotion = isSelected ? 'motion-safe:animate-arcade-bob' : '';
  const rejectionMotion = isRejected ? 'motion-safe:animate-arcade-nope' : '';

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={view.accessibleName}
      onClick={onInsert}
      onPointerEnter={onHover}
      onFocus={onFocus}
      className={`relative flex cursor-pointer flex-col text-left transition-transform duration-slow ease-pop outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-4 focus-visible:ring-offset-arcade-screen ${liftClasses} ${rejectionMotion}`}
    >
      <span
        aria-hidden="true"
        className="absolute -top-1.75 left-[28%] h-2.25 w-[44%] rounded-t-xs border border-b-0 border-inherit bg-cartridge-body-high"
      />
      <span
        aria-hidden="true"
        className={`flex flex-1 flex-col gap-[clamp(0.3rem,1cqw,0.55rem)] rounded-t-block rounded-b-xs border border-inherit bg-linear-to-b from-cartridge-body-high to-cartridge-body-low px-[9%] pt-[9%] pb-[8%] ${shadowClasses}`}
      >
        <span
          className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-xs bg-linear-160 ${LABEL_CLASSES[view.label]}`}
        >
          <span className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(0_0_0/0.13)_0_2px,transparent_2px_4px)]" />
          <PixelSprite
            name={view.sprite}
            color={arcadeTokens.cartridgeSpriteColor}
            detailColor={arcadeTokens.spriteDetailColor}
            scale={SPRITE_SCALE}
            className={`relative h-auto w-[46%] ${spriteMotion}`}
          />
          <span className="absolute top-1.25 left-1.75 font-pixel text-arcade-glyph text-cartridge-ink">
            {view.glyph}
          </span>
        </span>
        <span className="font-pixel text-arcade-cartridge-name leading-[1.1] text-arcade-ink-100">
          {view.name}
        </span>
        <span className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-1 font-mono text-arcade-cartridge-meta tracking-[0.08em] text-arcade-ink-300">
          <span>{view.code}</span>
          <span className={STATUS_CLASSES[view.tone]}>● {view.status}</span>
        </span>
        <span className="h-1.5 rounded-xs bg-[repeating-linear-gradient(90deg,var(--color-cartridge-edge)_0_3px,transparent_3px_7px)]" />
      </span>
    </button>
  );
}
