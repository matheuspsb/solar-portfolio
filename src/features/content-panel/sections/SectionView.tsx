import type { SectionContent } from '@/lib/celestial-body';
import type { ContactMessageSubmitter } from '@/lib/contact-message';
import { AboutSection } from './about/AboutSection';
import { ContactSection } from './contact/ContactSection';

type SectionViewProps = {
  content: SectionContent;
  /** Small Sun texture used by decorative parts of the section. */
  emblemTextureUrl: string | null;
  /** Delivers a contact-form message; kept outside so the section does not know where it goes. */
  onSubmitContactMessage: ContactMessageSubmitter;
};

/** New section types render here by adding a case; panels and scene stay untouched. */
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
