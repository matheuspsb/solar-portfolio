import type { AboutContent } from '@/lib/celestial-body';

export const aboutContent: AboutContent = {
  type: 'about',
  name: 'Matheus',
  role: 'Software Engineer, foco em frontend',
  summary:
    'Engenheiro de software com foco em frontend e cerca de 5 anos de experiência construindo interfaces web.',
  facts: [
    { label: 'Experiência', value: 'Cerca de 5 anos em desenvolvimento frontend' },
    { label: 'Localização', value: 'Campina Grande, Paraíba, Brasil' },
  ],
  stack: ['React', 'Next.js', 'TypeScript', 'TanStack Query', 'React Hook Form', 'Storybook'],
  links: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/matheuspaulosouza' }],
};
