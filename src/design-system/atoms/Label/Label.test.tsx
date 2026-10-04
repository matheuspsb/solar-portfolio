// Use case: small mono captions ("EXPERIÊNCIA", "STACK PRINCIPAL") label data blocks. They can be
// plain text or real headings; if the element could not be chosen, section titles would lose
// their heading semantics for screen-reader users.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from './Label';

describe('Label', () => {
  it('can be a real heading', () => {
    render(
      <Label as="h3" id="stack-title">
        Stack principal
      </Label>,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Stack principal' })).toHaveAttribute(
      'id',
      'stack-title',
    );
  });

  it('forwards native props', () => {
    render(<Label lang="en">Hello</Label>);
    expect(screen.getByText('Hello')).toHaveAttribute('lang', 'en');
  });
});
