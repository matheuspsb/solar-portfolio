import { Suspense, lazy } from 'react';
import type { SectionContent } from '@/domain/celestial-body';
import { AboutSection } from './about/AboutSection';

const ContactSection = lazy(() =>
  import('./contact/ContactSection').then((module) => ({ default: module.ContactSection })),
);

type SectionViewProps = {
  content: SectionContent;
  emblemTextureUrl: string | null;
};

export function SectionView({ content, emblemTextureUrl }: SectionViewProps) {
  switch (content.type) {
    case 'about':
      return <AboutSection content={content} emblemTextureUrl={emblemTextureUrl} />;
    case 'contact':
      return (
        <Suspense fallback={null}>
          <ContactSection content={content} />
        </Suspense>
      );
  }
}
