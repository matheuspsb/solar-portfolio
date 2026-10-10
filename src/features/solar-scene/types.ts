import type { CelestialBodyConfig } from '@/domain/celestial-body';
import type { Highlight } from '@/domain/interaction-state';
import type { ScreenFrame } from '@/lib/screen-frame';

export type SceneProps = {
  bodies: readonly CelestialBodyConfig[];
  highlightOf: (id: string) => Highlight;
  onHoverChange: (id: string, isHovered: boolean) => void;
  onSelect: (id: string) => void;
  onContextLost: () => void;
  onContextRestored: () => void;
  isActive: boolean;
  cameraTarget: { id: string | null; nonce: number };
  description: string;
  trackedBodyId: string | null;
  onTrackFrame: (frame: ScreenFrame | null) => void;
};
