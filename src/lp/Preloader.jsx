import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE_LUXE, TYPE, isSlowConnection, prefersReducedMotion } from './config/_base';

const SESSION_KEY = 'rv-lp-institucional-v6-loaded';
const DURATION_MS = 900;

/*
  Preloader CSS-first, teto de 900ms, saída independente de qualquer estado
  de carregamento real (não espera `load`). O Hero já está no DOM por baixo
  desde o primeiro paint — este componente é só uma camada decorativa por
  cima, nunca um gate que atrasa o LCP ou os assets do Hero.

  Pula imediatamente (sem overlay, sem custo) se: já mostrado nesta sessão,
  prefers-reduced-motion, ou conexão lenta/saveData.
*/
export default function Preloader() {
  const [skip] = useState(() => {
    try {
      return (
        sessionStorage.getItem(SESSION_KEY) === '1' ||
        prefersReducedMotion() ||
        isSlowConnection()
      );
    } catch {
      return false;
    }
  });
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const numRef = useRef(null);

  useEffect(() => {
    if (skip) return;
    const start = performance.now();
    let raf;
    const tick = (ts) => {
      const p = Math.min(1, (ts - start) / DURATION_MS);
      if (numRef.current) numRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setDone(true);
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* segue sem persistir */ }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [skip]);

  if (skip || gone) return null;

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={done ? { y: '-100%' } : {}}
      transition={{ duration: 0.6, ease: EASE_LUXE }}
      onAnimationComplete={() => done && setGone(true)}
      className="fixed inset-0 z-[100] flex items-end justify-between bg-rv-void px-[6vw] pb-10 will-change-transform"
    >
      <span className={`font-satoshi uppercase tracking-widest2 text-rv-faint ${TYPE.eyebrow}`}>Ravenn Studio</span>
      <span ref={numRef} className="font-grotesk text-6xl font-light tracking-[-0.02em] text-rv-titanium md:text-7xl">
        000
      </span>
    </motion.div>
  );
}
