import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

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
    ],
  },
  {
    rules: {
      'id-length': ['error', { min: 2 }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      'no-console': 'error',
    },
  },
];

export default eslintConfig;
