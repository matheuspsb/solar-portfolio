// Use case: the whole journey without WebGL: a recruiter focuses the Sun with the keyboard (or
// clicks it in the scene), opens "Sobre", reads it and closes it, ending where they started. The
// 3D scene is replaced by a tiny stand-in that emits the same events (clicks/hover); everything
// else is the real wiring. If this broke, the portfolio content would be unreachable.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { celestialBodies } from '@/content/celestial-bodies';
import { PortfolioExperience } from './PortfolioExperience';
import type { SceneProps } from './PortfolioExperience';

function FakeScene({ bodies, highlightOf, onHoverChange, onSelect }: SceneProps) {
  return (
    <div data-testid="fake-scene">
      {bodies.map((body) => (
        <div
          key={body.id}
          role="img"
          aria-label={`${body.name} (cena) ${highlightOf(body.id)}`}
          onMouseEnter={() => onHoverChange(body.id, true)}
          onMouseLeave={() => onHoverChange(body.id, false)}
          onClick={() => onSelect(body.id)}
        />
      ))}
    </div>
  );
}

function setup() {
  render(<PortfolioExperience bodies={celestialBodies} scene={FakeScene} />);
  return userEvent.setup();
}

describe('PortfolioExperience', () => {
  it('starts with the panel closed and the Sun reachable by keyboard', () => {
    setup();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sol: abrir seção Sobre' })).toBeInTheDocument();
  });

  it('opens the About panel with Enter on the focused Sun and returns focus on Escape', async () => {
    const user = setup();
    await user.tab();
    const sunButton = screen.getByRole('button', { name: 'Sol: abrir seção Sobre' });
    expect(sunButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog', { name: 'Sobre' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Matheus' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(sunButton).toHaveFocus();
  });

  it('opens with Space as well', async () => {
    const user = setup();
    await user.tab();
    await user.keyboard(' ');
    expect(screen.getByRole('dialog', { name: 'Sobre' })).toBeInTheDocument();
  });

  it('opens when the Sun is clicked in the scene and focus lands on the Sun control after closing', async () => {
    const user = setup();
    await user.click(screen.getByRole('img', { name: /Sol \(cena\)/ }));
    expect(screen.getByRole('dialog', { name: 'Sobre' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fechar painel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sol: abrir seção Sobre' })).toHaveFocus();
  });

  it('shows the texture attribution inside the panel', async () => {
    const user = setup();
    await user.click(screen.getByRole('img', { name: /Sol \(cena\)/ }));
    expect(screen.getByRole('link', { name: /Solar System Scope/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /CC BY 4\.0/ })).toBeInTheDocument();
  });

  it('shows the hint on hover and hides it while the panel is open', async () => {
    const user = setup();
    await user.hover(screen.getByRole('img', { name: /Sol \(cena\)/ }));
    expect(screen.getByText('Sol · Sobre')).toBeInTheDocument();
    await user.click(screen.getByRole('img', { name: /Sol \(cena\)/ }));
    expect(screen.queryByText('Sol · Sobre')).not.toBeInTheDocument();
  });

  it('survives rapid repeated Enter without opening duplicates', async () => {
    const user = setup();
    await user.tab();
    await user.keyboard('{Enter}{Enter}{Enter}');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('makes the background inert while the panel is open', async () => {
    const user = setup();
    await user.click(screen.getByRole('img', { name: /Sol \(cena\)/ }));
    expect(screen.getByTestId('fake-scene').closest('[inert]')).not.toBeNull();
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('fake-scene').closest('[inert]')).toBeNull();
  });

  it('ignores Escape when the panel is already closed', async () => {
    const user = setup();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the same panel from the quick-access menu and returns focus to the menu button', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Acesso rápido' }));
    await user.click(screen.getByRole('button', { name: 'Sobre' }));
    expect(screen.getByRole('dialog', { name: 'Sobre' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Matheus' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acesso rápido' })).toHaveFocus();
  });

  it('opens from the menu entirely by keyboard', async () => {
    const user = setup();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Acesso rápido' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog', { name: 'Sobre' })).toBeInTheDocument();
  });

  it('can open from the menu, close from the panel, then open again from the scene', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Acesso rápido' }));
    await user.click(screen.getByRole('button', { name: 'Sobre' }));
    await user.click(screen.getByRole('button', { name: 'Fechar painel' }));
    await user.click(screen.getByRole('img', { name: /Sol \(cena\)/ }));
    expect(screen.getByRole('dialog', { name: 'Sobre' })).toBeInTheDocument();
  });
});
