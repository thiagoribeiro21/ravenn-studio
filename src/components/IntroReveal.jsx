import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SESSION_KEY, markIntroDone } from '../introStore';

// ── Timeline ─────────────────────────────────────────────────────────────────
// Two signature eases carried through the whole sequence:
//  • EASE — the site's own confident deceleration (Navbar/MenuPanel already
//    use this exact curve), so the preloader speaks the same motion language
//    as the rest of the app instead of introducing a competing feel.
//  • SNAP — a steeper variant reserved for the icon's "materialize" beat and
//    its exit, so the mark itself always reads a fraction sharper than the
//    atmosphere drifting around it.
const EASE = [0.16, 1, 0.3, 1];
const SNAP = [0.22, 1, 0.36, 1];

const T_ATMOS_DELAY = 0.15;
const T_ATMOS_DUR   = 1.3;
const T_ICON_DELAY  = 0.15;
const T_ICON_DUR    = 0.65;
const T_FLASH_DELAY = 0.15;
const T_FLASH_DUR   = 0.55;
const T_SWEEP_DELAY = 0.95;
const T_SWEEP_DUR   = 0.6;

const HOLD_END  = 2000;               // ms — moment the curtain begins to part
const EXIT_DUR  = 0.38;               // s — mark + atmosphere fade/scale out
const SPLIT_DUR = 0.72;               // s — panel travel
const TOTAL     = HOLD_END + SPLIT_DUR * 1000 + 60;

// ── Malha de partículas violeta (canvas 2D) ─────────────────────────────────
// Mesma física de conexão do CustomCanvasBackground, isolada aqui para poder
// nascer mais densa/lenta em formação radial ao redor do logo.
const PARTICLE_COUNT  = 130;
const CONNECTION_DIST = 170;
const COLOR_DEEP      = '#4C1D95';
const COLOR_NEON      = '#A78BFA';

function rand(min, max) { return Math.random() * (max - min) + min; }

function ParticleMesh() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cx = () => canvas.width  / 2;
    const cy = () => canvas.height / 2;

    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = rand(0, Math.PI * 2);
      const rad   = rand(60, Math.min(canvas.width, canvas.height) * 0.42);
      return {
        x:     cx() + Math.cos(angle) * rad,
        y:     cy() + Math.sin(angle) * rad,
        vx:    rand(-0.12, 0.12),
        vy:    rand(-0.12, 0.12),
        r:     rand(0.8, 2.2),
        neon:  Math.random() < 0.32,
        alpha: rand(0.35, 0.9),
      };
    });

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      }

      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECTION_DIST) {
            ctx.globalAlpha  = (1 - d / CONNECTION_DIST) * 0.22;
            ctx.strokeStyle  = a.neon || b.neon ? COLOR_NEON : COLOR_DEEP;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.neon ? COLOR_NEON : COLOR_DEEP;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'absolute', inset: 0, display: 'block' }}
    />
  );
}

