import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AboutContent } from '@/domain/celestial-body';
import { AboutSection } from './AboutSection';

const content: AboutContent = {
  type: 'about',
  name: 'Matheus',
  role: 'Software Engineer',
  summary: 'Resumo curto.',
  experience: { value: '~5', unit: 'órbitas', description: 'anos em desenvolvimento frontend' },
  location: { name: 'Campina Grande, PB', coordinates: '7°13′S · 35°52′W' },
  stack: [
    { name: 'React', tone: 'cyan', size: 'lg' },
    { name: 'Next.js', tone: 'white', size: 'md' },
  ],
  links: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/matheuspaulosouza' }],
  emblem: { textureUrl: '/textures/sun-small.webp' },
};

describe('AboutSection', () => {
  it('omits the stack and the links when there are none', () => {
    render(<AboutSection content={{ ...content, stack: [], links: [] }} />);
    expect(screen.queryByRole('heading', { name: 'Stack principal' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('draws the emblem with the texture the content gives it', () => {
    const { container } = render(<AboutSection content={content} />);
    expect(container.querySelector('img')?.getAttribute('src')).toContain(
      encodeURIComponent('/textures/sun-small.webp'),
    );
  });

  it('draws the emblem without a texture when the content has none', () => {
    const { container } = render(
      <AboutSection content={{ ...content, emblem: { textureUrl: null } }} />,
    );
    expect(container.querySelector('img')).toBeNull();
  });
});
