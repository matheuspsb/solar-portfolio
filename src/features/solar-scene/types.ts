import type { CelestialBodyConfig } from '@/lib/celestial-body';
import type { Highlight } from '@/lib/interaction-state';

/** What a 3D scene needs from the page; the page injects it, so any scene (or a test double) fits. */
export type SceneProps = {
  bodies: readonly CelestialBodyConfig[];
  highlightOf: (id: string) => Highlight;
  onHoverChange: (id: string, isHovered: boolean) => void;
  onSelect: (id: string) => void;
  onContextLost: () => void;
  onContextRestored: () => void;
  /** False while the content panel covers the scene, so it can stop its idle render loop. */
  isActive: boolean;
  /** The body the camera should bring into view; `nonce` changes on every new focus request. */
  cameraTarget: { id: string | null; nonce: number };
  /** Text alternative for the canvas, announced by assistive technology. */
  description: string;
};
