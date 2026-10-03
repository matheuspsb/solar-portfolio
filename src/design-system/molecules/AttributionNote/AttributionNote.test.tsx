// Use case: the CC BY 4.0 license of the Sun texture requires visible credit. If the note were
// missing or the license link broken, the site would violate the license terms.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AttributionNote } from './AttributionNote';

const credit = {
  subject: 'Textura do Sol',
  author: 'Solar System Scope',
  sourceHref: 'https://www.solarsystemscope.com/textures/',
  license: 'CC BY 4.0',
  licenseHref: 'https://creativecommons.org/licenses/by/4.0/',
};

describe('AttributionNote', () => {
  it('names the subject, author and license', () => {
    render(<AttributionNote credits={[credit]} />);
    expect(screen.getByText(/Textura do Sol/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Solar System Scope/ })).toHaveAttribute(
      'href',
      credit.sourceHref,
    );
    expect(screen.getByRole('link', { name: /CC BY 4\.0/ })).toHaveAttribute(
      'href',
      credit.licenseHref,
    );
  });

  it('lists several credits', () => {
    render(<AttributionNote credits={[credit, { ...credit, subject: 'Textura da Terra' }]} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders nothing without credits', () => {
    const { container } = render(<AttributionNote credits={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
