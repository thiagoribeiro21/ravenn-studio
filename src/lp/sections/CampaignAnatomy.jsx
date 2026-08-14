import { motion } from 'framer-motion';
import { EASE_LUXE, GX, SECTION_PAD, TYPE, prefersReducedMotion } from '../config/_base';

/* ══════════════════════════════════════════════════════════════════════════
   CampaignAnatomy — substitui ConceptStack + PillarsShaped, só na LP de
   Google Ads (`LPShell.jsx` decide isso por `config.concepts.kind ===
   'funnel'` + `config.pillars` ausente).

   ── Por que essas duas seções especificamente ───────────────────────────
   Um diagnóstico de conversão apontou as duas como o encaixe mais fraco da
   leva de LPs pra este serviço:
     · ConceptStack é uma VITRINE DE SITE (moldura de vidro, vídeo 16:9,
       "veja o projeto pronto") — pra um serviço de gestão de mídia, não
       existe "o site pronto" pra mostrar, e reaproveitar o formato pra
       print de dashboard arriscava ler como não sequitur.
     · PillarsShaped é um objeto 3D girando + "design de agência premium"
       — linguagem visual de serviço de DESIGN. Quem contrata gestão de
       Ads avalia método e transparência, não estética.

   A troca por UMA seção só (não duas) que mostra a ESTRUTURA real de uma
   campanha resolve os dois problemas de uma vez: é zero-asset (nenhum
   vídeo/imagem pendente, só código) e fala a língua certa do comprador
   (estrutura, não vitrine).

   ── Por que NÃO é pinada/WebGL como PillarsShaped ─────────────────────────
   Deliberado: a complexidade de scroll-jacking + Three.js do Pilares
   existe porque o objeto 3D É o produto sendo demonstrado (faz sentido
   pra Sites Imersivos). Aqui o produto é clareza de processo — uma
   timeline em fluxo normal, sem pin, comunica isso melhor E chega pronta
   sem nenhum risco novo de WebGL/performance.
   ══════════════════════════════════════════════════════════════════════════ */

function StageRow({ index, stage, total }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE_LUXE }}
      className="relative flex gap-6 pb-10 last:pb-0 md:gap-8"
    >
      {/* trilho vertical — mesma técnica de StaticPillars.jsx (borda +
          preenchimento roxo), só que aqui cada nó acende no seu próprio
          whileInView em vez de amarrado a um scroll-progress pinado. */}
      <div className="relative flex w-9 shrink-0 flex-col items-center md:w-11">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rv-purple/50 bg-rv-void font-satoshi text-[13px] font-medium tabular-nums text-rv-purple-400 md:h-11 md:w-11"
          style={{ boxShadow: '0 0 20px -4px rgba(124,58,237,0.55)' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        {index < total - 1 && (
          <motion.span
            aria-hidden
            className="mt-1 w-px flex-1 bg-rv-purple-400/40"
            style={{ transformOrigin: 'top' }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.08 + 0.15, ease: EASE_LUXE }}
          />
        )}
      </div>

      <div className="pb-2 pt-1">
        <h3 className="font-grotesk text-xl font-medium tracking-[-0.01em] text-rv-titanium md:text-2xl">
          {stage.title}
        </h3>
        <p className={`mt-2 max-w-xl font-satoshi text-rv-slate ${TYPE.cardDesc}`}>{stage.body}</p>
      </div>
    </motion.div>
  );
}

function Closing({ closing }) {
  const reduce = prefersReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: EASE_LUXE }}
      className="mx-auto mt-16 flex max-w-2xl flex-col items-center border-t border-white/[0.06] pt-14 text-center md:mt-20 md:pt-16"
    >
      <p className={`font-grotesk font-light leading-[1.2] tracking-[-0.015em] ${TYPE.h2}`}>
        {closing.lines.map((line, i) => (
          <span key={i} className={line.tone === 'bright' ? 'text-rv-titanium' : 'text-rv-slate'}>
            {line.text}{' '}
          </span>
        ))}
      </p>

      {closing.cta && (
        <a
          href={closing.cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative mt-9 inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-rv-purple px-8 py-4 font-satoshi font-medium text-white shadow-[0_0_44px_-8px_rgba(124,58,237,0.7)] transition-shadow duration-500 hover:shadow-[0_0_70px_-6px_rgba(124,58,237,0.95)] ${TYPE.button}`}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />
          <span className="relative z-10">{closing.cta.label}</span>
          <span aria-hidden className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>
      )}
    </motion.div>
  );
}

export default function CampaignAnatomy({ data }) {
  return (
    <section id="conceitos" className={`relative overflow-hidden border-t border-white/[0.06] bg-rv-void ${SECTION_PAD} ${GX}`}>
      <div className="relative z-10 mx-auto w-full max-w-[900px]">
        <header className="mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: EASE_LUXE }}
            className={`flex items-center justify-center gap-3 font-satoshi font-medium uppercase tracking-widest2 text-rv-slate ${TYPE.eyebrow}`}
          >
            <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
            {data.eyebrow}
            <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXE }}
            className={`mt-6 font-grotesk font-light leading-[1.1] tracking-[-0.02em] text-rv-titanium ${TYPE.h2}`}
          >
            {data.heading}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE_LUXE }}
            className={`mx-auto mt-6 max-w-2xl font-satoshi text-rv-slate ${TYPE.body}`}
          >
            {data.intro}
          </motion.p>
        </header>

        <div className="mt-16 md:mt-20">
          {data.stages.map((stage, i) => (
            <StageRow key={stage.title} index={i} stage={stage} total={data.stages.length} />
          ))}
        </div>

        {data.closing && <Closing closing={data.closing} />}
      </div>
    </section>
  );
}
