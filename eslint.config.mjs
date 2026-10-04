import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const features = ['content-panel', 'portfolio', 'quick-access-menu', 'solar-scene'];

/** `no-restricted-imports` entry that forbids reaching into other features or into the app layer. */
const restrictImports = (patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

const forbidApp = {
  group: ['@/app', '@/app/**'],
  message: 'Features and shared code must not depend on the app layer (routes).',
};

const forbidAllFeatures = {
  group: ['@/features', '@/features/**'],
  message: 'Shared code (lib, hooks, design-system, content) must not depend on features.',
};

const forbidDeepFeatureImports = {
  group: ['@/features/*/*'],
  message: "Import from the feature's index (public API), not from its internals.",
};

// Features are isolated from each other; only `portfolio` (the composition layer) may use the others,
// and only through their public index. Shared code never depends on features.
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
      'src/lib/**',
      'src/hooks/**',
      'src/design-system/**',
      'src/content/**',
      'src/services/**',
    ],
    rules: restrictImports([forbidApp, forbidAllFeatures]),
  },
  { files: ['scripts/**'], rules: { 'no-console': 'off' } },
];

export default eslintConfig;
