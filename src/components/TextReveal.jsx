import { useRef, useMemo } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { useMenu } from '../context/MenuContext';

const START_OPACITY   = 0.15;
const STAGGER_SPREAD  = 0.7; // 0-1: quanto do progresso é usado pra escalonar palavra a palavra (esquerda -> direita)

export default function TextReveal({ text, style, className }) {
  const containerRef = useRef(null);
  const spansRef      = useRef([]);
  const { scrollContainerRef } = useMenu();

  const words = useMemo(() => text.split(' '), [text]);

  // scrollYProgress: 0 quando o topo do texto está a 85% da tela, 1 quando o
  // texto chega centralizado — recalculado a cada evento de scroll do
  // container real do site, nos dois sentidos (não é um tween por tempo).
  const { scrollYProgress } = useScroll({
    target:    containerRef,
    container: scrollContainerRef,
    offset:    ['start 0.85', 'center center'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const n = words.length;
    const revealDuration = n > 1 ? (1 - STAGGER_SPREAD) + STAGGER_SPREAD / n : 1;
    const stepPerWord    = n > 1 ? (1 - revealDuration) / (n - 1) : 0;

    spansRef.current.forEach((span, i) => {
      if (!span) return;
      const wordStart = i * stepPerWord;
      const wordProgress = Math.min(1, Math.max(0, (progress - wordStart) / revealDuration));
      span.style.opacity = START_OPACITY + (1 - START_OPACITY) * wordProgress;
    });
  });

  return (
    <p ref={containerRef} style={{ margin: 0, ...style }} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          ref={(el) => (spansRef.current[i] = el)}
          style={{ display: 'inline-block', marginRight: '0.28em', opacity: START_OPACITY }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}
