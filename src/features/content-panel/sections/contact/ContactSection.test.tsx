// Use case: a recruiter who finished reading wants a way to reach out. The section must show a
// clear heading and every channel as a safe external link; with no channels it must not leave an
// empty list behind.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ContactContent } from '@/lib/celestial-body';
import { ContactSection } from './ContactSection';

const content: ContactContent = {
  type: 'contact',
  headline: 'Vamos conversar?',
  summary: 'Resumo do contato.',
  channels: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/matheuspaulosouza' },
    { label: 'GitHub', href: 'https://github.com/matheuspsb' },
  ],
};

describe('ContactSection', () => {
  it('shows the headline as the panel heading, with the summary', () => {
    render(<ContactSection content={content} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Vamos conversar?' })).toBeInTheDocument();
    expect(screen.getByText('Resumo do contato.')).toBeInTheDocument();
  });

  it('offers every channel as an external link that opens safely in a new tab', () => {
    render(<ContactSection content={content} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/matheuspsb',
    );
  });

  it('omits the list when there are no channels', () => {
    render(<ContactSection content={{ ...content, channels: [] }} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
