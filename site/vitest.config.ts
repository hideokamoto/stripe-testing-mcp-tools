import { defineConfig } from 'vitest/config';

// JUnit output is written to site/reports so a CI `store_test_results`
// step can pick it up. The site is a self-contained project inside the
// stripe-testing-mcp-tools monorepo.
export default defineConfig({
  test: {
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './reports/results.xml',
    },
  },
});
