import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import '@/design-system/tokens/tokens.css';
import { sceneTokens } from '@/design-system/tokens/scene-tokens';

const bricolage = localFont({
  src: './fonts/bricolage-grotesque-latin.woff2',
  weight: '200 800',
  variable: '--font-bricolage',
  display: 'swap',
});

const jetbrainsMono = localFont({
  src: './fonts/jetbrains-mono-latin.woff2',
  weight: '100 800',
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false,
});

const title = 'Matheus — Software Engineer';
const description =
  'Portfólio de Matheus, Software Engineer com foco em frontend (React, Next.js e TypeScript), em formato de sistema solar 3D.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website', locale: 'pt_BR' },
};

export const viewport: Viewport = {
  themeColor: sceneTokens.backgroundColor,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
