import { arcadeContent } from '@/content/arcade';

const { left, right } = arcadeContent.cabinet;

const SIDE_CLASSES =
  'absolute bottom-0 hidden w-37.5 flex-col items-center gap-4 rounded-t-[20px] border border-b-0 border-arcade-side-edge bg-linear-to-b from-arcade-side-high to-arcade-side-low pt-5.5 min-[1241px]:flex';
const SCREEN_CLASSES =
  'flex w-27.5 items-center justify-center rounded-[10px] bg-[radial-gradient(circle,var(--color-arcade-side-screen),var(--color-arcade-backdrop-deep))] font-pixel text-arcade-glyph text-arcade-side-glyph shadow-screen';
const LABEL_CLASSES =
  'font-mono text-arcade-cabinet-caption tracking-[0.2em] text-arcade-cabinet-dim';

export function SideCabinets() {
  return (
    <div aria-hidden="true" className="pointer-events-none contents">
      <div className={`${SIDE_CLASSES} left-[1.5%] h-[58%]`}>
        <div className={`${SCREEN_CLASSES} h-20`}>{left.glyph}</div>
        <div className="flex gap-2.5">
          <span className="size-2 rounded-full bg-arcade-led-red motion-safe:animate-arcade-led-fast" />
          <span className="size-2 rounded-full bg-arcade-led-off" />
          <span className="size-2 rounded-full bg-ember-400 motion-safe:animate-arcade-led-slow" />
        </div>
        <span className={LABEL_CLASSES}>{left.label}</span>
      </div>
      <div className={`${SIDE_CLASSES} right-[1.5%] h-[50%]`}>
        <div className={`${SCREEN_CLASSES} h-17.5 motion-safe:animate-arcade-led-slow`}>
          {right.glyph}
        </div>
        <span className={LABEL_CLASSES}>{right.label}</span>
      </div>
    </div>
  );
}
