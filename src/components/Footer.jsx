import { motion } from 'framer-motion';

// ── Navegação principal — espelha as seções reais do site (ver App.jsx) ──
const NAV_LINKS = [
  { label: 'Início',    href: '#hero',      title: 'Voltar ao início — Ravenn Studio' },
  { label: 'Portfólio', href: '#portfolio', title: 'Ver projetos e cases da Ravenn Studio' },
  { label: 'Serviços',  href: '#services',  title: 'Ver os serviços da Ravenn Studio' },
  { label: 'Método',    href: '#processo',  title: 'Conhecer o processo de trabalho da Ravenn Studio' },
  { label: 'FAQ',       href: '#faq',       title: 'Perguntas frequentes sobre a Ravenn Studio' },
  { label: 'Contato',   href: '#contact',   title: 'Falar com a Ravenn Studio' },
];

// ── Todos os serviços atuais (espelha CapabilitiesSection) — títulos com
// palavras-chave de SEO local pra reforçar contexto pros mecanismos de busca ─
const CORE_SERVICES = [
  { label: 'Sites Institucionais',   href: '#services', title: 'Sites institucionais premium com SEO Local, Google Business e Core Web Vitals' },
  { label: 'Landing Pages',          href: '#services', title: 'Landing pages de alta conversão para campanhas de Google Ads' },
  { label: 'Sites Experienciais',    href: '#services', title: 'Sites experienciais e imersivos com WebGL e Three.js' },
  { label: 'Cardápios Digitais',     href: '#services', title: 'Cardápios digitais mobile-first integrados ao WhatsApp' },
  { label: 'Google Ads',             href: '#services', title: 'Gestão de Google Ads de alta performance orientada a ROAS' },
  { label: 'Agentes de IA',          href: '#services', title: 'Agentes de IA e automação de atendimento via WhatsApp' },
];

// ── Contato ───────────────────────────────────────────────────────────────
const CONTACT_LINKS = [
  { label: 'contato@ravennstudio.com', href: 'mailto:contato@ravennstudio.com', title: 'Enviar e-mail para a Ravenn Studio' },
  { label: 'WhatsApp',                 href: 'https://wa.me/5521989211887',     title: 'Falar com a Ravenn Studio pelo WhatsApp' },
  { label: '+55 21 98921-1887',        href: 'tel:+5521989211887',             title: 'Ligar para a Ravenn Studio' },
];

