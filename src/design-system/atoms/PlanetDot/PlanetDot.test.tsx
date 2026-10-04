// Use case: each technology in the stack is shown as a little glowing planet next to its name. The
// dot is decoration only: it must be invisible to assistive technology so that "React" is not
// announced with a stray graphic, and every tone/size combination must render.
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlanetDot } from './PlanetDot';

describe('PlanetDot', () => {
  it('is hidden from the accessibility tree and has no text', () => {
    const { container } = render(<PlanetDot tone="cyan" size="md" />);
    const dot = container.firstElementChild!;
    expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(dot).toBeEmptyDOMElement();
  });

  it.each(['cyan', 'white', 'blue', 'green', 'coral', 'orchid', 'amber'] as const)(
    'renders the %s tone',
    (tone) => {
      const { container } = render(<PlanetDot tone={tone} size="md" />);
      expect(container.firstElementChild).toBeInTheDocument();
    },
  );

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders the %s size', (size) => {
    const { container } = render(<PlanetDot tone="cyan" size={size} />);
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('gives bigger sizes bigger classes', () => {
    const small = render(<PlanetDot tone="cyan" size="xs" />).container.firstElementChild!;
    const big = render(<PlanetDot tone="cyan" size="xl" />).container.firstElementChild!;
    expect(small.className).not.toBe(big.className);
  });
});
