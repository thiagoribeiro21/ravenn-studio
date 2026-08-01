import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../primitives/GlassCard';
import { EASE_LUXE, GX, TYPE, SECTION_PAD, prefersReducedMotion } from '../config/_base';

const AUTO_ADVANCE_MS = 4500;

/*
  Card de vidro navegável sobre fundo full-bleed. Desde o refinamento v3
  (item 5), fica exclusivo do Ato 7 (Processo, sobre `process-bg.webp`,
  onde a numeração `// 01·03` é sequência real) — o Ato 3 (Consequência)
  agora usa `CostReveal.jsx`, estrutura própria, pra não repetir a mesma
  mecânica visual duas vezes na página. `bg`/`punchline` seguem suportados
  pra manter o componente reusável nas próximas LPs nichadas.

  Item 9 do refinamento v4 — auto-avanço cinemático: barra de progresso via
  rAF que troca de card sozinha a cada ~4.5s, pausa em hover/foco e quando a
  seção sai do viewport (IntersectionObserver, mesmo padrão do gate de vídeo
  em ConceptStack.jsx), e some por completo em prefers-reduced-motion — a
  navegação manual (setas) continua disponível em todos os casos.
*/
export default function ConsequenceCarousel({ id, eyebrow, heading, items, bg, cta, punchline }) {
  const [index, setIndex] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);
  const total = items.length;

  useEffect(() => {
    if (index === total - 1) setReachedEnd(true);
  }, [index, total]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const prev = () => { setIndex((i) => (i - 1 + total) % total); setProgress(0); };
  const next = () => { setIndex((i) => (i + 1) % total); setProgress(0); };

  useEffect(() => {
    if (prefersReducedMotion() || paused || !inView || total <= 1) return;
    let raf;
    const start = performance.now() - (progress * AUTO_ADVANCE_MS) / 100;
    const tick = (ts) => {
      const p = Math.min(100, ((ts - start) / AUTO_ADVANCE_MS) * 100);
      setProgress(p);
      if (p >= 100) {
        setIndex((i) => (i + 1) % total);
        setProgress(0);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, inView, index, total]);

  return (
    <section id={id} ref={sectionRef} className={`relative overflow-hidden border-t border-white/[0.06] ${SECTION_PAD} ${GX}`}>
      <div aria-hidden className="absolute inset-0">
        {bg ? (
          <>
            <img src={bg} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ filter: 'brightness(0.45)' }} />
            <div className="absolute inset-0 bg-rv-void/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(124,58,237,0.14),transparent_60%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-rv-void/70 via-transparent to-rv-void/70" />
      </div>

      <div className="relative z-10 grid gap-12 md:grid-cols-12 md:items-center md:gap-[2vw]">
        <div className="md:col-span-5">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: EASE_LUXE }}
            className={`flex items-center gap-3 font-satoshi font-medium uppercase tracking-widest2 text-rv-slate ${TYPE.eyebrow}`}
          >
            <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
            {eyebrow}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXE }}
            className={`mt-6 font-grotesk font-light leading-[1.1] tracking-[-0.015em] text-rv-titanium ${TYPE.h2}`}
          >
            {heading}
          </motion.h2>

          {cta && (
            <motion.a
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: 0.25, ease: EASE_LUXE }}
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-satoshi font-medium text-rv-titanium transition-colors duration-300 hover:border-rv-purple/60 hover:text-rv-purple-400 ${TYPE.button}`}
            >
              {cta.label}
              <span aria-hidden>→</span>
            </motion.a>
          )}

          {punchline && reachedEnd && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_LUXE }}
              className="mt-8 font-grotesk text-2xl font-light leading-[1.2] text-rv-titanium md:text-3xl"
            >
              {punchline}
            </motion.p>
          )}
        </div>

        <div
          className="flex justify-center md:col-span-6 md:col-start-7"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
          }}
        >
          <GlassCard
            index={index}
            total={total}
            title={items[index].title}
            body={items[index].body}
            tag={items[index].tag}
            onPrev={prev}
            onNext={next}
            progress={prefersReducedMotion() ? undefined : progress}
          />
        </div>
      </div>
    </section>
  );
}
