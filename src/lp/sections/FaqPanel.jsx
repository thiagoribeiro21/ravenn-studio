import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import { EASE_LUXE, GX, RADIUS, SCRUB_SPRING, SECTION_PAD, TYPE, prefersReducedMotion, useSectionProgress } from '../config/_base';

/*
  Item 9 do refinamento v3 — glassmorphism reforçado (valores exatos em
  index.css, .rv-faq-item) + resposta com altura animada e fade escalonado.
  Trocado de <details> nativo (que só abre/fecha instantâneo, sem como
  animar altura) pra accordion controlado com framer-motion. Só um item
  aberto por vez — soma no máximo 1 elemento com blur "aberto" mais os 3
  fechados, dentro do teto de 4-5 simultâneos que o brief pede.

  ── Parallax de entrada, transição com "Como Funciona" ──────────────────────
  Duas camadas de movimento amarradas ao MESMO progresso 0→1 (`useSectionProgress`,
  ver config/_base.js — mesma família de `useTrackProgress` que ScrubStatement.jsx
  e PillarsShaped.jsx já usam, só com a semântica de entrada/saída de uma seção
  de altura normal em vez de trilho pinado):
    1. FUNDO    a imagem translada verticalmente bem mais devagar que o
                scroll (±15vh) — a profundidade clássica de parallax. Vive
                oversized (30vh a mais de altura, -15vh de topo) porque um
                elemento transladado por transform continua ocupando a MESMA
                caixa: sem a folga extra, os extremos do movimento
                revelariam uma tira vazia nas bordas da seção.
    2. CONTEÚDO o bloco de texto + accordion sobe e ganha nitidez/escala
                enquanto a seção entra — um "elevar" sutil, não um fade seco.
  `useSpring` com a mesma física (`SCRUB_SPRING`) que todo scrub-linked
  motion desta LP usa — inércia de "câmera pesada" consistente com o resto
  da página, não um número novo inventado pra esta seção.
*/
export default function FaqPanel({ data }) {
  const [openIndex, setOpenIndex] = useState(null);
  const sectionRef = useRef(null);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const rawProgress = useSectionProgress(sectionRef, reduced);
  const progress = useSpring(rawProgress, SCRUB_SPRING);

  const bgY = useTransform(progress, [0, 1], ['-15vh', '15vh']);
  const contentY = useTransform(progress, [0, 0.4], [100, 0]);
  const contentOpacity = useTransform(progress, [0, 0.3], [0, 1]);
  const contentScale = useTransform(progress, [0, 0.4], [0.96, 1]);

  return (
    // `z-20` + `bg-rv-void`: esta seção precisa COBRIR de verdade a "Como
    // Funciona" pinada (sticky) logo acima dela conforme rola por cima —
    // `z-20` garante a ordem de pintura certa (mesmo valor de
    // TargetAudienceCarousel.jsx, o outro lado do "sanduíche" da cortina;
    // ver CurtainReveal.jsx), e `bg-rv-void` dá uma base sólida e opaca de
    // verdade: antes o fundo vinha só da imagem + gradiente internos
    // (`data.bg` abaixo), que são absolutamente posicionados — sem uma cor
    // de base na própria `<section>`, qualquer frame em que a imagem ainda
    // não pintou deixaria o void por trás (a seção pinada) vazar através.
    <section
      ref={sectionRef}
      id="faq"
      className={`relative z-20 overflow-hidden border-t border-white/[0.06] bg-rv-void ${SECTION_PAD} ${GX}`}
    >
      {/* `overflow-hidden` já vive na própria `<section>` — é o que corta a
          imagem oversized de volta pros limites da seção; não precisa de
          mais uma camada de clip aqui. */}
      <div aria-hidden className="absolute inset-0">
        {/* `data.bg` é `{ mobile, desktop }` — mesmo padrão de `<picture>`
            que `ConsequenceCarousel.jsx`/`DeviceShot` já usam. O
            `motion.img` cai como o `<img>` de fallback dentro do
            `<picture>`: o browser escolhe a fonte certa pelo `<source>`,
            e o Framer segue controlando o parallax normalmente por cima
            do elemento resultante. */}
        <picture>
          <source media="(max-width: 767px)" srcSet={data.bg.mobile} />
          <motion.img
            src={data.bg.desktop}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-x-0 w-full object-cover"
            style={{
              top: '-15vh',
              height: 'calc(100% + 30vh)',
              y: bgY,
              // Overlay reduzido um pouco (era brightness 0.4 + gradiente
              // 80/60/90) — o fundo tinha pouca presença real, quase todo
              // o peso vinha do véu por cima. Ainda escuro o bastante pra
              // manter o texto (accordion à direita, título à esquerda)
              // confortável de ler, só menos pesado.
              filter: 'brightness(0.55)',
              willChange: 'transform',
            }}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-rv-void/65 via-rv-void/45 to-rv-void/78" />
      </div>

      <motion.div
        className="relative z-10 grid gap-12 md:grid-cols-12 md:gap-[2vw]"
        style={{ y: contentY, opacity: contentOpacity, scale: contentScale, willChange: 'transform, opacity' }}
      >
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
      </motion.div>
    </section>
  );
}
