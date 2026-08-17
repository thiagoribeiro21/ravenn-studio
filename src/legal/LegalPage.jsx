import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { EASE_LUXE, GX, prefersReducedMotion } from '../lp/config/_base';

/* ══════════════════════════════════════════════════════════════════════════
   Shell compartilhado por Política de Privacidade e Termos de Uso — as duas
   são páginas de conteúdo puro (texto jurídico), não "landing pages", então
   deliberadamente NÃO reaproveitam `LPShell.jsx`: sem scroll-jacking, sem
   Lenis, sem canvas WebGL, sem autoplay — nada disso serve leitura de texto
   longo, e cada uma dessas coisas é peso (JS, CPU, bateria) que uma página
   jurídica não deveria pagar. O visual (fundo `rv-void`, tipografia
   grotesk/satoshi, tokens de cor) é o MESMO da marca porque a página
   continua sendo Ravenn Studio — só a mecânica por trás é mais simples.

   `overflow-y:auto` direto na raiz (em vez de `data-lp-scroller` + Lenis):
   `index.css` zera overflow em html/body globalmente (todo entry point do
   build depende de algum container próprio dar o scroll — ver comentário
   no topo do arquivo), então esta página precisa da SUA versão disso, só
   que com scroll nativo puro — não existe nenhuma seção aqui que precise
   ler posição de scroll por frame (nenhum `useTrackProgress`), então Lenis
   seria only overhead sem benefício percebido num documento de leitura.
   ══════════════════════════════════════════════════════════════════════════ */

function fadeProps(reduce, delay = 0) {
  if (reduce) return {};
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.6, delay, ease: EASE_LUXE },
  };
}

export function P({ children }) {
  return <p className="mt-4 font-satoshi text-[16px] leading-[1.7] text-rv-slate first:mt-0">{children}</p>;
}

export function H3({ children }) {
  return (
    <h3 className="mt-8 font-grotesk text-[19px] font-medium leading-snug text-rv-titanium first:mt-0">{children}</h3>
  );
}

export function UL({ items }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 font-satoshi text-[16px] leading-[1.7] text-rv-slate">
          <span aria-hidden className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full bg-rv-purple-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Header() {
  return (
    <header className="border-b border-white/[0.06]">
      <div className={`mx-auto flex max-w-6xl items-center justify-between py-5 ${GX}`}>
        <a href="/" aria-label="Voltar à página inicial — Ravenn Studio">
          <img
            src="/logo-ravenn/logo-ravenn-studio-horizontal.webp"
            alt="Ravenn Studio"
            width={200}
            height={50}
            className="h-7 w-auto opacity-90"
          />
        </a>
        <a
          href="/"
          className="font-satoshi text-[14px] font-medium text-rv-slate transition-colors duration-300 hover:text-rv-titanium"
        >
          ← Voltar ao site
        </a>
      </div>
    </header>
  );
}

function Toc({ sections }) {
  return (
    <nav aria-label="Sumário" className="hidden lg:col-span-3 lg:block">
      <div className="sticky top-10">
        <span className="block font-satoshi text-[13px] font-medium uppercase tracking-widest2 text-rv-faint">
          Sumário
        </span>
        <ul className="mt-5 space-y-1 border-l border-white/[0.08]">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block border-l-2 border-transparent py-1.5 pl-4 font-satoshi text-[14px] leading-snug text-rv-slate transition-colors duration-200 hover:border-rv-purple-400/50 hover:text-rv-titanium"
              >
                {s.heading}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/* Sumário mobile — `<details>` nativo: zero JS, acessível de fábrica
   (teclado, leitor de tela já sabem lidar com `<details>`/`<summary>`), e
   some sozinho do fluxo quando fechado, sem competir por espaço com o
   conteúdo. A versão desktop (`Toc`) é uma barra lateral fixa porque ali
   sobra espaço; no mobile o mesmo formato empurraria o texto real pra
   baixo da dobra. */
function TocMobile({ sections }) {
  return (
    <details className="mb-10 rounded-2xl border border-white/10 bg-white/[0.02] lg:hidden">
      <summary className="cursor-pointer select-none px-5 py-4 font-satoshi text-[14px] font-medium text-rv-titanium">
        Sumário
      </summary>
      <ul className="space-y-1 px-5 pb-5">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="block py-1.5 font-satoshi text-[14px] text-rv-slate">
              {s.heading}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

function LegalFooter({ otherDoc }) {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className={`mx-auto flex max-w-6xl flex-col items-center gap-4 py-10 text-center md:flex-row md:justify-between md:text-left ${GX}`}>
        <p className="font-satoshi text-[14px] text-rv-faint">
          © {new Date().getFullYear()} Ravenn Studio. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-6">
          <a
            href={otherDoc.href}
            className="font-satoshi text-[14px] text-rv-slate transition-colors duration-300 hover:text-rv-titanium"
          >
            {otherDoc.label}
          </a>
          <a
            href="mailto:contato@ravennstudio.com"
            className="font-satoshi text-[14px] text-rv-slate transition-colors duration-300 hover:text-rv-titanium"
          >
            contato@ravennstudio.com
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function LegalPage({ title, lastUpdated, sections, otherDoc }) {
  const reduce = useMemo(() => prefersReducedMotion(), []);

  return (
    <div className="min-h-dvh-fix scroll-smooth bg-rv-void font-grotesk text-rv-titanium" style={{ height: '100dvh', overflowY: 'auto' }}>
      <Header />

      <main className={`mx-auto max-w-6xl py-14 md:py-20 ${GX}`}>
        <motion.div {...fadeProps(reduce)}>
          <h1 className="font-grotesk text-[clamp(2rem,4vw,3rem)] font-light leading-[1.1] tracking-[-0.02em] text-rv-titanium">
            {title}
          </h1>
          <p className="mt-4 font-satoshi text-[15px] text-rv-faint">Última atualização: {lastUpdated}</p>
        </motion.div>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Toc sections={sections} />

          <div className="lg:col-span-9">
            <TocMobile sections={sections} />

            {sections.map((s, i) => (
              <motion.section key={s.id} id={s.id} className="scroll-mt-10 border-t border-white/[0.06] pt-10 first:border-t-0 first:pt-0" {...fadeProps(reduce, Math.min(i * 0.03, 0.2))}>
                <h2 className="font-grotesk text-[22px] font-medium leading-snug text-rv-titanium md:text-[24px]">
                  {s.heading}
                </h2>
                <div className="mt-4">{s.body}</div>
              </motion.section>
            ))}
          </div>
        </div>
      </main>

      <LegalFooter otherDoc={otherDoc} />
    </div>
  );
}
