import type { Credit } from '@/lib/credit';
import { Link } from '@/design-system/atoms/Link';

type AttributionNoteProps = {
  credits: readonly Credit[];
};

export function AttributionNote({ credits }: AttributionNoteProps) {
  if (credits.length === 0) return null;

  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0 text-credit text-ink-400">
      {credits.map((credit) => (
        <li key={credit.subject}>
          {credit.subject}:{' '}
          <Link href={credit.sourceHref} external>
            {credit.author}
          </Link>
          , licença{' '}
          <Link href={credit.licenseHref} external>
            {credit.license}
          </Link>
          .
        </li>
      ))}
    </ul>
  );
}
