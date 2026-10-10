import type { ScreenFrame } from '@/lib/screen-frame';
import { getCornerSize, getLockFrameBox } from '../lib/lock-frame';

const cornerPositions = [
  'top-0 left-0 border-t-[1.5px] border-l-[1.5px]',
  'top-0 right-0 border-t-[1.5px] border-r-[1.5px]',
  'bottom-0 left-0 border-b-[1.5px] border-l-[1.5px]',
  'bottom-0 right-0 border-b-[1.5px] border-r-[1.5px]',
] as const;

type LockFrameProps = {
  frame: ScreenFrame;
};

export function LockFrame({ frame }: LockFrameProps) {
  const box = getLockFrameBox(frame);
  const cornerSize = getCornerSize(frame.radius);

  return (
    <div
      className="absolute motion-safe:animate-lock-on motion-reduce:animate-target-fade"
      style={{ left: box.left, top: box.top, width: box.size, height: box.size }}
    >
      {cornerPositions.map((position) => (
        <span
          key={position}
          className={`absolute border-(color:--lock-accent) ${position}`}
          style={{ width: cornerSize, height: cornerSize }}
        />
      ))}
    </div>
  );
}
