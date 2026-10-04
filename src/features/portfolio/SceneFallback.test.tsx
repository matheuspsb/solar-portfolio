// Use case: when the 3D scene cannot run, the visitor still lands on a useful page: a clear message
// and direct buttons to every section. If it announced nothing or lacked the buttons, recruiters
// on weak devices would see an empty black screen.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SceneFallback } from './SceneFallback';

const items = [
  { id: 'sun', label: 'Sobre' },
  { id: 'earth', label: 'Projetos' },
];

describe('SceneFallback', () => {
  it('explains the situation in a status region', () => {
    render(
      <SceneFallback
        title="Matheus"
        message="A cena 3D não está disponível."
        items={items}
        onSelectItem={() => undefined}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('A cena 3D não está disponível.');
    expect(screen.getByRole('heading', { level: 2, name: 'Matheus' })).toBeInTheDocument();
  });

  it('offers one button per section and reports the chosen one', async () => {
    const onSelectItem = vi.fn();
    render(
      <SceneFallback title="Matheus" message="msg" items={items} onSelectItem={onSelectItem} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Abrir Projetos' }));
    expect(onSelectItem).toHaveBeenCalledWith('earth');
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('still explains the situation when there are no sections', () => {
    render(
      <SceneFallback title="Matheus" message="msg" items={[]} onSelectItem={() => undefined} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('msg');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('offers a retry button only when a retry handler is given', async () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <SceneFallback title="t" message="m" items={[]} onSelectItem={() => undefined} />,
    );
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
    rerender(
      <SceneFallback
        title="t"
        message="m"
        items={[]}
        onSelectItem={() => undefined}
        onRetry={onRetry}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
