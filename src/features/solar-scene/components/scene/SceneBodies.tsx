import type { Highlight } from '@/domain/interaction-state';
import type { CelestialBodyConfig } from '@/domain/celestial-body';
import { BodyInteractionProvider } from '../../hooks/use-body-interaction';
import { CelestialBody } from '../bodies/CelestialBody';

type SceneBodiesProps = {
  bodies: readonly CelestialBodyConfig[];
  prefersSmallTexture: boolean;
  highlightOf: (id: string) => Highlight;
  onHoverChange: (id: string, isHovered: boolean) => void;
  onSelect: (id: string) => void;
  prefersReducedMotion: boolean;
  onBodySettled: (id: string) => void;
};

export function SceneBodies({
  bodies,
  prefersSmallTexture,
  highlightOf,
  onHoverChange,
  onSelect,
  prefersReducedMotion,
  onBodySettled,
}: SceneBodiesProps) {
  return (
    <BodyInteractionProvider
      highlightOf={highlightOf}
      onHoverChange={onHoverChange}
      onSelect={onSelect}
      prefersReducedMotion={prefersReducedMotion}
    >
      {bodies.map((body) => (
        <CelestialBody
          key={body.id}
          id={body.id}
          kind={body.kind}
          orbit={body.orbit}
          radius={body.radius}
          texture={body.texture}
          prefersSmallTexture={prefersSmallTexture}
          rotationPeriodSeconds={body.rotationPeriodSeconds}
          isInteractive={body.section !== null}
          onSettled={onBodySettled}
        />
      ))}
    </BodyInteractionProvider>
  );
}
