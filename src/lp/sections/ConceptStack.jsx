import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import gsap from 'gsap';
import { EASE_LUXE, GX, TYPE, RADIUS, SECTION_PAD } from '../config/_base';

/*
  Ato 5, refinamento v3 (item 7) — dois problemas do item 7 corrigidos:

  (a) Loop replicado exatamente do padrão já usado em
      public/portfolio-heroes/pele.html: clip-path inset(50%) → inset(0%)
      em 1.5s + vídeo scale 1.15→1 em 2s, em paralelo, disparado uma vez
      quando o card vira o "front" (não no mount da página — aqui a
      "abertura" acontece a cada vez que o card entra em foco, não só uma
      vez no load). O loop contínuo depois disso é 100% o atributo `loop`
      nativo do `<video>`, sem JS.
  (b) Nenhum texto por cima do vídeo — o vídeo fica limpo (só um vinheta
      leve pra profundidade). Todo o texto do conceito ativo (label, dor,
      solução, CTA) mora na coluna da esquerda, fora do frame.
*/
function ConceptCard({ item, style, isFront }) {
  const cardRef = useRef(null);
  const clipRef = useRef(null);
  const videoRef = useRef(null);
  const inView = useInView(cardRef, { amount: 0.3 });
  const played = useRef(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isFront || !inView) {
      v?.pause();
      return;
    }
    if (!played.current) {
      played.current = true;
      gsap.set(clipRef.current, { clipPath: 'inset(50% 0% 50% 0%)' });
      gsap.set(videoRef.current, { scale: 1.15 });
      gsap
        .timeline()
        .to(clipRef.current, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power4.inOut' }, 0)
        .to(videoRef.current, { scale: 1, duration: 2, ease: 'power4.out' }, 0);
    }
    v.play().catch(() => {});
    return () => v.pause();
  }, [isFront, inView]);

  return (
    <motion.div
      ref={cardRef}
      animate={style}
      transition={{ duration: 0.6, ease: EASE_LUXE }}
      className="absolute inset-0 overflow-hidden border border-white/10"
      style={{ borderRadius: RADIUS.lg, pointerEvents: isFront ? 'auto' : 'none' }}
    >
      <div ref={clipRef} className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0% 0% 0% 0%)' }}>
        <video
          ref={videoRef}
          src={item.src}
          poster={item.poster}
          loop
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          className="h-full w-full object-cover"
        />
      </div>
      {/* vinheta leve só pra profundidade — zero texto sobre o site */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-rv-void/25 via-transparent to-transparent" />
    </motion.div>
  );
}

function ConceptInfo({ item }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={item.nicho}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.5, ease: EASE_LUXE }}
      >
        {/* item 7 do refinamento v4 — era um pseudo-botão (borda+cápsula);
            agora é eyebrow puro, igual aos outros labels da página. */}
        <span className={`inline-block font-satoshi font-medium uppercase tracking-widest2 text-rv-purple-400 ${TYPE.eyebrow}`}>
          Conceito autoral · {item.nicho}
        </span>
        <p className="mt-5 font-grotesk text-2xl font-light leading-[1.28] text-rv-titanium md:text-3xl">{item.pain}</p>
        <p className={`mt-3 font-satoshi text-rv-slate ${TYPE.cardDesc}`}>{item.solution}</p>
        <a
          href={item.wa}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-5 inline-flex items-center gap-2 font-satoshi font-medium text-rv-titanium transition-colors duration-300 hover:text-rv-purple-400 ${TYPE.button}`}
        >
          Quero este padrão no meu negócio
          <span aria-hidden>→</span>
        </a>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ConceptStack({ data }) {
  const [active, setActive] = useState(0);
  const total = data.items.length;
  const next = () => setActive((i) => (i + 1) % total);
  const prev = () => setActive((i) => (i - 1 + total) % total);

  return (
    <section id="conceitos" className={`relative overflow-hidden border-t border-white/[0.06] ${SECTION_PAD} ${GX}`}>
      <span
        aria-hidden
        className="lp-outline-text pointer-events-none absolute inset-x-0 bottom-0 select-none whitespace-nowrap text-center font-grotesk text-[13vw] font-semibold leading-none"
      >
        CONCEITO
      </span>

      <div className="relative z-10 grid gap-10 md:grid-cols-12 md:gap-[2vw]">
        <div className="md:col-span-4">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: EASE_LUXE }}
            className={`flex items-center gap-3 font-satoshi font-medium uppercase tracking-widest2 text-rv-slate ${TYPE.eyebrow}`}
          >
            <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
            O padrão, aplicado ao seu mercado
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXE }}
            className={`mt-6 font-grotesk font-light leading-[1.12] tracking-[-0.015em] text-rv-titanium ${TYPE.h2}`}
          >
            É assim que o seu mercado deveria ver você.
          </motion.h2>

          {/* texto do conceito ativo — fora do frame do vídeo (item 7b) */}
          <div className="mt-8">
            <ConceptInfo item={data.items[active]} />
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label="Conceito anterior"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-rv-titanium transition-colors duration-300 hover:border-rv-purple/60 hover:text-rv-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rv-purple/60"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próximo conceito"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-rv-titanium transition-colors duration-300 hover:border-rv-purple/60 hover:text-rv-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rv-purple/60"
            >
              →
            </button>
            <span className={`font-satoshi uppercase tracking-widest2 text-rv-faint ${TYPE.eyebrow}`}>
              {active + 1} / {total}
            </span>
          </div>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <div className="relative aspect-[4/5] w-full md:aspect-[16/10]">
            {data.items.map((item, i) => {
              const dist = (i - active + total) % total;
              if (dist > 2) return null;
              const style =
                dist === 0
                  ? { scale: 1, y: 0, opacity: 1, zIndex: 3 }
                  : dist === 1
                  ? { scale: 0.94, y: 22, opacity: 0.55, zIndex: 2 }
                  : { scale: 0.88, y: 40, opacity: 0.28, zIndex: 1 };
              return <ConceptCard key={item.nicho} item={item} style={style} isFront={dist === 0} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
