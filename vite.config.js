import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      // Multi-page: index.html (site principal) + uma entrada por LP nichada
      // de Ads (sites-institucionais.html, landing-pages.html, ...). Sem
      // isso, `vite build` só emite o index.
      input: {
        main: r('./index.html'),
        sitesInstitucionais: r('./sites-institucionais.html'),
        landingPages: r('./landing-pages.html'),
        agentesIA: r('./agentes-ia.html'),
        sitesImersivos: r('./sites-imersivos.html'),
        gestaoGoogleAds: r('./gestao-google-ads.html'),
        lojasVirtuais: r('./lojas-virtuais.html'),
        politicaPrivacidade: r('./politica-de-privacidade.html'),
        termosDeUso: r('./termos-de-uso.html'),
        // Subpáginas de serviço (header/footer da home, mesmo conteúdo das
        // LPs de Ads acima — ver SolutionPageShell.jsx). Alcançadas pelo
        // menu/CTAs da home; as LPs de Ads continuam sendo o destino das
        // campanhas, intocadas.
        solucaoSitesInstitucionais: r('./solucoes/sites-institucionais.html'),
        solucaoLandingPages: r('./solucoes/landing-pages.html'),
        solucaoAgentesIA: r('./solucoes/agentes-ia.html'),
        solucaoSitesImersivos: r('./solucoes/sites-imersivos.html'),
        solucaoGestaoGoogleAds: r('./solucoes/gestao-google-ads.html'),
        solucaoLojasVirtuais: r('./solucoes/lojas-virtuais.html'),
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
