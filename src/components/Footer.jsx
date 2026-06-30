import { motion } from 'framer-motion';

// ── Ícones sociais inline ────────────────────────────────────────────────────
const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4.5"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);
const IconLinkedIn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
const IconWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/ravennsocial', Icon: IconInstagram },
  { label: 'LinkedIn',  href: 'https://linkedin.com',               Icon: IconLinkedIn  },
  { label: 'WhatsApp',  href: 'https://wa.me/5521999999999',        Icon: IconWhatsApp  },
];

const NAV_COLUMNS = [
  {
    heading: 'Navegação',
    links: [
      { label: 'Serviços',    href: '#services'  },
      { label: 'Resultados',  href: '#portfolio' },
      { label: 'Nossa Visão', href: '#manifesto' },
      { label: 'Processo',    href: '#process'   },
    ],
  },
  {
    heading: 'Soluções',
    links: [
      { label: 'Landing Pages',        href: '#services' },
      { label: 'Sites Institucionais',  href: '#services' },
      { label: 'Branding Digital',      href: '#services' },
      { label: 'Consultoria',           href: '#services' },
    ],
  },
  {
    heading: 'Empresa',
    links: [
      { label: 'Sobre a Ravenn', href: '#manifesto' },
      { label: 'FAQ',            href: '#faq'       },
      { label: 'Contato',        href: '#contact'   },
      { label: 'Diagnóstico',    href: '#contact'   },
    ],
  },
];

// ── Variante padrão do sistema de animação global ────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 40, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

// Stagger cascata para as colunas de navegação
const navGridVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function Footer() {
  return (
    <footer className="relative z-20 w-full bg-[#03000A] overflow-hidden" style={{ borderTop: '1px solid #1E1B4B' }}>

      {/* ── Conteúdo editorial ────────────────────────────────────────────────── */}
      <div className="px-[clamp(32px,5vw,96px)] pt-[clamp(56px,9vh,96px)]">

        {/* ── Grid assimétrico: manifesto + nav ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/[0.05]">

          {/* ── Esquerda: logo + manifesto + socials ─────────────────────────── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            className="lg:col-span-6 flex flex-col gap-8"
          >
            <a href="#hero" style={{ lineHeight: 0, display: 'inline-block' }}>
              <img
                src="/logos-ravenn/logo-raven-white-horizontal1.webp"
                alt="Ravenn Studio"
                width={200}
                height={50}
                style={{ height: 72, width: 'auto', objectFit: 'contain', opacity: 0.85 }}
                draggable={false}
              />
            </a>

            <p className="text-2xl md:text-3xl font-light tracking-tight text-white/90 max-w-lg leading-[1.18]">
              Para marcas que recusam a<br />
              <span style={{ fontStyle: 'italic', color: '#A78BFA' }}>
                invisibilidade digital.
              </span>
            </p>

            <div>
              <hr className="border-white/[0.08] mb-6" />
              <div className="flex items-center gap-5">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-white transition-colors duration-200"
                    style={{ lineHeight: 0 }}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Direita: colunas de links com stagger cascata ────────────────── */}
          <motion.div
            variants={navGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-8"
          >
            {NAV_COLUMNS.map(({ heading, links }) => (
              <motion.div key={heading} variants={fadeUp}>
                <span className="block text-xs uppercase tracking-widest text-white/30 font-medium mb-4">
                  {heading}
                </span>
                <ul className="space-y-2 list-none p-0 m-0">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-sm text-white/60 hover:text-white transition-colors duration-200 no-underline"
                        style={{ textDecoration: 'none' }}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
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
        className="relative flex flex-col md:flex-row justify-between items-center gap-4 px-[clamp(32px,5vw,96px)] pb-6 text-xs text-white/40 font-mono"
        style={{ zIndex: 10, marginTop: '-4vw' }}
      >
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

    </footer>
  );
}
