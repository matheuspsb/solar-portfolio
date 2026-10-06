import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ArcJourney } from './ArcJourney';
import { STEP_PROGRESS } from './arc-geometry';

const planets = [
  { label: 'NOME', jumpLabel: 'Voltar para NOME' },
  { label: 'E-MAIL', jumpLabel: 'Voltar para E-MAIL' },
  { label: 'MENSAGEM', jumpLabel: 'Voltar para MENSAGEM' },
] as const;

function renderJourney(overrides: Partial<React.ComponentProps<typeof ArcJourney>> = {}) {
  const onJump = vi.fn();
  const view = render(
    <ArcJourney
      planets={planets}
      currentStep={1}
      isDelivered={false}
      isSending={false}
      reducedMotion={false}
      head={STEP_PROGRESS[1]}
      tail={STEP_PROGRESS[1]}
      canJump
      onJump={onJump}
      {...overrides}
    />,
  );
  return { ...view, onJump };
}

describe('ArcJourney', () => {
  it('lets the visitor go back to a step already answered, and only those', async () => {
    const { onJump } = renderJourney();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Voltar para NOME' }));
    expect(onJump).toHaveBeenCalledWith(0);
  });

  it('does not offer going back before the comet reaches the planet', () => {
    renderJourney({ currentStep: 2, head: STEP_PROGRESS[0] });
    expect(screen.queryByRole('button', { name: 'Voltar para E-MAIL' })).not.toBeInTheDocument();
  });

  it('offers no jumps while jumping is not allowed (sending)', () => {
    renderJourney({ canJump: false });
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
