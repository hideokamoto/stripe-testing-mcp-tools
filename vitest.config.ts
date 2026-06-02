import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Only test the MCP server source. The site/ project owns its own vitest
    // run (pnpm), and build/ holds compiled output.
    include: ['src/**/*.test.ts'],
  },
});
