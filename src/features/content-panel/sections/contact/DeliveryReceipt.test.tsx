import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { contactContent } from '@/content/contact';
import { DeliveryReceipt } from './DeliveryReceipt';

const message = {
  name: 'Ana Souza',
  email: 'ana@empresa.com',
  message: 'Gostei do seu portfólio, vamos conversar?',
};

function renderReceipt(onSendAnother = () => undefined) {
  return render(
    <DeliveryReceipt
      content={contactContent}
      message={message}
      protocol="MSG-1234"
      onSendAnother={onSendAnother}
    />,
  );
}

describe('DeliveryReceipt', () => {
  it('thanks the sender by first name, as the panel heading', () => {
    renderReceipt();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Hermes levou sua mensagem, Ana.' }),
    ).toBeInTheDocument();
  });

  it('moves focus to the confirmation so assistive technology reads it', () => {
    renderReceipt();
    expect(screen.getByRole('heading', { level: 2 })).toHaveFocus();
  });

  it('lets the visitor start another message', async () => {
    const onSendAnother = vi.fn();
    renderReceipt(onSendAnother);
    await userEvent.click(screen.getByRole('button', { name: 'Enviar outra mensagem' }));
    expect(onSendAnother).toHaveBeenCalledOnce();
  });

  it('does not break with an empty name', () => {
    render(
      <DeliveryReceipt
        content={contactContent}
        message={{ ...message, name: '' }}
        protocol="MSG-1000"
        onSendAnother={() => undefined}
      />,
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Hermes levou sua mensagem, viajante.' }),
    ).toBeInTheDocument();
  });
});
