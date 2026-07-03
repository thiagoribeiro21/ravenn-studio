import { useRef, useMemo, useEffect } from 'react';
import { useMenu } from '../context/MenuContext';

const START_OPACITY  = 0.15;
const STAGGER_SPREAD = 0.7; // 0-1: quanto do progresso é usado pra escalonar palavra a palavra (esquerda -> direita)

export default function TextReveal({ text, style, className }) {
  const containerRef = useRef(null);
  const spansRef      = useRef([]);
  const { scrollContainerRef } = useMenu();

  const words = useMemo(() => text.split(' '), [text]);

  // Progresso calculado diretamente via getBoundingClientRect a cada frame
  // (requestAnimationFrame), em vez de depender de listeners de evento de
  // scroll — motores como o WebKit não garantem disparar 'scroll'/'change'
  // em cadência confiável dentro de um container customizado aninhado num
  // ancestral position:fixed + transform (o SiteShell), o que fazia o
  // Framer Motion (useScroll/useMotionValueEvent) pular direto pro final
  // em vez de progredir gradualmente no mobile.
  useEffect(() => {
    const p = containerRef.current;
    const container = scrollContainerRef.current;
    if (!p || !container) return;

    const n = words.length;
    const revealDuration = n > 1 ? (1 - STAGGER_SPREAD) + STAGGER_SPREAD / n : 1;
    const stepPerWord    = n > 1 ? (1 - revealDuration) / (n - 1) : 0;

    let rafId = null;
    let armed = false;

    function applyProgress(progress) {
      spansRef.current.forEach((span, i) => {
        if (!span) return;
        const wordStart = i * stepPerWord;
        const wordProgress = Math.min(1, Math.max(0, (progress - wordStart) / revealDuration));
        span.style.opacity = START_OPACITY + (1 - START_OPACITY) * wordProgress;
      });
    }

    function computeProgress() {
      const containerRect = container.getBoundingClientRect();
      const pRect          = p.getBoundingClientRect();

      const start = containerRect.height * 0.85; // topo do texto a 85% do container -> progress 0
      const end   = containerRect.height * 0.5;  // texto centralizado no container -> progress 1

      const relativeTop = pRect.top - containerRect.top;
      let progress = (start - relativeTop) / (start - end);
      return Math.min(1, Math.max(0, progress));
    }

    function tick() {
      applyProgress(computeProgress());
      rafId = requestAnimationFrame(tick);
    }

    // Só roda o loop de rAF enquanto o texto está perto da viewport do
    // container — evita gastar frame contínuo com o resto da página parada.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !armed) {
            armed = true;
            rafId = requestAnimationFrame(tick);
          } else if (!entry.isIntersecting && armed) {
            armed = false;
            if (rafId) cancelAnimationFrame(rafId);
          }
        });
      },
      { root: container, rootMargin: '50% 0px 50% 0px' },
    );
    io.observe(p);

    applyProgress(computeProgress()); // cálculo inicial (caso já esteja parcialmente visível)

    return () => {
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [words, scrollContainerRef]);

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
