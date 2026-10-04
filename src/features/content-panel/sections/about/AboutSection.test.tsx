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
  it('shows the name as the panel heading, with role and summary', () => {
    render(<AboutSection content={content} emblemTextureUrl={emblem} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Matheus' })).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Resumo curto.')).toBeInTheDocument();
  });

  it('shows experience as a stat with unit and description', () => {
    render(<AboutSection content={content} emblemTextureUrl={emblem} />);
    const term = screen.getByText('Experiência');
    expect(term.tagName).toBe('DT');
    expect(term.nextElementSibling).toHaveTextContent('~5');
    expect(term.nextElementSibling).toHaveTextContent('órbitas');
    expect(term.nextElementSibling).toHaveTextContent('anos em desenvolvimento frontend');
  });

  it('shows the location with its coordinates', () => {
    render(<AboutSection content={content} emblemTextureUrl={emblem} />);
    const term = screen.getByText('Localização');
    expect(term.nextElementSibling).toHaveTextContent('Campina Grande, PB');
    expect(term.nextElementSibling).toHaveTextContent('7°13′S · 35°52′W');
  });

  it('shows the stack under its own heading with a count', () => {
    render(<AboutSection content={content} emblemTextureUrl={emblem} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Stack principal' })).toBeInTheDocument();
    expect(screen.getByText('2 corpos')).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Stack principal' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  });

  it('uses the singular for a stack of one', () => {
    render(
      <AboutSection
        content={{ ...content, stack: [content.stack[0]!] }}
        emblemTextureUrl={emblem}
      />,
    );
    expect(screen.getByText('1 corpo')).toBeInTheDocument();
  });

  it('links to LinkedIn safely in a new tab, styled as the call to action', () => {
    render(<AboutSection content={content} emblemTextureUrl={emblem} />);
    const link = screen.getByRole('link', { name: /LinkedIn/ });
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/matheuspaulosouza');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('omits the stack and the links when there are none', () => {
    render(<AboutSection content={{ ...content, stack: [], links: [] }} emblemTextureUrl={null} />);
    expect(screen.queryByRole('heading', { name: 'Stack principal' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
