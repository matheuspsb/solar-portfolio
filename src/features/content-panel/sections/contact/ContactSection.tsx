import { Suspense, lazy } from 'react';
import type { ContactContent } from '@/lib/celestial-body';
import { ArrowUpRightIcon } from '@/design-system/atoms/ArrowUpRightIcon';
import { Heading } from '@/design-system/atoms/Heading';
import { Link } from '@/design-system/atoms/Link';
import { Text } from '@/design-system/atoms/Text';
import type { ContactMessageSubmitter } from '@/lib/contact-message';
import { RuledHeading } from '../../components/RuledHeading';

// The form pulls in react-hook-form and zod (~100 KB); only visitors who open Contact pay for them.
const ContactForm = lazy(() =>
  import('./ContactForm').then((module) => ({ default: module.ContactForm })),
);

type ContactSectionProps = {
  content: ContactContent;
  onSubmitMessage: ContactMessageSubmitter;
};

export function ContactSection({ content, onSubmitMessage }: ContactSectionProps) {
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
      <RuledHeading level={3} title={content.form.heading} />
      <Suspense fallback={null}>
        <ContactForm content={content.form} onSubmit={onSubmitMessage} />
      </Suspense>
    </div>
  );
}
