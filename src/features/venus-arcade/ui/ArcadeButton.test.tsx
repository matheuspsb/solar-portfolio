import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ArcadeButton } from './ArcadeButton';

describe('ArcadeButton', () => {
  it('is a plain button that never submits a form by accident', () => {
    render(<ArcadeButton>Start</ArcadeButton>);
    expect(screen.getByRole('button', { name: 'Start' })).toHaveAttribute('type', 'button');
  });

  it('calls the handler when clicked and stays quiet when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<ArcadeButton onClick={onClick}>Start</ArcadeButton>);
    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <ArcadeButton onClick={onClick} disabled>
        Start
      </ArcadeButton>,
    );
    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
