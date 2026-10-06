import { Suspense, lazy } from 'react';
import type { SectionContent } from '@/lib/celestial-body';
import type { ContactMessageSubmitter } from '@/lib/contact-message';
import { AboutSection } from './about/AboutSection';

const ContactSection = lazy(() =>
  import('./contact/ContactSection').then((module) => ({ default: module.ContactSection })),
);

type SectionViewProps = {
  content: SectionContent;
  emblemTextureUrl: string | null;
  onSubmitContactMessage: ContactMessageSubmitter;
};

export function SectionView({
  content,
  emblemTextureUrl,
  onSubmitContactMessage,
}: SectionViewProps) {
  switch (content.type) {
    case 'about':
      return <AboutSection content={content} emblemTextureUrl={emblemTextureUrl} />;
    case 'contact':
      return (
        <Suspense fallback={null}>
          <ContactSection content={content} onSubmitMessage={onSubmitContactMessage} />
        </Suspense>
      );
  }
}
