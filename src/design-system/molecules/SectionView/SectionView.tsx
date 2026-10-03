import type { SectionContent } from '@/lib/celestial-body';
import { AboutSection } from '../AboutSection/AboutSection';

type SectionViewProps = {
  content: SectionContent;
};

/** New section types render here by adding a case; panels and scene stay untouched. */
export function SectionView({ content }: SectionViewProps) {
  switch (content.type) {
    case 'about':
      return <AboutSection content={content} />;
  }
}
