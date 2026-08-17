import { motion } from 'framer-motion';
import Glyph from '../primitives/Glyph';
import { EASE_LUXE, GX, SECTION_PAD, TYPE, prefersReducedMotion } from '../config/_base';

/* ══════════════════════════════════════════════════════════════════════════
   TechniqueStack — substitui ConceptStack só na LP de Sites Imersivos
   (`LPShell.jsx`/`SolutionPageShell.jsx` decidem isso por
   `config.concepts.kind === 'tech'`), mesmo mecanismo de troca que
   `CampaignAnatomy.jsx` já usa pra Gestão de Google Ads — ver o raciocínio
   completo lá, vale palavra por palavra aqui: zero-asset (nenhum vídeo/
   imagem pendente, só código), pedido explícito pra não depender de
   gravação nenhuma agora que esta LP não roda mais em Google Ads.

   ── Por que NÃO é a mesma timeline vertical de CampaignAnatomy ───────────
   Lá o conteúdo é SEQUENCIAL (fases de uma campanha, uma depois da outra —
   uma timeline numerada comunica isso certo). Aqui o conteúdo é PARALELO
   (seis técnicas que coexistem na mesma página ao mesmo tempo, nenhuma
   "vem depois" da outra) — um grid de cards é a forma certa pra essa
   relação, uma timeline aqui sugeriria uma ordem que não existe.

   ── Por que cada card recebe um <Glyph/> em vez de ícone novo ────────────
   `Glyph.jsx` (concentric/ring/cross/diamond) já É o vocabulário visual da
   marca nesta LP — reaproveitar a MESMA família em vez de desenhar seis
   ícones novos mantém a seção soando como parte do mesmo sistema, não como
   um bloco colado por fora. Ciclam pelos 4 nomes disponíveis (6 cards, 4
   glifos — dois se repetem, sem problema: a diferenciação real de cada
   card vem do título/corpo, o glifo é só ritmo visual).

   ── Por que a copy é toda verificável nesta própria página ───────────────
   Nenhuma alegação é abstrata: partículas em WebGL (o ícone do Ato de
   Pilares, mais abaixo), scroll pinado (Ato 2, Ato 4), fallback automático
   (`hasWebGL()`/`isSlowConnection()`, config/_base.js), chunk sob demanda
   (o próprio `PillarsCanvas` só baixa quando entra em vista) — quem lê
   pode literalmente continuar rolando e ver cada uma acontecer. Mantém a
   mesma promessa que o ConceptStack antigo fazia ("a prova está nesta
   própria página"), só que provada por código já rodando em vez de vídeo
   gravado.
   ══════════════════════════════════════════════════════════════════════════ */

const GLYPHS = ['concentric', 'ring', 'cross', 'diamond'];

function TechniqueCard({ item, index, reduce }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: EASE_LUXE }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors duration-500 hover:border-rv-purple/30 hover:bg-white/[0.035] md:p-8"
    >
      {/* halo que acende no hover — mesma técnica de glow radial já usada
          em GlassCard.jsx/BentoValue.jsx, sem precisar importar nada novo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'radial-gradient(circle at 30% 15%, rgba(124,58,237,0.14), transparent 62%)' }}
      />

      <Glyph name={GLYPHS[index % GLYPHS.length]} size="2.5rem" glow spin={!reduce} nudge={false} />

      <h3 className="relative z-10 mt-5 font-grotesk text-xl font-medium leading-snug tracking-[-0.01em] text-rv-titanium md:text-[22px]">
        {item.title}
      </h3>
      <p className={`relative z-10 mt-2.5 font-satoshi text-rv-slate ${TYPE.cardDesc}`}>{item.body}</p>
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

export default function TechniqueStack({ data }) {
  const reduce = prefersReducedMotion();

  return (
    <section id="conceitos" className={`relative overflow-hidden border-t border-white/[0.06] bg-rv-void ${SECTION_PAD} ${GX}`}>
      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
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

        <div className="mt-16 grid gap-5 md:mt-20 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {data.items.map((item, i) => (
            <TechniqueCard key={item.title} item={item} index={i} reduce={reduce} />
          ))}
        </div>

        {data.closing && <Closing closing={data.closing} />}
      </div>
    </section>
  );
}
