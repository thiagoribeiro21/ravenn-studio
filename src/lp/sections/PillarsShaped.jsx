import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MorphGlyph from '../primitives/MorphGlyph';
import { EASE_LUXE, GX, TYPE, SECTION_PAD, getScrollerEl, prefersReducedMotion } from '../config/_base';

gsap.registerPlugin(ScrollTrigger);

/* 4 formas abstratas — uma por pilar, mesma ordem de data.labels. Pontos
   não precisam bater entre paths: MorphSVGPlugin subdivide sozinho. */
const GLYPH_PATHS = [
  'M120,40 C164.18,40 200,75.82 200,120 C200,164.18 164.18,200 120,200 C75.82,200 40,164.18 40,120 C40,75.82 75.82,40 120,40 Z', // Design autoral — blob orgânico
  'M120,30 L145,105 L210,120 L145,135 L120,210 L95,135 L30,120 L95,105 Z', // Performance obsessiva — estrela de precisão
  'M70,70 L170,70 Q200,70 200,100 L200,140 Q200,170 170,170 L70,170 Q40,170 40,140 L40,100 Q40,70 70,70 Z', // Arquitetura de conversão — grid
  'M120,30 L197,75 L197,165 L120,210 L43,165 L43,75 Z', // Autoridade local — hexágono/selo
];

/*
  Item 8 do refinamento v4 — cada pilar ganha seu próprio scrub local, em
  vez de só um IntersectionObserver binário decidindo a cor do título de
  uma vez. Conforme o item cruza a faixa central da viewport: o número
  (01-04) sobe de opacidade suave (não é mais um "liga/desliga"), e o
  título acende palavra a palavra (mesmo mecanismo de ScrubWords /
  ScrubStatement) — ao passar da faixa central, ambos assentam num estado
  "lido" intermediário, nem apagado como um pilar ainda não alcançado nem
  no pico do ativo. O morph do glifo (MorphGlyph) continua no gatilho
  discreto de sempre (IntersectionObserver, threshold 0.55) — só o número
  e o texto passam a ser contínuos.
*/
function PillarItem({ pillar, index, onEnter }) {
  const itemRef = useRef(null);
  const numberRef = useRef(null);
  const wordRefs = useRef([]);
  wordRefs.current = [];
  const words = pillar.split(' ');

  useLayoutEffect(() => {
    const el = itemRef.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) onEnter(index); }, { threshold: 0.55 });
    io.observe(el);

    if (prefersReducedMotion()) {
      gsap.set(numberRef.current, { opacity: 1, color: '#F8F9FA' });
      gsap.set(wordRefs.current, { opacity: 1, color: '#F8F9FA' });
      return () => io.disconnect();
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scroller: getScrollerEl(),
          start: 'top 72%',
          end: 'bottom 35%',
          scrub: 0.3,
        },
      });

      tl.fromTo(numberRef.current, { opacity: 0.3 }, { opacity: 1, color: '#F8F9FA', duration: 0.5, ease: 'none' }, 0);
      tl.to(numberRef.current, { opacity: 0.55, color: '#94A3B8', duration: 0.5, ease: 'none' }, 0.5);

      wordRefs.current.forEach((w, i) => {
        const t = 0.1 + (i / wordRefs.current.length) * 0.55;
        tl.to(w, { opacity: 1, color: '#F8F9FA', duration: 0.12, ease: 'none' }, t);
      });
    }, itemRef);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [index, onEnter]);

  return (
    <div ref={itemRef} className="border-t border-white/[0.08] py-10 last:border-b">
      <span ref={numberRef} className={`inline-block font-satoshi text-rv-faint ${TYPE.statLabel}`} style={{ opacity: 0.3 }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <h3 className="mt-3 font-grotesk text-2xl font-light md:text-3xl">
        {words.map((w, i) => (
          <span
            key={i}
            ref={(el) => el && wordRefs.current.push(el)}
            className="mr-[0.28em] inline-block text-rv-faint transition-none"
          >
            {w}
          </span>
        ))}
      </h3>
    </div>
  );
}

export default function PillarsShaped({ data }) {
  const sectionRef = useRef(null);
  const progressRef = useRef(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    if (!sectionRef.current || !progressRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        progressRef.current,
        { height: '0%' },
        {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            scroller: getScrollerEl(),
            start: 'top center',
            end: 'bottom center',
            scrub: 0.3,
          },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="padrao" ref={sectionRef} className={`relative overflow-hidden border-t border-white/[0.06] ${SECTION_PAD} ${GX}`}>
      <div className="grid gap-14 md:grid-cols-2 md:gap-16">
        <div className="md:sticky md:top-32 md:self-start">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE_LUXE }}
            className={`font-grotesk font-light leading-[1.18] tracking-[-0.015em] ${TYPE.h2}`}
          >
            {data.declarationLines.map((line, i) => (
              <span key={i} className={line.tone === 'bright' ? 'text-rv-titanium' : 'text-rv-slate'}>
                {line.text}{' '}
              </span>
            ))}
          </motion.h2>

          <div className="mt-10 flex justify-center md:justify-start">
            <MorphGlyph paths={GLYPH_PATHS} activeIndex={active} />
          </div>
        </div>

        <div className="relative pl-6">
          <div className="absolute bottom-0 left-0 top-0 w-px bg-white/[0.08]">
            <div ref={progressRef} className="w-px bg-rv-purple-400" style={{ height: '0%' }} />
          </div>

          {data.labels.map((label, i) => (
            <PillarItem key={label} pillar={label} index={i} onEnter={setActive} />
          ))}
        </div>
      </div>
    </section>
  );
}
