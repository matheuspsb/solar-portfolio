// Use case: the "Sobre" content is what a recruiter came for: who, what role, how much
// experience, which stack, where, and how to reach out. If any block rendered wrongly, the
// recruiter could miss the contact link or see a broken, empty section.
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AboutContent } from '@/lib/celestial-body';
import { AboutSection } from './AboutSection';

const content: AboutContent = {
  type: 'about',
  name: 'Matheus',
  role: 'Software Engineer, foco em frontend',
  summary: 'Resumo curto.',
  facts: [
    { label: 'Experiência', value: 'Cerca de 5 anos' },
    { label: 'Localização', value: 'Campina Grande, PB' },
  ],
  stack: ['React', 'Next.js'],
  links: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/matheuspaulosouza' }],
};

describe('AboutSection', () => {
  it('shows name, role and summary', () => {
    render(<AboutSection content={content} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Matheus' })).toBeInTheDocument();
    expect(screen.getByText('Software Engineer, foco em frontend')).toBeInTheDocument();
    expect(screen.getByText('Resumo curto.')).toBeInTheDocument();
  });

  it('shows facts as label/value pairs', () => {
    render(<AboutSection content={content} />);
    const experience = screen.getByText('Experiência');
    expect(experience.tagName).toBe('DT');
    expect(experience.nextElementSibling).toHaveTextContent('Cerca de 5 anos');
    expect(screen.getByText('Campina Grande, PB').tagName).toBe('DD');
  });

  it('shows the stack under its own heading', () => {
    render(<AboutSection content={content} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Stack principal' })).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Stack principal' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  });

  it('links to LinkedIn safely in a new tab', () => {
    render(<AboutSection content={content} />);
    const link = screen.getByRole('link', { name: /LinkedIn/ });
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/matheuspaulosouza');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('omits blocks that have no data instead of rendering empty shells', () => {
    render(<AboutSection content={{ ...content, facts: [], stack: [], links: [] }} />);
    expect(screen.queryByRole('heading', { name: 'Stack principal' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('Experiência')).not.toBeInTheDocument();
  });
});
