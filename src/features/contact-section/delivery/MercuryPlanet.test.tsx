import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubReducedMotion } from '@/test/stub-reduced-motion';
import { MercuryPlanet } from './MercuryPlanet';

afterEach(() => vi.unstubAllGlobals());

describe('MercuryPlanet', () => {
  it('flashes on arrival unless the visitor prefers reduced motion', () => {
    const normal = render(<MercuryPlanet label="MERCÚRIO" />);
    const normalCount = normal.container.querySelectorAll('div').length;
    normal.unmount();

    stubReducedMotion(true);
    const reduced = render(<MercuryPlanet label="MERCÚRIO" />);
    expect(reduced.container.querySelectorAll('div').length).toBeLessThan(normalCount);
  });
});
