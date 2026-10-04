import type { SectionContent } from '@/lib/celestial-body';
import { AboutSection } from './about/AboutSection';

type SectionViewProps = {
  content: SectionContent;
  /** Small Sun texture used by decorative parts of the section. */
  emblemTextureUrl: string | null;
};

/** New section types render here by adding a case; panels and scene stay untouched. */
export function SectionView({ content, emblemTextureUrl }: SectionViewProps) {
  switch (content.type) {
    case 'about':
      return <AboutSection content={content} emblemTextureUrl={emblemTextureUrl} />;
  }
}
