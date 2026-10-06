import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AboutContent } from '@/lib/celestial-body';
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
};

const emblem = '/textures/sun-small.webp';

describe('AboutSection', () => {
  it('shows the stack under its own heading with a count', () => {
    render(<AboutSection content={content} emblemTextureUrl={emblem} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Stack principal' })).toBeInTheDocument();
    expect(screen.getByText('2 corpos')).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Stack principal' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  });

  it('omits the stack and the links when there are none', () => {
    render(<AboutSection content={{ ...content, stack: [], links: [] }} emblemTextureUrl={null} />);
    expect(screen.queryByRole('heading', { name: 'Stack principal' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
