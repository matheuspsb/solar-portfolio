import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@/design-system/tokens/tokens.css';

const title = 'Matheus — Software Engineer';
const description =
  'Portfólio de Matheus, Software Engineer com foco em frontend (React, Next.js e TypeScript), em formato de sistema solar 3D.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website', locale: 'pt_BR' },
};

export const viewport: Viewport = {
  themeColor: '#03040a',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
