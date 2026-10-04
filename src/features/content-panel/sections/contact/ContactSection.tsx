import type { ContactContent } from '@/lib/celestial-body';
import { ArrowUpRightIcon } from '@/design-system/atoms/ArrowUpRightIcon';
import { Heading } from '@/design-system/atoms/Heading';
import { Link } from '@/design-system/atoms/Link';
import { Text } from '@/design-system/atoms/Text';

type ContactSectionProps = {
  content: ContactContent;
};

export function ContactSection({ content }: ContactSectionProps) {
  const hasChannels = content.channels.length > 0;

  return (
    <div className="flex flex-col gap-6.5">
      <Heading level={2} size="display">
        {content.headline}
      </Heading>
      <Text>{content.summary}</Text>
      {hasChannels && (
        <ul className="m-0 flex list-none flex-col items-start gap-2 p-0">
          {content.channels.map((channel) => (
            <li key={channel.href}>
              <Link href={channel.href} external variant="button">
                {channel.label}
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
