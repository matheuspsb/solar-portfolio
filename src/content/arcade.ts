export const arcadeContent = {
  dialogLabel: 'Venus Arcade',
  backLabel: 'Sistema solar',
  title: 'VENUS ARCADE',
  ranks: [
    {
      minimumScore: 0,
      title: 'Intern on Call',
      line: 'You found the bugs. Production found you.',
    },
    {
      minimumScore: 800,
      title: 'Junior Debugger',
      line: 'Solid first sprint. The tests are starting to trust you.',
    },
    {
      minimumScore: 2000,
      title: 'Senior Bug Whisperer',
      line: 'Bugs hear your name and file their own tickets.',
    },
    {
      minimumScore: 3500,
      title: 'Staff Exterminator',
      line: 'The uptime chart is a flat line, the good kind.',
    },
    {
      minimumScore: 5000,
      title: 'Principal of Production',
      line: 'Pagers stay silent when you are on call.',
    },
  ],
} as const;
