import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_LUXE, GX, TYPE, RADIUS, SECTION_PAD } from '../config/_base';

/*
  Item 9 do refinamento v3 — glassmorphism reforçado (valores exatos em
  index.css, .rv-faq-item) + resposta com altura animada e fade escalonado.
  Trocado de <details> nativo (que só abre/fecha instantâneo, sem como
  animar altura) pra accordion controlado com framer-motion. Só um item
  aberto por vez — soma no máximo 1 elemento com blur "aberto" mais os 3
  fechados, dentro do teto de 4-5 simultâneos que o brief pede.
*/
export default function FaqPanel({ data }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className={`relative overflow-hidden border-t border-white/[0.06] ${SECTION_PAD} ${GX}`}>
      <div aria-hidden className="absolute inset-0">
        <img src={data.bg} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ filter: 'brightness(0.4)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-rv-void/80 via-rv-void/60 to-rv-void/90" />
      </div>

      <div className="relative z-10 grid gap-12 md:grid-cols-12 md:gap-[2vw]">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE_LUXE }}
              className={`flex items-center gap-3 font-satoshi font-medium uppercase tracking-widest2 text-rv-slate ${TYPE.eyebrow}`}
            >
              <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
              Perguntas diretas
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXE }}
              className={`mt-6 font-grotesk font-light leading-[1.1] tracking-[-0.015em] text-rv-titanium ${TYPE.h2}`}
            >
              O que todo cliente pergunta antes de fechar.
            </motion.h2>
            <motion.a
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: 0.25, ease: EASE_LUXE }}
              href={data.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-7 inline-flex items-center gap-2 font-satoshi font-medium text-rv-titanium transition-colors duration-300 hover:text-rv-purple-400 ${TYPE.button}`}
            >
              {data.cta.label}
              <span aria-hidden>→</span>
            </motion.a>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:col-span-6 md:col-start-7">
          {data.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: EASE_LUXE }}
                data-open={isOpen}
                className="rv-faq-item px-7 md:px-9"
                style={{ borderRadius: RADIUS.md }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-6 py-6 text-left font-grotesk text-lg font-light leading-snug text-rv-titanium transition-colors duration-300 hover:text-rv-purple-400"
                >
                  {item.q}
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-lg text-rv-slate transition-[transform,border-color] duration-300"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'none', borderColor: isOpen ? 'rgba(167,139,250,0.5)' : undefined }}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ height: { duration: 0.4, ease: EASE_LUXE }, opacity: { duration: 0.3, delay: isOpen ? 0.08 : 0 } }}
                      className="overflow-hidden"
                    >
                      <p className={`pb-7 font-satoshi leading-relaxed text-rv-slate ${TYPE.cardDesc}`}>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
