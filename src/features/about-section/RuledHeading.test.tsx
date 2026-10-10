import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RuledHeading } from './RuledHeading';

describe('RuledHeading', () => {
  it('renders the title as a heading of the requested level', () => {
    render(<RuledHeading level={3} title="Stack principal" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Stack principal' })).toBeInTheDocument();
  });

  it('shows the trailing note when given, outside the heading name', () => {
    render(<RuledHeading level={3} title="Stack principal" trailing="6 corpos" />);
    expect(screen.getByText('6 corpos')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Stack principal' })).toBeInTheDocument();
  });
});
