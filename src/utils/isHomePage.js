/* Extraído de Navbar.jsx — usado por qualquer componente compartilhado
   entre a home (App.jsx/SiteShell) e as subpáginas de serviço
   (`/solucoes/*.html`, montadas via SolutionPageShell.jsx), que reaproveita
   Navbar/Footer da home como chrome. Sem essa checagem, um link como
   `href="#contact"` (a seção de contato só existe na home) simplesmente
   não faz nada numa subpágina — o clique fica mudo em vez de navegar pra
   onde a âncora de fato existe. */
export function isHomePage() {
  return (
    typeof window !== 'undefined' &&
    (window.location.pathname === '/' || window.location.pathname === '/index.html')
  );
}
