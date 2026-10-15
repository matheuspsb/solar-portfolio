import { arcadeContent } from '@/content/arcade';
import { ArcadeButton } from '../ui/ArcadeButton';
import { PixelTitle } from '../ui/PixelTitle';

type GamePlaceholderProps = { onLeave: () => void };

// TODO(venus-arcade-step-10): replace this stand-in with the playable BUG HUNTER screen.
export function GamePlaceholder({ onLeave }: GamePlaceholderProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
      <PixelTitle>{arcadeContent.cartridges[0].name}</PixelTitle>
      <ArcadeButton variant="secondary" onClick={onLeave}>
        {arcadeContent.game.leaveLabel}
      </ArcadeButton>
    </div>
  );
}
