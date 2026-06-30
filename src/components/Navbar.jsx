import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../context/MenuContext';

function MenuIcon({ isOpen, large }) {
  const w      = large ? 28 : 22;
  const h      = large ? 20 : 16;
  const line   = large ? 2   : 1.5;
  const short  = large ? 18  : 15;
  const offset = large ? 4.5 : 3.5;

  return (
    <span
      aria-hidden
      style={{
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        alignItems:     'flex-end',
        width:          w,
        height:         h,
        position:       'relative',
        flexShrink:     0,
        transition:     'width 400ms cubic-bezier(0.16,1,0.3,1), height 400ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <span style={{
        display:         'block',
        height:          line,
        background:      '#F8F9FA',
        borderRadius:    1,
        width:           w,
        transformOrigin: 'center',
        transition:      'transform 320ms cubic-bezier(0.16,1,0.3,1), width 400ms cubic-bezier(0.16,1,0.3,1)',
        transform:       isOpen ? `translateY(${offset}px) rotate(45deg)` : 'translateY(0)',
        position:        'absolute',
        top:             '30%',
      }} />
      <span style={{
        display:      'block',
        height:       line,
        width:        short,
        background:   '#F8F9FA',
        borderRadius: 1,
        position:     'absolute',
        top:          '68%',
        right:        0,
        transition:   'opacity 200ms ease, transform 320ms cubic-bezier(0.16,1,0.3,1), width 400ms cubic-bezier(0.16,1,0.3,1)',
        opacity:      isOpen ? 0 : 1,
        transform:    isOpen ? `translateY(-${offset}px) rotate(-45deg)` : 'translateY(0)',
      }} />
    </span>
  );
}

export default function Navbar() {
  const { isOpen, toggleMenu, scrolled } = useMenu();

  /*
    pill = scrolled && !isOpen
    ─────────────────────────────────────────────────────────────────
    A pílula de vidro só aparece quando o header está sticky E o menu
    está fechado. Com o menu aberto, o SiteShell encolhe e a pílula
    ficaria deformada — forçamos visual totalmente transparente nesse caso.
  */
  const pill = scrolled && !isOpen;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position:   'sticky',
        top:        0,
        zIndex:     50,
        background: 'transparent',
        border:     'none',
        boxShadow:  'none',
        // top-6 (24px) de espaço acima da pílula; zero quando expandido ou menu aberto
        padding:    pill ? '24px 0 0' : '0',
        transition: 'padding 420ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/*
        Container interno.
        'relative' é obrigatório para o position:absolute da logo funcionar.

        DOM order: [Menu btn] [Logo] [CTA]
        Mobile  (< md): Logo LEFT | Menu RIGHT (ml-auto)       sem CTA
        Desktop (≥ md): Logo ABSOLUTE CENTER | Menu LEFT | CTA RIGHT
      */}
      <div
        className="relative flex items-center justify-between"
        style={{
          width:                pill ? '92%'   : '100%',
          maxWidth:             pill ? '64rem' : 'none',
          margin:               '0 auto',
          padding:              pill ? '12px'  : '20px clamp(24px,5vw,72px)',
          borderRadius:         pill ? 9999    : 0,
          background:           pill ? 'rgba(5,3,10,0.60)' : 'transparent',
          backdropFilter:       pill ? 'blur(24px) saturate(1.4)' : 'none',
          WebkitBackdropFilter: pill ? 'blur(24px) saturate(1.4)' : 'none',
          boxShadow:            pill
            ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)'
            : 'none',
          borderColor:          pill ? 'rgba(255,255,255,0.05)' : 'transparent',
          border:               '1px solid transparent',
          // Quando o menu abre: revert instantâneo (sem transição).
          // Quando fecha: anima suavemente de volta para a pílula.
          transition: isOpen ? 'none' : [
            'width 420ms cubic-bezier(0.16,1,0.3,1)',
            'max-width 420ms cubic-bezier(0.16,1,0.3,1)',
            'padding 420ms cubic-bezier(0.16,1,0.3,1)',
            'border-radius 420ms cubic-bezier(0.16,1,0.3,1)',
            'background 420ms cubic-bezier(0.16,1,0.3,1)',
            'box-shadow 420ms cubic-bezier(0.16,1,0.3,1)',
            'border-color 420ms cubic-bezier(0.16,1,0.3,1)',
          ].join(', '),
        }}
      >

        {/* ── Logo: mobile=esquerda (flux normal), desktop=centro absoluto ── */}
        <a
          href="#hero"
          className="md:absolute md:left-1/2 md:-translate-x-1/2"
          style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}
        >
          <img
            src="/logos-ravenn/logo-raven-white-horizontal1.png"
            alt="Ravenn Studio"
            width={200}
            height={50}
            style={{
              height:     pill ? 30 : 'clamp(44px,4vw,60px)',
              width:      'auto',
              objectFit:  'contain',
              display:    'block',
              transition: 'height 400ms cubic-bezier(0.16,1,0.3,1)',
            }}
            draggable={false}
          />
        </a>

        {/* ── Menu button: mobile=direita (ml-auto), desktop=esquerda ── */}
        <button
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isOpen}
          onClick={toggleMenu}
          className={`ml-auto md:order-first ${pill ? 'md:ml-4' : 'md:ml-0'}`}
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        pill ? 10 : 13,
            background: 'none',
            border:     'none',
            padding:    '4px 0',
            cursor:     'pointer',
            color:      '#F8F9FA',
            flexShrink: 0,
            transition: 'gap 420ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <MenuIcon isOpen={isOpen} large={!pill} />
          <AnimatePresence mode="wait">
            <motion.span
              key={isOpen ? 'fechar' : 'menu'}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.20, ease: 'easeOut' }}
              style={{
                fontSize:      pill ? 10 : 11,
                fontWeight:    500,
                textTransform: 'uppercase',
                letterSpacing: '0.26em',
                color:         'rgba(255,255,255,0.55)',
                lineHeight:    1,
                userSelect:    'none',
              }}
            >
              {isOpen ? 'FECHAR' : 'MENU'}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* ── CTA: só desktop, SEMPRE visível (sem condicional de isOpen) ── */}
        {/*
          rounded-full: acompanha a forma da pílula.
          Estilo restaurado: violet #7C3AED, uppercase, letterSpacing 0.18em.
          Sem AnimatePresence / sem {!isOpen && ...} — sempre renderizado.
        */}
        <div className="hidden md:block" style={{ marginLeft: 'auto' }}>
          <a
            href="#contact"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              height:         pill ? 34 : 44,
              padding:        pill
                ? '0 clamp(12px,1.5vw,20px)'
                : '0 clamp(18px,2vw,32px)',
              fontSize:       pill ? 10 : 11,
              fontWeight:     500,
              textTransform:  'uppercase',
              letterSpacing:  '0.18em',
              background:     '#7C3AED',
              color:          '#fff',
              borderRadius:   9999,        // rounded-full
              textDecoration: 'none',
              whiteSpace:     'nowrap',
              transition:     'background 250ms ease, box-shadow 250ms ease, height 420ms cubic-bezier(0.16,1,0.3,1), padding 420ms cubic-bezier(0.16,1,0.3,1)',
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
            Agendar Diagnóstico
          </a>
        </div>

      </div>
    </motion.header>
  );
}