// ── Variante padrão do sistema de animação global ────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 32, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerColumns = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Footer() {
  return (
    <footer className="relative z-20 w-full bg-black overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

      {/* ── Conteúdo editorial ─── extrema respiração vertical ─────────────── */}
      <div className="px-[clamp(32px,6vw,120px)] pt-[clamp(80px,14vh,160px)] pb-[clamp(56px,8vh,96px)]">

        <motion.div
          variants={staggerColumns}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-y-16 gap-x-12"
        >
          {/* ── Logo + assinatura ─────────────────────────────────────────── */}
          <motion.div variants={fadeUp} className="lg:col-span-5 flex flex-col gap-10">
            <a href="#hero" style={{ lineHeight: 0, display: 'inline-block' }}>
              <img
                src="/logo-ravenn/logo-ravenn-studio-horizontal.webp"
                alt="Ravenn Studio"
                width={200}
                height={50}
                style={{ height: 88, width: 'auto', objectFit: 'contain', opacity: 0.85 }}
                draggable={false}
              />
            </a>

            <p className="text-xl md:text-2xl font-light tracking-tight text-white/70 max-w-sm leading-[1.3]">
              Para marcas que recusam a{' '}
              <span style={{ fontStyle: 'italic', color: '#A78BFA' }}>invisibilidade digital.</span>
            </p>
          </motion.div>

          {/* ── Navegação ─────────────────────────────────────────────────── */}
          <motion.nav variants={fadeUp} aria-label="Navegação principal" className="lg:col-span-2">
            <span className="block text-[11px] uppercase tracking-widest text-white/25 font-medium mb-6">
              Navegação
            </span>
            <ul className="list-none p-0 m-0 space-y-3.5">
              {NAV_LINKS.map(({ label, href, title }) => (
                <li key={label}>
                  <a
                    href={href}
                    title={title}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-300 no-underline"
                    style={{ textDecoration: 'none' }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* ── Serviços ──────────────────────────────────────────────────── */}
          <motion.nav variants={fadeUp} aria-label="Nossos Serviços" className="lg:col-span-3">
            <span className="block text-[11px] uppercase tracking-widest text-white/25 font-medium mb-6">
              Serviços
            </span>
            <ul className="list-none p-0 m-0 space-y-3.5">
              {CORE_SERVICES.map(({ label, href, title }) => (
                <li key={label}>
                  <a
                    href={href}
                    title={title}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-300 no-underline"
                    style={{ textDecoration: 'none' }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* ── Contato ───────────────────────────────────────────────────── */}
          <motion.nav variants={fadeUp} aria-label="Contato e Atendimento" className="lg:col-span-2">
            <span className="block text-[11px] uppercase tracking-widest text-white/25 font-medium mb-6">
              Contato
            </span>
            <ul className="list-none p-0 m-0 space-y-3.5">
              {CONTACT_LINKS.map(({ label, href, title }) => {
                const isExternal = href.startsWith('http');
                return (
                  <li key={label}>
                    <a
                      href={href}
                      title={title}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-300 no-underline"
                      style={{ textDecoration: 'none' }}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        </motion.div>
      </div>

      {/*
        ── RAVENN monumental ────────────────────────────────────────────────────
        z-0: fica atrás do sub-footer (z-10) que vem logo após no DOM.
        Gradiente vertical topo→base: as letras surgem discretamente no topo
        e se dissolvem em transparente na base — sem corte duro.
        Stroke sutilíssimo reforça as arestas sem criar opacidade sólida.
      */}
      <motion.div
        aria-hidden
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        className="relative"
        style={{ zIndex: 0, lineHeight: 0, marginTop: 40, overflow: 'clip' }}
      >
        <motion.span
          variants={{
            hidden: {
              y:      '108%',
              filter: 'blur(12px)',
            },
            visible: {
              y:      0,
              filter: 'blur(0px)',
              transition: {
                y:      { duration: 1.6, ease: [0.16, 1, 0.3, 1] },
                filter: { duration: 1.1, ease: 'easeOut', delay: 0.15 },
              },
            },
          }}
          className="block bg-gradient-to-b from-white/[0.06] to-transparent bg-clip-text text-transparent"
          style={{
            fontWeight:       900,
            textTransform:    'uppercase',
            userSelect:       'none',
            fontSize:         'clamp(88px, 15vw, 240px)',
            letterSpacing:    '-0.05em',
            lineHeight:       0.82,
            textAlign:        'center',
            WebkitTextStroke: '1px rgba(255,255,255,0.06)',
            paintOrder:       'stroke fill',
          }}
        >
          RAVENN
        </motion.span>
      </motion.div>

      {/*
        ── Sub-footer ──────────────────────────────────────────────────────────
        position: relative + z-index: 10 → flutua sobre o RAVENN (z-0).
        marginTop: -4vw → puxa o sub-footer para dentro da área do texto
        gigante, criando o efeito de moldura de fechamento da página.
      */}
      <div
        className="relative flex flex-col items-center gap-3 px-[clamp(32px,5vw,96px)] pb-8 text-center"
        style={{ zIndex: 10, marginTop: '-4vw' }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full text-xs text-white/40 font-mono">
          <span>© 2026 RAVENN STUDIO. Todos os direitos reservados.</span>
          <div className="flex gap-6">
            {['Política de Privacidade', 'Termos de Uso'].map((l) => (
              <a
                key={l}
                href="#"
                className="hover:text-white/70 transition-colors duration-200"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
