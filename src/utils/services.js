/* Lista canônica dos 6 serviços — única fonte de verdade pro slug/rótulo
   de cada um, usada por qualquer componente que precise linkar pra
   `/solucoes/<slug>.html` (Footer.jsx, MenuPanel.jsx, RelatedServices.jsx).
   Antes cada um desses três lugares tinha sua PRÓPRIA cópia da lista —
   uma delas (Footer.jsx) chegou a ficar desatualizada, com os 6 links
   apontando pro mesmo `#services` genérico em vez da página de cada
   serviço. Uma lista só, importada nos três, elimina a chance de
   divergirem de novo. */
export const SERVICES = [
  { slug: 'sites-institucionais', label: 'Sites Institucionais' },
  { slug: 'landing-pages', label: 'Landing Pages' },
  { slug: 'sites-imersivos', label: 'Sites Experienciais' },
  { slug: 'lojas-virtuais', label: 'Lojas Virtuais' },
  { slug: 'gestao-google-ads', label: 'Google Ads' },
  { slug: 'agentes-ia', label: 'Agentes de IA' },
];

export const solucaoHref = (slug) => `/solucoes/${slug}.html`;
