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
