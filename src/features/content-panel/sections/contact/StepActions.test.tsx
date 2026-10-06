import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StepActions } from './StepActions';

const baseProps = {
  label: 'Continuar',
  icon: '→',
  backLabel: 'Voltar',
  isReady: true,
  isSending: false,
  canGoBack: true,
  onBack: () => undefined,
};

function renderActions(overrides: Partial<React.ComponentProps<typeof StepActions>> = {}) {
  return render(
    <form>
      <StepActions {...baseProps} {...overrides} />
    </form>,
  );
}

describe('StepActions', () => {
  it('stays clickable when the answer is not ready, so the form can explain what is missing', () => {
    renderActions({ isReady: false });
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  });

  it('offers no way back on the first question', () => {
    renderActions({ canGoBack: false });
    expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument();
  });

  it('marks the main button as busy while sending, without removing it', () => {
    renderActions({ isSending: true, label: 'Transmitindo…' });
    expect(screen.getByRole('button', { name: 'Transmitindo…' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('keeps the glyph out of the accessible name', () => {
    renderActions();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
  });
});
