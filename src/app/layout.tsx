import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import '@/design-system/tokens/tokens.css';
import { sceneTokens } from '@/design-system/tokens/scene-tokens';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-bricolage',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
  // Only small captions inside the panel and menu use it; keep it off the critical path.
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
