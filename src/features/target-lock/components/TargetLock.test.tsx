import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFrameChannel } from '@/lib/screen-frame';
import type { FrameChannel } from '@/lib/screen-frame';
import { HIDE_DELAY_MS, SHOW_DELAY_MS } from '../hooks/use-intent-target';
import type { LockTarget } from '../types';
import { TargetLock } from './TargetLock';

const targets: LockTarget[] = [
  {
    id: 'sun',
    tone: 'amber',
    code: '001',
    name: 'SOL',
    description: 'Estrela tipo G · centro do sistema',
    ctaLabel: 'Sobre',
    anchor: 'top-left',
  },
  {
    id: 'mercury',
    tone: 'periwinkle',
    code: '002',
    name: 'MERCÚRIO',
    description: 'Planeta mensageiro · 0,39 UA',
    ctaLabel: 'Contato',
    anchor: 'bottom-left',
  },
];
const centerFrame = { x: 512, y: 384, radius: 110 };

function renderLock(props: { activeId: string | null; channel?: FrameChannel }) {
  const channel = props.channel ?? createFrameChannel();
  const lock = (activeId: string | null) => (
    <TargetLock targets={targets} activeId={activeId} channel={channel} />
  );
  const view = render(lock(props.activeId));
  const update = (activeId: string | null) => view.rerender(lock(activeId));
  return { ...view, channel, update };
}

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('TargetLock', () => {
  it('shows nothing until the scene reports where the body is on screen', () => {
    const { channel } = renderLock({ activeId: 'sun' });
    advance(SHOW_DELAY_MS);
    expect(screen.queryByText('ALVO TRAVADO · 001')).not.toBeInTheDocument();
    act(() => channel.publish(centerFrame));
    expect(screen.getByText('ALVO TRAVADO · 001')).toBeInTheDocument();
  });

  it('hides a little after the pointer leaves', () => {
    const channel = createFrameChannel();
    channel.publish(centerFrame);
    const { update } = renderLock({ activeId: 'sun', channel });
    advance(SHOW_DELAY_MS);
    update(null);
    advance(HIDE_DELAY_MS - 1);
    expect(screen.getByText('ALVO TRAVADO · 001')).toBeInTheDocument();
    advance(1);
    expect(screen.queryByText('ALVO TRAVADO · 001')).not.toBeInTheDocument();
  });

  it('moves straight to the next body when the pointer goes from one to the other', () => {
    const channel = createFrameChannel();
    channel.publish(centerFrame);
    const { update } = renderLock({ activeId: 'sun', channel });
    advance(SHOW_DELAY_MS);
    update('mercury');
    advance(1);
    expect(screen.getByText('ALVO TRAVADO · 002')).toBeInTheDocument();
    expect(screen.queryByText('ALVO TRAVADO · 001')).not.toBeInTheDocument();
  });

  it('keeps itself out of the way of the pointer and of assistive technology', () => {
    const channel = createFrameChannel();
    channel.publish(centerFrame);
    renderLock({ activeId: 'sun', channel });
    advance(SHOW_DELAY_MS);
    const overlay = screen.getByText('ALVO TRAVADO · 001').closest('[aria-hidden="true"]');
    expect(overlay).not.toBeNull();
    expect(overlay).toHaveClass('pointer-events-none');
  });

  it('shows the real name at once when motion is reduced', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    const channel = createFrameChannel();
    channel.publish(centerFrame);
    renderLock({ activeId: 'mercury', channel });
    advance(SHOW_DELAY_MS);
    expect(screen.getByText('MERCÚRIO')).toBeInTheDocument();
  });

  it('ignores an id it has no data for', () => {
    const channel = createFrameChannel();
    channel.publish(centerFrame);
    renderLock({ activeId: 'pluto', channel });
    advance(SHOW_DELAY_MS * 3);
    expect(screen.queryByText(/ALVO TRAVADO/)).not.toBeInTheDocument();
  });
});
