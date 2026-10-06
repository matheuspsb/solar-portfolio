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
  it('credits the author and the license with links to their sources (CC BY requires it)', () => {
    render(<AttributionNote credits={[credit]} />);
    expect(screen.getByRole('link', { name: /Solar System Scope/ })).toHaveAttribute(
      'href',
      credit.sourceHref,
    );
    expect(screen.getByRole('link', { name: /CC BY 4.0/ })).toHaveAttribute(
      'href',
      credit.licenseHref,
    );
  });

  it('renders nothing without credits', () => {
    const { container } = render(<AttributionNote credits={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
