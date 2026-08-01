import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      // Multi-page: index.html (site principal) + sites-institucionais.html
      // (LP dedicada de Ads). Sem isso, `vite build` só emite o index.
      input: {
        main: r('./index.html'),
        sitesInstitucionais: r('./sites-institucionais.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          if (
            id.includes('node_modules/framer-motion') ||
            id.includes('node_modules/motion-dom') ||
            id.includes('node_modules/motion-utils')
          ) {
            return 'motion-vendor';
          }
        },
      },
    },
  },
});
