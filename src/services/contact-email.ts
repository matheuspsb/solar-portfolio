import type { ContactMessage } from '@/domain/contact-message';

export type ContactEmail = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
};

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

function toSingleLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function buildContactEmail(
  message: ContactMessage,
  addresses: { from: string; to: string },
): ContactEmail {
  const senderName = escapeHtml(message.name);
  const senderEmail = escapeHtml(message.email);
  const body = escapeHtml(message.message).replace(/\r?\n/g, '<br>');

  return {
    from: addresses.from,
    to: addresses.to,
    replyTo: message.email,
    subject: `Mensagem de ${toSingleLine(message.name)} pelo portfólio`,
    html: `<p><strong>De:</strong> ${senderName} &lt;${senderEmail}&gt;</p><p>${body}</p>`,
    text: `De: ${message.name} <${message.email}>\n\n${message.message}`,
  };
}
