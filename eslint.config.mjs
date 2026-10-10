import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const features = [
  'about-section',
  'contact-section',
  'content-panel',
  'portfolio',
  'quick-access-menu',
  'solar-scene',
  'target-lock',
];

const restrictImports = (patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

const forbidApp = {
  group: ['@/app', '@/app/**'],
  message: 'Features and shared code must not depend on the app layer (routes).',
};

const forbidAllFeatures = {
  group: ['@/features', '@/features/**'],
  message:
    'Shared code (components, styles, domain, lib, hooks, content, services) must not depend on features.',
};

const forbidDeepFeatureImports = {
  group: ['@/features/*/*'],
  message: "Import from the feature's index (public API), not from its internals.",
};

const featureBoundaries = features
  .filter((feature) => feature !== 'portfolio')
  .map((feature) => ({
    files: [`src/features/${feature}/**`],
    rules: restrictImports([
      forbidApp,
      {
        group: features
          .filter((other) => other !== feature)
          .flatMap((other) => [`@/features/${other}`, `@/features/${other}/**`]),
        message: 'Features cannot import each other; compose them in `features/portfolio`.',
      },
    ]),
  }));

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'screenshots/**',
      'playwright-report/**',
      'test-results/**',
      'design/**',
    ],
  },
  {
    rules: {
      'id-length': ['error', { min: 2, properties: 'never' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      'no-console': 'error',
    },
  },
  ...featureBoundaries,
  {
    files: ['src/features/portfolio/**'],
    rules: restrictImports([forbidApp, forbidDeepFeatureImports]),
  },
  { files: ['src/app/**'], rules: restrictImports([forbidDeepFeatureImports]) },
  {
    files: [
      'src/components/**',
      'src/styles/**',
      'src/domain/**',
      'src/lib/**',
      'src/hooks/**',
      'src/content/**',
      'src/services/**',
    ],
    rules: restrictImports([forbidApp, forbidAllFeatures]),
  },
  { files: ['scripts/**'], rules: { 'no-console': 'off' } },
];

export default eslintConfig;
