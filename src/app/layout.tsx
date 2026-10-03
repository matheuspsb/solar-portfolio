import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/design-system/tokens/tokens.css';

export const metadata: Metadata = {
  title: 'Matheus — Software Engineer',
  description: 'Portfólio de Matheus, Software Engineer com foco em frontend.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
