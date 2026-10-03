import { Link } from '../../atoms/Link/Link';

export type Credit = {
  subject: string;
  author: string;
  sourceHref: string;
  license: string;
  licenseHref: string;
};

type AttributionNoteProps = {
  credits: readonly Credit[];
};

export function AttributionNote({ credits }: AttributionNoteProps) {
  if (credits.length === 0) return null;

  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm text-text-secondary">
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
