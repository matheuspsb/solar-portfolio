import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CabinetShell } from './CabinetShell';

describe('CabinetShell', () => {
  it('shows what is inside the screen, and nothing the screen reader would stumble on around it', () => {
    render(
      <CabinetShell showsLegend={false}>
        <button type="button">dentro</button>
      </CabinetShell>,
    );
    expect(screen.getByRole('button', { name: 'dentro' })).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toEqual([]);
    expect(screen.queryAllByRole('heading')).toEqual([]);
  });

  it('lists the keyboard shortcuts only when asked', () => {
    const { rerender } = render(<CabinetShell showsLegend={false}>{null}</CabinetShell>);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    rerender(<CabinetShell showsLegend>{null}</CabinetShell>);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('hides the decorations from assistive technology', () => {
    const { container } = render(<CabinetShell showsLegend={false}>{null}</CabinetShell>);
    const decorations = container.querySelectorAll('[aria-hidden="true"]');
    expect(decorations.length).toBeGreaterThanOrEqual(3);
    for (const decoration of decorations) {
      expect(decoration.querySelector('button, a, input')).toBeNull();
    }
  });
});
