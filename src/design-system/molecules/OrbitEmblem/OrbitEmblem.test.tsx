// Use case: a tiny orbiting Sun next to the visitor's name gives the panel its space identity. It is
// purely decorative, so it must stay out of the accessibility tree, show the Sun texture when it is
// available and still render a warm sun without it.
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrbitEmblem } from './OrbitEmblem';

describe('OrbitEmblem', () => {
  it('is hidden from assistive technology', () => {
    const { container } = render(<OrbitEmblem textureUrl="/textures/sun-small.webp" />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows the Sun texture as a decorative image', () => {
    const { container } = render(<OrbitEmblem textureUrl="/textures/sun-small.webp" />);
    const image = container.querySelector('img')!;
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', '');
    expect(decodeURIComponent(image.getAttribute('src') ?? '')).toContain('sun-small.webp');
  });

  it('renders a gradient Sun without any image when there is no texture', () => {
    const { container } = render(<OrbitEmblem textureUrl={null} />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.firstElementChild).toBeInTheDocument();
  });
});
