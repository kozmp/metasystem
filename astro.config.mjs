// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react({
      include: ['**/react/*', '**/cybernetics/**/*.tsx', '**/components/**/*.tsx'],
    }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'server', // Wymagane dla API endpoints

  // Konfiguracja Vite dla Rust/Wasm
  vite: {
    plugins: [
      wasm(),
      topLevelAwait(),
    ],
    // Optymalizacja dla Wasm
    optimizeDeps: {
      exclude: ['wasm_core'], // Nie optymalizuj modułu Wasm
    },
    // Worker dla Wasm (opcjonalnie)
    worker: {
      format: 'es',
      plugins: () => [wasm(), topLevelAwait()],
    },
  },
});
