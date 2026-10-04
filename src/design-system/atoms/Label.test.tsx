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
