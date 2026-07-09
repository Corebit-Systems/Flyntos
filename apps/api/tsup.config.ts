import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  noExternal: [
    '@flyntos/config',
    '@flyntos/shared',
    '@flyntos/provider-sdk',
    '@flyntos/search-contracts'
  ]
});
