import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/.next/**',
    '**/dist/**',
    '**/coverage/**',
    '**/.turbo/**',
    '**/src/generated/**',
    '**/next-env.d.ts',
  ]),

  {
    files: ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
  },

  {
    files: [
      'apps/web/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}',
    ],
    extends: [
      ...nextVitals,
    ],
    settings: {
        next: {
            rootDir: 'apps/web/',
        },
    },
  },
  prettierConfig,
]);