import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubReducedMotion } from '@/test/stub-reduced-motion';
import { ArcJourney } from './ArcJourney';
import { STEP_PROGRESS } from './arc-geometry';
import { createCometStore } from './comet-store';

const planets = [
  { id: 'name', label: 'NOME', jumpLabel: 'Voltar para NOME' },
  { id: 'email', label: 'E-MAIL', jumpLabel: 'Voltar para E-MAIL' },
  { id: 'message', label: 'MENSAGEM', jumpLabel: 'Voltar para MENSAGEM' },
] as const;

type JourneyOverrides = Partial<Omit<React.ComponentProps<typeof ArcJourney>, 'comet'>> & {
  head?: number;
};

function renderJourney({ head = STEP_PROGRESS[1], ...overrides }: JourneyOverrides = {}) {
  const onJump = vi.fn();
  const view = render(
    <ArcJourney
      planets={planets}
      currentStep={1}
      isDelivered={false}
      isSending={false}
      comet={createCometStore({ head, tail: head })}
      canJump
      onJump={onJump}
      {...overrides}
    />,
  );
  return { ...view, onJump };
}

afterEach(() => vi.unstubAllGlobals());

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

  it('ripples the planets already reached and warps while sending, unless the visitor prefers reduced motion', () => {
    const normal = renderJourney({ isSending: true });
    const normalCircles = normal.container.querySelectorAll('circle').length;
    const normalElements = normal.container.querySelectorAll('*').length;
    normal.unmount();

    stubReducedMotion(true);
    const reduced = renderJourney({ isSending: true });
    expect(reduced.container.querySelectorAll('circle').length).toBeLessThan(normalCircles);
    expect(reduced.container.querySelectorAll('*').length).toBeLessThan(normalElements);
  });

  it('draws every planet even when two of them share a label', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderJourney({
      planets: [
        { id: 'first', label: 'ETAPA', jumpLabel: 'Voltar para a primeira' },
        { id: 'second', label: 'ETAPA', jumpLabel: 'Voltar para a segunda' },
        { id: 'third', label: 'ETAPA', jumpLabel: 'Voltar para a terceira' },
      ],
      currentStep: 2,
      head: STEP_PROGRESS[2],
    });
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
