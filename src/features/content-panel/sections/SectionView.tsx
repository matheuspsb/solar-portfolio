import type { SectionContent } from '@/lib/celestial-body';
import type { ContactMessageSubmitter } from '@/lib/contact-message';
import { AboutSection } from './about/AboutSection';
import { ContactSection } from './contact/ContactSection';

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
      return <ContactSection content={content} onSubmitMessage={onSubmitContactMessage} />;
  }
}
