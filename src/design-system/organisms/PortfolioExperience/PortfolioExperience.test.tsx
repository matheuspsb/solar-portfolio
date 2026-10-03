// Use case: the whole journey without WebGL: a recruiter focuses the Sun with the keyboard (or
// clicks it in the scene), opens "Sobre", reads it and closes it, ending where they started. The
// 3D scene is replaced by a tiny stand-in that emits the same events (clicks/hover); everything
// else is the real wiring. If this broke, the portfolio content would be unreachable.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { celestialBodies } from '@/content/celestial-bodies';
import { PortfolioExperience } from './PortfolioExperience';
import type { SceneProps } from './PortfolioExperience';

function FakeScene({
  bodies,
  highlightOf,
  onHoverChange,
  onSelect,
  onContextLost,
  onContextRestored,
}: SceneProps) {
  return (
    <div data-testid="fake-scene">
      <button tabIndex={-1} onClick={onContextLost}>
        perder contexto
      </button>
      <button tabIndex={-1} onClick={onContextRestored}>
        restaurar contexto
      </button>
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

function ThrowingScene(): never {
  throw new Error('scene failed');
}

function setup({
  scene = FakeScene,
  hasWebGL = true,
}: { scene?: React.ComponentType<SceneProps>; hasWebGL?: boolean } = {}) {
  render(
    <PortfolioExperience bodies={celestialBodies} scene={scene} detectWebGL={() => hasWebGL} />,
  );
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

  describe('without a working 3D scene', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('shows the fallback and no scene when WebGL is unavailable', () => {
      setup({ hasWebGL: false });
      expect(screen.queryByTestId('fake-scene')).not.toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/3D/);
    });

    it('still opens the About panel from the fallback button', async () => {
      const user = setup({ hasWebGL: false });
      await user.click(screen.getByRole('button', { name: 'Abrir Sobre' }));
      expect(screen.getByRole('dialog', { name: 'Sobre' })).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(screen.getByRole('button', { name: 'Abrir Sobre' })).toHaveFocus();
    });

    it('still opens the About panel from the quick-access menu', async () => {
      const user = setup({ hasWebGL: false });
      await user.click(screen.getByRole('button', { name: 'Acesso rápido' }));
      await user.click(screen.getByRole('button', { name: 'Sobre' }));
      expect(screen.getByRole('dialog', { name: 'Sobre' })).toBeInTheDocument();
    });

    it('falls back when the scene crashes while rendering', () => {
      setup({ scene: ThrowingScene });
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Acesso rápido' })).toBeInTheDocument();
    });

    it('lets the visitor retry after a crash and brings the scene back', async () => {
      let isBroken = true;
      function FlakyScene(props: SceneProps) {
        if (isBroken) throw new Error('mount fails while broken');
        return <FakeScene {...props} />;
      }
      const user = setup({ scene: FlakyScene });
      expect(screen.queryByTestId('fake-scene')).not.toBeInTheDocument();
      isBroken = false;
      await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
      expect(screen.getByTestId('fake-scene')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('does not offer a retry when WebGL is simply unavailable', () => {
      setup({ hasWebGL: false });
      expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
    });

    it('shows the fallback when the WebGL context is lost and hides it once restored', async () => {
      const user = setup();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'perder contexto' }));
      expect(screen.getByRole('status')).toHaveTextContent(/recuper/);
      await user.click(screen.getByRole('button', { name: 'restaurar contexto' }));
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('does not show the fallback while the scene works', () => {
      setup();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
