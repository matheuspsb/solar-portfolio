import { Suspense, lazy } from 'react';
import type { SectionContent } from '@/domain/celestial-body';
import { AboutSection } from '@/features/about-section';

const ContactSection = lazy(() =>
  import('@/features/contact-section').then((module) => ({ default: module.ContactSection })),
);

type SectionViewProps = {
  content: SectionContent;
};

export function SectionView({ content }: SectionViewProps) {
  switch (content.type) {
    case 'about':
      return <AboutSection content={content} />;
    case 'contact':
      return (
        <Suspense fallback={null}>
          <ContactSection content={content} />
        </Suspense>
      );
  }
}
