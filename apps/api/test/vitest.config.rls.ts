import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/rls.integration-spec.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
