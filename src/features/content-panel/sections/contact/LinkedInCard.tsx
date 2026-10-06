import { ArrowUpRightIcon } from '@/design-system/atoms/ArrowUpRightIcon';
import { Link } from '@/design-system/atoms/Link';
import type { ContactContent } from '@/lib/contact-content';

type LinkedInCardProps = {
  linkedin: ContactContent['linkedin'];
};

export function LinkedInCard({ linkedin }: LinkedInCardProps) {
  return (
    <div className="mt-auto flex items-center gap-3 rounded-block border border-line px-4 py-3.5">
      <p className="m-0 flex-1 text-tag leading-snug text-ink-300">{linkedin.text}</p>
      <Link href={linkedin.href} external variant="outline" className="shrink-0">
        {linkedin.label}
        <ArrowUpRightIcon className="size-3.5" />
      </Link>
    </div>
  );
}