export default function IntroReveal() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase]     = useState('show'); // 'show' | 'split'
  const holdTimer = useRef(null);
  const doneTimer = useRef(null);

  const finish = () => {
    setVisible(false);
    document.body.style.overflow = '';
    sessionStorage.setItem(SESSION_KEY, '1');
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || sessionStorage.getItem(SESSION_KEY)) return;

    setVisible(true);
    document.body.style.overflow = 'hidden';

    // O corte da cortina já dispara a entrada do conteúdo por baixo (markIntroDone),
    // não o fim do unmount — assim, quando os painéis terminam de sair de cena,
    // o conteúdo já está a meio caminho da própria entrada, sem hiato em branco.
    holdTimer.current = setTimeout(() => {
      setPhase('split');
      markIntroDone();
    }, HOLD_END);
    doneTimer.current = setTimeout(finish, TOTAL);

    return () => {
      clearTimeout(holdTimer.current);
      clearTimeout(doneTimer.current);
      document.body.style.overflow = '';
    };
  }, []);

  const skip = () => {
    if (phase === 'split') return;
    clearTimeout(holdTimer.current);
    clearTimeout(doneTimer.current);
    setPhase('split');
    markIntroDone();
    doneTimer.current = setTimeout(finish, SPLIT_DUR * 1000 + 60);
  };

  const splitting = phase === 'split';

  return (
    <AnimatePresence>
      {visible && (
        <div
          onClick={skip}
          style={{ position: 'fixed', inset: 0, zIndex: 100, cursor: 'pointer' }}
        >
          {/* ── Cortina: dois painéis pretos que se separam no final ── */}
          <motion.div
            aria-hidden
            initial={{ y: 0 }}
            animate={{ y: splitting ? '-100%' : 0 }}
            transition={{ duration: SPLIT_DUR, ease: EASE }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: '#000' }}
          />
          <motion.div
            aria-hidden
            initial={{ y: 0 }}
            animate={{ y: splitting ? '100%' : 0 }}
            transition={{ duration: SPLIT_DUR, ease: EASE }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: '#000' }}
          />

          {/* ── Fresta violeta: um flash de energia no instante do corte ── */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: splitting ? [0, 1, 0] : 0 }}
            transition={{ duration: 0.5, times: [0, 0.22, 1], ease: 'easeOut' }}
            style={{
              position:      'absolute',
              top:           '50%',
              left:          0,
              right:         0,
              height:        2,
              transform:     'translateY(-1px)',
              background:    'linear-gradient(90deg, transparent, #A78BFA, #C4B5FD, #A78BFA, transparent)',
              boxShadow:     '0 0 30px 6px rgba(167,139,250,0.75)',
              pointerEvents: 'none',
            }}
          />

          {/* ── Atmosfera: malha de partículas + halo, nasce e recua junto ── */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: splitting ? 0 : 1,
              scale:   splitting ? 1.06 : 1,
            }}
            transition={
              splitting
                ? { duration: EXIT_DUR, ease: SNAP }
                : { duration: T_ATMOS_DUR, delay: T_ATMOS_DELAY, ease: EASE }
            }
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ParticleMesh />
            <div
              style={{
                position:     'absolute',
                width:        'min(70vw, 640px)',
                height:       'min(70vw, 640px)',
                borderRadius: '50%',
                background:   'radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(76,29,149,0.14) 45%, transparent 72%)',
                filter:       'blur(60px)',
              }}
            />
          </motion.div>

          {/* ── Marca: ícone estoura de um flash de luz e depois recebe um brilho que varre a silhueta ── */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: splitting ? 0 : 1, scale: splitting ? 1.06 : 1 }}
            transition={{ duration: EXIT_DUR, ease: SNAP }}
            style={{
              position:       'absolute',
              inset:          0,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ position: 'relative', width: 'clamp(140px,16vw,220px)', aspectRatio: '1' }}>
              {/* Estouro de luz: flash radial que se expande e desaparece no instante em que o ícone surge */}
              <motion.div
                aria-hidden
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: [0, 1, 0], scale: [0.3, 1.8, 2.4] }}
                transition={{ duration: T_FLASH_DUR, delay: T_FLASH_DELAY, times: [0, 0.28, 1], ease: 'easeOut' }}
                style={{
                  position:      'absolute',
                  inset:         '-40%',
                  borderRadius:  '50%',
                  background:    'radial-gradient(circle, rgba(233,213,255,0.9) 0%, rgba(167,139,250,0.55) 32%, transparent 70%)',
                  filter:        'blur(4px)',
                  pointerEvents: 'none',
                }}
              />

              {/* Ícone: materializa do borrão, nítido e sólido */}
              <motion.img
                src="/logo-ravenn/icone-ravenn.webp"
                alt="Ravenn Studio"
                initial={{ opacity: 0, scale: 1.35, filter: 'blur(18px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: T_ICON_DUR, delay: T_ICON_DELAY, ease: SNAP }}
                style={{ position: 'relative', width: '100%', height: '100%', display: 'block' }}
                draggable={false}
              />

              {/* Brilho: faixa de luz diagonal que varre a silhueta do ícone uma única vez.
                  A máscara fica parada (recorta a forma do ícone); só o gradiente por
                  baixo se desloca via background-position — animar via transform (x)
                  arrastaria a máscara junto, duplicando a silhueta em vez de "passar" por ela. */}
              <motion.div
                aria-hidden
                initial={{ backgroundPosition: '-120% 50%', opacity: 0 }}
                animate={{ backgroundPosition: '220% 50%', opacity: [0, 1, 1, 0] }}
                transition={{
                  backgroundPosition: { duration: T_SWEEP_DUR, delay: T_SWEEP_DELAY, ease: 'linear' },
                  opacity:            { duration: T_SWEEP_DUR, delay: T_SWEEP_DELAY, times: [0, 0.15, 0.7, 1], ease: 'easeInOut' },
                }}
                style={{
                  position:           'absolute',
                  inset:              0,
                  backgroundImage:    'linear-gradient(75deg, transparent 40%, rgba(76,29,149,0.4) 46%, rgba(237,233,254,0.95) 50%, rgba(76,29,149,0.4) 54%, transparent 60%)',
                  backgroundSize:     '300% 300%',
                  backgroundRepeat:   'no-repeat',
                  WebkitMaskImage:    'url(/logo-ravenn/icone-ravenn.webp)',
                  maskImage:          'url(/logo-ravenn/icone-ravenn.webp)',
                  WebkitMaskSize:     'contain',
                  maskSize:           'contain',
                  WebkitMaskRepeat:   'no-repeat',
                  maskRepeat:         'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition:       'center',
                  pointerEvents:      'none',
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
