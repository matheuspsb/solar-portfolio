import type { AboutContent } from '@/lib/celestial-body';

export const aboutContent: AboutContent = {
  type: 'about',
  name: 'Matheus',
  role: 'Software Engineer',
  summary:
    'Engenheiro de software com foco em frontend e cerca de 5 anos de experiência construindo interfaces web.',
  experience: {
    value: '5',
    unit: 'anos',
    description: 'construindo projetos incríveis',
  },
  location: {
    name: 'Campina Grande, BR',
    coordinates: '7°13′S · 35°52′W',
  },
  stack: [
    { name: 'React', tone: 'cyan', size: 'lg' },
    { name: 'Next.js', tone: 'white', size: 'md' },
    { name: 'TypeScript', tone: 'blue', size: 'xl' },
    { name: 'Node.js', tone: 'green', size: 'sm' },
    { name: 'PostgreSQL', tone: 'orchid', size: 'xs' },
    { name: 'React Native', tone: 'amber', size: 'md' },
  ],
  links: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/matheuspaulosouza' }],
};
