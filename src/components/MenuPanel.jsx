import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../context/MenuContext';

const WA_LINK = 'https://wa.me/5521999999999?text=Olá%2C%20quero%20agendar%20um%20diagnóstico%20gratuito%20com%20a%20Ravenn%20Studio.';

const SUB_LINKS = [
  { label: 'Sites e Landing Pages',         href: '#services' },
  { label: 'Lojas Virtuais (E-commerce)',    href: '#services' },
  { label: 'Gestão de Tráfego Local',        href: '#services' },
  { label: 'Agentes de IA e Automação',      href: '#services' },
];

const NAV_LINKS = [
  { label: 'Início',   href: '#hero',     sub: null },
  { label: 'Soluções', href: null,        sub: SUB_LINKS },
  { label: 'Método',   href: '#process',  sub: null },
  { label: 'Contato',  href: '#contact',  sub: null },
];

const listVariants = {
  closed: {},
  open:   { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};
const linkVariants = {
  closed: { opacity: 0, y: 20 },
  open:   { opacity: 1, y: 0  },
};

// ── Ícone chevron ─────────────────────────────────────────────────────────────
function Chevron({ open }) {
  return (
    <motion.svg
      width="14" height="14" viewBox="0 0 14 14" fill="none"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ flexShrink: 0 }}
    >
      <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

// ── Sub-item ──────────────────────────────────────────────────────────────────
function SubItem({ label, href, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.a
      href={href}
      onClick={onClick}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display:        'block',
        fontSize:       'clamp(20px, 2.2rem, 28px)',
        fontWeight:     300,
        letterSpacing:  '-0.01em',
        lineHeight:     1.2,
        color:          hovered ? '#fff' : 'rgba(255,255,255,0.48)',
        textDecoration: 'none',
        padding:        '6px 0',
        transform:      hovered ? 'translateX(8px)' : 'translateX(0)',
        transition:     'color 220ms ease, transform 260ms cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </motion.a>
  );
}

export default function MenuPanel() {
  const { isOpen, closeMenu, scrollContainerRef } = useMenu();
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  const handleNav = useCallback((e, href) => {
    e.preventDefault();
    closeMenu();
    setSolutionsOpen(false);
    setTimeout(() => {
      const el  = document.querySelector(href);
      const cnt = scrollContainerRef.current;
      if (!el || !cnt) return;
      const offset = el.getBoundingClientRect().top - cnt.getBoundingClientRect().top + cnt.scrollTop;
      cnt.scrollTo({ top: offset, behavior: 'smooth' });
    }, 480);
  }, [closeMenu, scrollContainerRef]);

  return (
    <div
      aria-hidden={!isOpen}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         5,
        display:        'flex',
        justifyContent: 'flex-end',
        alignItems:     'center',
        pointerEvents:  isOpen ? 'auto' : 'none',
        background:     '#03000A',
      }}
    >
      {/* Aura violeta */}
      <div
        aria-hidden
        style={{
          position:      'absolute',
          top:           '25%',
          right:         '5%',
          width:         500,
          height:        500,
          borderRadius:  '50%',
          background:    'radial-gradient(circle, rgba(76,29,149,0.22) 0%, transparent 65%)',
          filter:        'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Botão Fechar (canto superior direito) ───────────────────── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ delay: isOpen ? 0.28 : 0, duration: 0.30 }}
        onClick={closeMenu}
        aria-label="Fechar menu"
        style={{
          position:      'absolute',
          top:           28,
          right:         28,
          display:       'flex',
          alignItems:    'center',
          gap:           10,
          background:    'rgba(255,255,255,0.04)',
          border:        '1px solid rgba(255,255,255,0.10)',
          borderRadius:  999,
          cursor:        'pointer',
          color:         'rgba(255,255,255,0.70)',
          fontSize:      11,
          fontWeight:    500,
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
          padding:       '10px 20px 10px 16px',
          zIndex:        10,
          transition:    'color 200ms ease, background 200ms ease, border-color 200ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color       = '#fff';
          e.currentTarget.style.background  = 'rgba(255,255,255,0.09)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color       = 'rgba(255,255,255,0.70)';
          e.currentTarget.style.background  = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
        }}
      >
        {/* X desenhado em SVG — espessura controlada */}
        <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="1" y1="1" x2="13" y2="13" />
          <line x1="13" y1="1" x2="1"  y2="13" />
        </svg>
        <span>FECHAR</span>
      </motion.button>

      {/* Conteúdo */}
      <div
        style={{
          width:          'clamp(280px, 30vw, 480px)',
          padding:        'clamp(40px, 5vw, 72px)',
          display:        'flex',
          flexDirection:  'column',
          justifyContent: 'center',
          height:         '100%',
          position:       'relative',
          zIndex:         1,
        }}
      >
        {/* Nav links */}
        <motion.nav
          variants={listVariants}
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
        >
          {NAV_LINKS.map(({ label, href, sub }) => (
            <motion.div
              key={label}
              variants={linkVariants}
              transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginBottom: 4 }}
            >
              {sub ? (
                /* ── Soluções: botão accordion ────────────────────────── */
                <div>
                  <button
                    onClick={() => setSolutionsOpen((v) => !v)}
                    className="group flex items-center gap-3 w-full text-left"
                    style={{
                      background:    'none',
                      border:        'none',
                      padding:       '0 0 4px',
                      cursor:        'pointer',
                      color:         solutionsOpen ? '#A78BFA' : 'rgba(255,255,255,0.90)',
                      transition:    'color 280ms ease',
                    }}
                  >
                    <span
                      style={{
                        fontSize:      'clamp(32px, 5vw, 56px)',
                        fontWeight:    300,
                        lineHeight:    1.15,
                        letterSpacing: '-0.02em',
                        fontStyle:     solutionsOpen ? 'italic' : 'normal',
                        transition:    'font-style 200ms ease',
                      }}
                    >
                      {label}
                    </span>
                    <span style={{ color: solutionsOpen ? '#A78BFA' : 'rgba(255,255,255,0.35)', marginTop: 4, transition: 'color 280ms ease' }}>
                      <Chevron open={solutionsOpen} />
                    </span>
                  </button>

                  {/* Sub-menu accordion */}
                  <AnimatePresence>
                    {solutionsOpen && (
                      <motion.div
                        key="solutions-sub"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            borderLeft:  '1px solid rgba(255,255,255,0.10)',
                            marginLeft:  8,
                            paddingLeft: 18,
                            marginTop:   10,
                            marginBottom: 8,
                            display:     'flex',
                            flexDirection: 'column',
                            gap:         2,
                          }}
                        >
                          {sub.map(({ label: sl, href: sh }) => (
                            <SubItem
                              key={sl}
                              label={sl}
                              href={sh}
                              onClick={(e) => handleNav(e, sh)}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* ── Links normais ────────────────────────────────────── */
                <a
                  href={href}
                  onClick={(e) => handleNav(e, href)}
                  className="group block"
                  style={{ textDecoration: 'none' }}
                >
                  <span
                    className={[
                      'block font-light leading-tight tracking-tight',
                      'text-white/90 transition-all duration-300',
                      'group-hover:text-purple-400 group-hover:italic',
                    ].join(' ')}
                    style={{
                      fontSize:  'clamp(32px, 5vw, 56px)',
                      lineHeight: 1.15,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    className="block h-px bg-purple-400/60 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
                    aria-hidden
                  />
                </a>
              )}
            </motion.div>
          ))}
        </motion.nav>

        {/* CTA destacado */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 16 }}
          transition={{ delay: isOpen ? 0.38 : 0, duration: 0.45 }}
          style={{ marginTop: 'clamp(20px, 4vh, 36px)' }}
        >
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            10,
              width:          '100%',
              height:         50,
              background:     '#7C3AED',
              color:          '#fff',
              borderRadius:   4,
              fontSize:       11,
              fontWeight:     500,
              textTransform:  'uppercase',
              letterSpacing:  '0.18em',
              textDecoration: 'none',
              transition:     'background 250ms ease, box-shadow 250ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#8B5CF6';
              e.currentTarget.style.boxShadow  = '0 0 28px -4px rgba(124,58,237,0.65)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#7C3AED';
              e.currentTarget.style.boxShadow  = 'none';
            }}
          >
            <svg aria-hidden width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Agendar Diagnóstico
          </a>
        </motion.div>

        {/* Contato */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ delay: isOpen ? 0.50 : 0, duration: 0.40 }}
          style={{ marginTop: 16 }}
        >
          <div style={{ width: 40, height: 1, background: 'linear-gradient(to right, rgba(124,58,237,0.50), transparent)', marginBottom: 14 }} />
          <a
            href="mailto:contato@ravennsocial.com"
            style={{ display: 'block', fontSize: 11, letterSpacing: '0.10em', color: 'rgba(255,255,255,0.40)', textDecoration: 'none', marginBottom: 6, transition: 'color 200ms', fontFamily: 'monospace' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.80)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; }}
          >
            contato@ravennsocial.com
          </a>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', fontSize: 11, letterSpacing: '0.10em', color: 'rgba(255,255,255,0.40)', textDecoration: 'none', transition: 'color 200ms', fontFamily: 'monospace' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#A78BFA'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; }}
          >
            WhatsApp: +55 21 99999-9999
          </a>
        </motion.div>
      </div>
    </div>
  );
}
