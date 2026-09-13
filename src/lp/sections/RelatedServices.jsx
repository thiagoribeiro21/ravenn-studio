import { SERVICES, solucaoHref } from '../../utils/services';

/* Só existe link contextual da Home pras 6 páginas de serviço (o botão
   "Explorar Serviço" de CapabilitiesSection.jsx) — nenhum link ENTRE as
   páginas de serviço entre si, nem de volta pra Home. Motor de busca (e
   quem navega) chega numa dessas páginas e fica num beco sem saída, sem
   rastro pro resto do site. Esta seção fecha esse buraco: renderiza as
   outras 5 (nunca a própria — comparação de slug via pathname, já que o
   `config` de cada LP não carrega o próprio slug) como links reais de
   página, com texto âncora = nome do serviço (relevante pra intenção de
   busca, não um genérico "saiba mais"). Só é montada dentro de
   `SolutionPageShell.jsx` (subpáginas indexáveis `/solucoes/*.html`) — as
   6 LPs de Ads (`LPShell.jsx`) são `noindex`, então não faz sentido gastar
   PageRank interno linkando a partir delas. */
export default function RelatedServices() {
  const currentSlug =
    typeof window !== 'undefined'
      ? window.location.pathname.replace(/^\/solucoes\//, '').replace(/\.html$/, '')
      : null;

  const others = SERVICES.filter((s) => s.slug !== currentSlug);

  return (
    <section
      aria-labelledby="related-services-heading"
      className="relative border-t border-white/[0.06] px-8 py-16 md:px-16 md:py-20"
    >
      <h2
        id="related-services-heading"
        className="font-grotesk text-sm font-medium uppercase tracking-widest2 text-rv-slate"
      >
        Outras soluções Revana Studio
      </h2>

      <ul className="mt-7 flex flex-wrap gap-3">
        {others.map(({ slug, label }) => (
          <li key={slug}>
            <a
              href={solucaoHref(slug)}
              className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.02] px-5 py-2.5 font-satoshi text-sm text-rv-titanium transition-colors duration-300 hover:border-rv-purple-400/50 hover:text-rv-purple-400"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
