import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { StackItem } from '@/domain/celestial-body';
import { StackList } from './StackList';

const react: StackItem = { name: 'React', tone: 'cyan', size: 'lg' };
const next: StackItem = { name: 'Next.js', tone: 'white', size: 'md' };

describe('StackList', () => {
  it('renders each technology as a list item inside a named list', () => {
    render(<StackList label="Stack principal" items={[react, next]} />);
    const list = screen.getByRole('list', { name: 'Stack principal' });
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['React', 'Next.js']);
  });

  it('renders nothing when there are no items', () => {
    const { container } = render(<StackList label="Stack principal" items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('tolerates repeated names without key collisions', () => {
    render(<StackList label="Stack" items={[react, react]} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
