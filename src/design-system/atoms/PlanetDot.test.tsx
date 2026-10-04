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
});
