import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubReducedMotion } from '@/test/stub-reduced-motion';
import { JourneyPlanet } from './JourneyPlanet';

afterEach(() => vi.unstubAllGlobals());

function renderCurrent() {
  return render(
    <JourneyPlanet
      position={{ x: 10, y: 10 }}
      state="current"
      label="NOME"
      jumpLabel="Voltar para NOME"
      isJumpable={false}
      onJump={() => undefined}
    />,
  );
}

describe('JourneyPlanet', () => {
  it('pulses the current planet unless the visitor prefers reduced motion', () => {
    const normal = renderCurrent();
    expect(normal.container.querySelector('[class*="animate-dot-pulse"]')).not.toBeNull();
    normal.unmount();

    stubReducedMotion(true);
    const reduced = renderCurrent();
    expect(reduced.container.querySelector('[class*="animate-dot-pulse"]')).toBeNull();
  });
});
