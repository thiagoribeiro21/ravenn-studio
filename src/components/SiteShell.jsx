import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useMenu } from '../context/MenuContext';
import { scrollStore } from '../scrollStore';

/*
  SiteShell — "Push 3D" effect.

  ┌─ motion.div [position:fixed, z-10] ──────────────────────────────────────┐
  │  origin-right → escala recua da esquerda enquanto a âncora direita segura │
  │  x: -30vw (desktop) / -80vw (mobile) → revela o MenuPanel atrás à direita │
  │                                                                             │
  │  Spring suave (stiffness:100 damping:20) → qualiidade Awwwards              │
  │                                                                             │
  │  ┌─ div[data-scroll-content] ────────────────────────────────────────────┐ │
  │  │  overflow-y:auto — scroll real do site.                                │ │
  │  │  O usuário PODE rolar mesmo com o menu aberto (o SiteShell está        │ │
  │  │  reduzido mas ainda scrollable).                                        │ │
  │  │  {children}: Navbar(sticky) + seções + Footer                          │ │
  │  └────────────────────────────────────────────────────────────────────────┘ │
  └───────────────────────────────────────────────────────────────────────────┘

  z-layering:
    0  CustomCanvasBackground / ScrollSequenceCanvas  (fixed, fundo)
    5  MenuPanel                                       (fixed, revelado)
   10  SiteShell                                       (fixed, push 3D)
*/

const SPRING = { type: 'spring', stiffness: 100, damping: 20, mass: 1 };

function useOpenVariants() {
  const calc = useCallback(() => {
    if (typeof window === 'undefined') return { x: 0, xOpen: -300 };
    const md = window.matchMedia('(min-width: 768px)').matches;
    return {
      x:     0,
      xOpen: md ? -(window.innerWidth * 0.30) : -(window.innerWidth * 0.80),
    };
  }, []);

  const [val, setVal] = useState(calc);

  useEffect(() => {
    const mq  = window.matchMedia('(min-width: 768px)');
    const upd = () => setVal(calc());
    mq.addEventListener('change', upd);
    window.addEventListener('resize', upd);
    return () => {
      mq.removeEventListener('change', upd);
      window.removeEventListener('resize', upd);
    };
  }, [calc]);

  return {
    closed: { scale: 1,    x: val.x,    borderRadius: 0,  transition: SPRING },
    open:   { scale: 0.95, x: val.xOpen, borderRadius: 24, transition: SPRING },
  };
}

/*
  bgLayer: aceita os canvases passados pelo App.jsx.

  Dentro do SiteShell (pai com transform/willChange), position:fixed é
  relativo a este elemento — não ao viewport. Os canvases em bgLayer
  preenchem o SiteShell e ficam em z baixo (0 e 2). O scroll container
  fica em z=10, transparente, permitindo que as seções transparentes
  (Hero, MetricsBar, Audience) deixem os canvases visíveis por baixo.
  Seções sólidas (bg-[#03000A]) cobrem os canvases automaticamente.
*/
export default function SiteShell({ children, bgLayer }) {
  const { isOpen, scrollContainerRef, setScrolled } = useMenu();
  const variants  = useOpenVariants();
  // ── Scroll state tracking ──────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      scrollStore.y        = el.scrollTop;
      const maxY           = el.scrollHeight - el.clientHeight;
      scrollStore.progress = maxY > 0 ? el.scrollTop / maxY : 0;
      setScrolled(el.scrollTop > 24);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollContainerRef, setScrolled]);

  // ── Smooth wheel (lerp-based, preserves sticky + Framer useScroll) ────────
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let targetY  = 0;
    let currentY = 0;
    let rafId    = null;
    let isRunning = false;

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      currentY = lerp(currentY, targetY, 0.085);
      const diff = Math.abs(targetY - currentY);
      if (diff > 0.3) {
        el.scrollTop = currentY;
        rafId = requestAnimationFrame(tick);
      } else {
        el.scrollTop = targetY;
        isRunning = false;
        rafId = null;
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      const max = el.scrollHeight - el.clientHeight;
      // Sync both currentY and targetY when the loop is idle —
      // prevents stale targetY from teleporting the page on the next wheel event
      if (!isRunning) {
        currentY = el.scrollTop;
        targetY  = el.scrollTop;
      }
      targetY = Math.max(0, Math.min(max, targetY + e.deltaY));
      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [scrollContainerRef]);

  return (
    <motion.div
      animate={isOpen ? 'open' : 'closed'}
      variants={variants}
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          10,
        willChange:      'transform',
        transformOrigin: 'right center',
        overflow:        'hidden',
        background:      '#03000A',
        boxShadow:       '0 0 80px rgba(0,0,0,0.60), 0 32px 64px rgba(0,0,0,0.50)',
      }}
    >
      {/* Canvas layers — renderizam sobre o #03000A base, sob o scroll container */}
      {bgLayer}

      {/* Scroll container em z=10 (acima dos canvases z=0/2), fundo transparente */}
      <div
        ref={scrollContainerRef}
        data-scroll-content
        style={{
          position:   'relative',
          zIndex:     10,
          height:     '100dvh',
          overflowY:  'auto',
          overflowX:  'hidden',
          background: 'transparent',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
