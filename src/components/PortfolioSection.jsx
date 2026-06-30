import { motion } from 'framer-motion';
import LaptopMockup from './LaptopMockup';

export default function PortfolioSection() {
  return (
    <section
      id="portfolio"
      className="min-h-screen flex flex-col items-center justify-center bg-[#03000A] overflow-hidden border-t border-[#1E1B4B] gap-6 py-10 px-0 md:gap-[clamp(36px,5vh,60px)] md:py-[clamp(48px,8vh,80px)] md:px-[clamp(24px,4vw,48px)]"
    >

      {/* ── Header centralizado ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: false, amount: 0.15 }}
        className="text-center px-6 md:px-0"
        style={{ maxWidth: 600 }}
      >
        <span style={{
          fontSize:      10,
          fontWeight:    500,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color:         'rgba(255,255,255,0.32)',
          display:       'block',
          marginBottom:  20,
        }}>
          — Padrão de Engenharia
        </span>

        <h2 style={{
          fontSize:      'clamp(26px, 3.6vw, 52px)',
          fontWeight:    300,
          letterSpacing: '-0.025em',
          lineHeight:    1.06,
          color:         '#F8F9FA',
          margin:        '0 0 16px',
          textWrap:      'balance',
        }}>
          Estudos de{' '}
          <span style={{ color: '#A78BFA', whiteSpace: 'nowrap' }}>Arquitetura Digital.</span>
        </h2>

        <p style={{
          fontSize:   'clamp(13px, 1.1vw, 15px)',
          lineHeight: 1.7,
          color:      '#5B6472',
          margin:     0,
        }}>
          Conceitos de interface desenvolvidos para tangibilizar o nível de
          excelência, performance e design que aplicamos em cada nicho.
        </p>
      </motion.div>

      {/* ── MOBILE: carrossel com peeking ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: false, amount: 0.15 }}
        className="md:hidden w-full relative"
      >
        {/*
          Glow estático fora do container de scroll.
          absolute + -translate garante que fique centrado na seção,
          sem rolar com os cards.
        */}
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width:        '90vw',
            height:       '90vw',
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 68%)',
            filter:       'blur(48px)',
            zIndex:       0,
          }}
        />

        {/*
          paddingInline: 10vw + cards de 80vw + gap-4 (16px):
          • 1º card: left=10vw, right=90vw → centralizado ao snap ✓
          • Peeking: ~10vw do card seguinte visível à direita
        */}
        <div
          className="flex flex-row overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-6"
          style={{ paddingInline: '10vw', position: 'relative', zIndex: 1 }}
        >
          {/* Estética — destaque (primeiro) */}
          <div className="flex-shrink-0 snap-center" style={{ width: '80vw' }}>
            <LaptopMockup
              src="/videos-raven-portfolio/pele-raven.mp4"
              poster="/videos-raven-portfolio/pele-raven-poster.webp"
            />
          </div>

          {/* Advocacia */}
          <div className="flex-shrink-0 snap-center" style={{ width: '80vw' }}>
            <LaptopMockup
              src="/videos-raven-portfolio/advogado-raven.mp4"
              poster="/videos-raven-portfolio/advogado-raven-poster.webp"
            />
          </div>

          {/* Imóvel / Arquitetura */}
          <div className="flex-shrink-0 snap-center" style={{ width: '80vw' }}>
            <LaptopMockup
              src="/videos-raven-portfolio/imovel-raven.mp4"
              poster="/videos-raven-portfolio/imovel-raven-poster.webp"
            />
          </div>
        </div>
      </motion.div>

      {/* ── DESKTOP: composição sobreposta tridimensional ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: false, amount: 0.15 }}
        className="hidden md:block relative w-full"
        style={{
          maxWidth: '100rem',
          height:   'clamp(320px, 62vh, 640px)',
        }}
      >
        {/* Mockup esquerdo — Advocacia */}
        <div style={{
          position:  'absolute',
          left:      0,
          top:       '50%',
          transform: 'translateY(-50%)',
          width:     '44%',
          zIndex:    10,
        }}>
          <motion.div
            style={{ opacity: 0.62 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <LaptopMockup
              src="/videos-raven-portfolio/advogado-raven.mp4"
              poster="/videos-raven-portfolio/advogado-raven-poster.webp"
            />
          </motion.div>
        </div>

        {/* Mockup direito — Imóvel */}
        <div style={{
          position:  'absolute',
          right:     0,
          top:       '50%',
          transform: 'translateY(-50%)',
          width:     '44%',
          zIndex:    10,
        }}>
          <motion.div
            style={{ opacity: 0.62 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <LaptopMockup
              src="/videos-raven-portfolio/imovel-raven.mp4"
              poster="/videos-raven-portfolio/imovel-raven-poster.webp"
            />
          </motion.div>
        </div>

        {/* Mockup central — Estética (hero do showcase) */}
        <div style={{
          position:  'absolute',
          left:      '50%',
          top:       '50%',
          transform: 'translate(-50%, -50%)',
          width:     '52%',
          zIndex:    30,
          filter:    'drop-shadow(0 0 100px rgba(124,58,237,0.30))',
        }}>
          <LaptopMockup src="/videos-raven-portfolio/pele-raven.mp4" />
        </div>
      </motion.div>

      {/* ── CTA único ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: false, amount: 0.15 }}
      >
        <a
          href="#contact"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            12,
            height:         52,
            padding:        '0 36px',
            fontSize:       12,
            fontWeight:     500,
            textTransform:  'uppercase',
            letterSpacing:  '0.14em',
            background:     '#7C3AED',
            color:          '#fff',
            borderRadius:   4,
            border:         '1px solid #7C3AED',
            textDecoration: 'none',
            transition:     'background 250ms ease, box-shadow 250ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#8B5CF6';
            e.currentTarget.style.boxShadow  = '0 0 40px -4px rgba(124,58,237,0.65)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#7C3AED';
            e.currentTarget.style.boxShadow  = 'none';
          }}
        >
          Quero este padrão para minha empresa
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </motion.div>

    </section>
  );
}
