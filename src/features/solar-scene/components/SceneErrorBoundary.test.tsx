// Use case: if the 3D scene throws while rendering (shader error, bad asset), the rest of the page
// (menu, panel, content) must survive and the visitor must see a useful fallback instead of a
// blank screen. The boundary also reports the error so it is not silently swallowed.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SceneErrorBoundary } from './SceneErrorBoundary';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('shader exploded');
  return <p>cena ok</p>;
}

beforeEach(() => {
  // React logs caught errors; keep the test output readable.
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SceneErrorBoundary', () => {
  it('renders children when nothing fails', () => {
    render(
      <SceneErrorBoundary fallback={<p>fallback</p>}>
        <Bomb shouldThrow={false} />
      </SceneErrorBoundary>,
    );
    expect(screen.getByText('cena ok')).toBeInTheDocument();
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });

  it('shows the fallback and reports the error when a child throws', () => {
    const onError = vi.fn();
    render(
      <SceneErrorBoundary fallback={<p>fallback</p>} onError={onError}>
        <Bomb shouldThrow />
      </SceneErrorBoundary>,
    );
    expect(screen.getByText('fallback')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0]![0]).toBeInstanceOf(Error);
  });

  it('keeps siblings outside the boundary working', () => {
    render(
      <>
        <p>menu</p>
        <SceneErrorBoundary fallback={<p>fallback</p>}>
          <Bomb shouldThrow />
        </SceneErrorBoundary>
      </>,
    );
    expect(screen.getByText('menu')).toBeInTheDocument();
  });

  it('recovers when the reset key changes', async () => {
    function Harness() {
      const [attempt, setAttempt] = useState(0);
      return (
        <>
          <button onClick={() => setAttempt(1)}>tentar de novo</button>
          <SceneErrorBoundary fallback={<p>fallback</p>} resetKey={attempt}>
            <Bomb shouldThrow={attempt === 0} />
          </SceneErrorBoundary>
        </>
      );
    }
    render(<Harness />);
    expect(screen.getByText('fallback')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'tentar de novo' }));
    expect(screen.getByText('cena ok')).toBeInTheDocument();
  });
});
