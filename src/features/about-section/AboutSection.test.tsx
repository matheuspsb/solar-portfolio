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
};

describe('AboutSection', () => {
  it('omits the stack and the links when there are none', () => {
    render(<AboutSection content={{ ...content, stack: [], links: [] }} emblemTextureUrl={null} />);
    expect(screen.queryByRole('heading', { name: 'Stack principal' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
