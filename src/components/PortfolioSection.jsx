import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LaptopMockup from './LaptopMockup';

const CARDS = [
  {
    src:    '/videos-raven-portfolio/pele-raven.mp4',
    poster: '/videos-raven-portfolio/pele-raven-poster.webp',
  },
  {
    src:    '/videos-raven-portfolio/advogado-raven.mp4',
    poster: '/videos-raven-portfolio/advogado-raven-poster.webp',
  },
  {
    src:    '/videos-raven-portfolio/imovel-raven.mp4',
    poster: '/videos-raven-portfolio/imovel-raven-poster.webp',
  },
];

export default function PortfolioSection() {
  const [isDesktop,   setIsDesktop]   = useState(() => window.innerWidth >= 768);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleCarouselScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    // cardWidth = 80vw + 16px gap
    const cardWidth = window.innerWidth * 0.8 + 16;
    const idx = Math.min(Math.round(el.scrollLeft / cardWidth), CARDS.length - 1);
    setActiveIndex(idx);
    if (!hasScrolled) setHasScrolled(true);
  }, [hasScrolled]);

  const scrollToCard = useCallback((idx) => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = window.innerWidth * 0.8 + 16;
    el.scrollTo({ left: cardWidth * idx, behavior: 'smooth' });
  }, []);

  return (
    <section
      id="portfolio"
      className="min-h-screen flex flex-col items-center justify-center bg-[#03000A] overflow-hidden border-t border-[#1E1B4B] gap-6 py-10 px-0 md:gap-[clamp(36px,5vh,60px)] md:py-[clamp(48px,8vh,80px)] md:px-[clamp(24px,4vw,48px)]"
    >

      {/* ── Header ──────────────────────────────────────────────────────────── */}
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

      {/* ── MOBILE: carrossel com peeking + dots + swipe hint ───────────────── */}
      {!isDesktop && (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.15 }}
          className="w-full relative"
        >
          {/* Glow estático */}
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

          {/* Swipe hint — desaparece no primeiro scroll */}
          <AnimatePresence>
            {!hasScrolled && (
              <motion.div
                key="swipe-hint"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ delay: 0.75, duration: 0.45 }}
                className="flex items-center justify-center gap-2 mb-3"
                style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}
              >
                <motion.svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  aria-hidden
                >
                  <path d="M6 4.5C6 3.67 6.67 3 7.5 3S9 3.67 9 4.5V8" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M9 5.5C9 4.67 9.67 4 10.5 4S12 4.67 12 5.5V8" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M12 6.5C12 5.67 12.67 5 13.5 5S15 5.67 15 6.5V10C15 12.76 12.76 15 10 15H8.5C6.97 15 5.56 14.27 4.65 13.1L2.22 10.02C1.72 9.38 1.83 8.46 2.47 7.96 3.1 7.46 4.02 7.57 4.52 8.21L6 10V4.5" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
                <span style={{
                  fontSize:      9,
                  fontWeight:    500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  color:         '#5B6472',
                }}>
                  Deslize para ver mais
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cards */}
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex flex-row overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4"
            style={{ paddingInline: '10vw', position: 'relative', zIndex: 1 }}
          >
            {CARDS.map((card, i) => (
              <div key={i} className="flex-shrink-0 snap-center" style={{ width: '80vw' }}>
                <LaptopMockup src={card.src} poster={card.poster} />
              </div>
            ))}
          </div>

          {/* Dots — clicáveis para navegar */}
          <div
            className="flex items-center justify-center gap-2 mt-4"
            style={{ position: 'relative', zIndex: 2 }}
          >
            {CARDS.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => scrollToCard(i)}
                animate={{
                  width:           activeIndex === i ? 22 : 6,
                  backgroundColor: activeIndex === i ? '#7C3AED' : 'rgba(255,255,255,0.2)',
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  height:     6,
                  borderRadius: 3,
                  border:     'none',
                  cursor:     'pointer',
                  padding:    0,
                  flexShrink: 0,
                }}
                aria-label={`Ver projeto ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── DESKTOP: composição sobreposta tridimensional ───────────────────── */}
      {isDesktop && (
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.05, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.15 }}
          className="relative w-full"
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

          {/* Mockup central — Estética */}
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
      )}

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: false, amount: 0.15 }}
      >
        <a
          href="#contact"
          className="inline-flex items-center whitespace-nowrap gap-2 md:gap-3 h-11 md:h-[52px] px-5 md:px-9 text-[10px] md:text-[12px] tracking-[0.09em] md:tracking-[0.14em] rounded"
          style={{
            fontWeight:     500,
            textTransform:  'uppercase',
            background:     '#7C3AED',
            color:          '#fff',
            border:         '1px solid #7C3AED',
            textDecoration: 'none',
            transition:     'background 250ms ease, box-shadow 250ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background  = '#8B5CF6';
            e.currentTarget.style.boxShadow   = '0 0 40px -4px rgba(124,58,237,0.65)';
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
