import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

import { buildRobotsTxt, isStaging, NOT_INDEXABLE } from './src/lib/seo/robots.js';

// Covers crawlers that do not run JavaScript; use-robots-meta handles
// per-route indexability once the SPA has booted.
const robots = (staging) => ({
  name: 'studysphere-robots',

  transformIndexHtml: () =>
    staging
      ? [{ tag: 'meta', attrs: { name: 'robots', content: NOT_INDEXABLE }, injectTo: 'head' }]
      : [],

  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: buildRobotsTxt(staging) });
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '');

  return {
    plugins: [react(), tailwindcss(), robots(isStaging(env.VITE_STAGING))],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});
