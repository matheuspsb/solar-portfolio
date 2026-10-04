// Use case: each technology is a chip with a little planet. The text read out must be just the
// technology name (the planet is decoration), otherwise lists would read noisy item names.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StackChip } from './StackChip';

describe('StackChip', () => {
  it('shows the technology name', () => {
    render(
      <ul>
        <StackChip name="TanStack Query" tone="orchid" size="sm" />
      </ul>,
    );
    expect(screen.getByRole('listitem')).toHaveTextContent('TanStack Query');
    expect(screen.getByRole('listitem').textContent).toBe('TanStack Query');
  });

  it('contains one decorative planet', () => {
    const { container } = render(
      <ul>
        <StackChip name="React" tone="cyan" size="lg" />
      </ul>,
    );
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  });
});
