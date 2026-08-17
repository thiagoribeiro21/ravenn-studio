import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE_LUXE, GX, SECTION_PAD, TYPE, prefersReducedMotion } from '../config/_base';

/* ══════════════════════════════════════════════════════════════════════════
   CampaignAnatomy — v2. Substitui ConceptStack + PillarsShaped, só na LP de
   Google Ads (`LPShell.jsx`/`SolutionPageShell.jsx` decidem por
   `config.concepts.kind === 'funnel'` + `config.pillars` ausente).

   ── Por que essas duas seções saíram do molde (mantido da v1) ────────────
     · ConceptStack é uma VITRINE DE SITE (moldura de vidro, vídeo 16:9,
       "veja o projeto pronto") — pra um serviço de gestão de mídia não
       existe "o site pronto" pra mostrar.
     · PillarsShaped é um objeto 3D girando + "design de agência premium" —
       linguagem de serviço de DESIGN. Quem contrata gestão de Ads avalia
       método e transparência, não estética.

   ── O que mudou da v1 pra v2 ─────────────────────────────────────────────
   A v1 era uma TIMELINE VERTICAL numerada (01→05, bolinha + linha + texto).
   Funcionava como sumário, mas tinha dois problemas de conversão:

     1. LIA COMO "PASSO A PASSO NOSSO", não como "estrutura da SUA conta".
        Uma timeline numerada é a gramática visual de processo de trabalho —
        exatamente o que a seção "Como funciona" (mais abaixo nesta mesma
        LP) já faz. Duas timelines na mesma página competem e a segunda
        parece repetição.
     2. NÃO MOSTRAVA O CUSTO DE NÃO TER a estrutura. Descrevia cada camada
        de forma neutra ("Campanha: definida pelo objetivo"), sem responder
        a pergunta que o comprador realmente tem: "e se eu não fizer isso,
        o que acontece com o meu dinheiro?".

   A v2 troca por um FUNIL — a mesma forma que o Google Ads e o GA4 usam
   pra mostrar etapa de campanha. Quem já roda campanha reconhece o desenho
   antes de ler qualquer palavra, e a narrativa "cada camada filtra quem
   não vai comprar antes que custe caro" (que o `intro` do config sempre
   afirmou) passa a ser LITERALMENTE visível: a faixa estreita a cada
   estágio. E cada estágio ganhou um campo `leak` — o vazamento específico
   que acontece sem aquela camada. É o que transforma uma descrição técnica
   em argumento de venda, sem inventar promessa de resultado.

   ── Por que sem números de performance ───────────────────────────────────
   A tentação óbvia num funil é carimbar "10.000 impressões → 24 vendas".
   Deliberadamente ausente: seriam números fabricados, e num material
   comercial isso lê como promessa de resultado — nem honesto nem
   defensável. O funil aqui comunica ESTRUTURA e FILTRAGEM (verdade sobre
   como a mecânica funciona), não performance prometida. Se um dia houver
   dado real de cliente autorizado, é aqui que ele entra.

   ── Por que `sticky` do CSS e não pin do GSAP ────────────────────────────
   O funil acompanha a leitura dos estágios no desktop via `position:
   sticky` puro — mesma técnica que `CapabilitiesSection.jsx` (home) já usa
   com sucesso. Pin do ScrollTrigger daria o mesmo efeito visual custando
   um pin-spacer injetado fora do controle do React (fonte conhecida de bug
   nesta base — ver a nota de `refresh duplo` em LPShell.jsx). Sticky não
   mexe na altura do documento e não tem nada pra recalcular.

   ── Zero asset ───────────────────────────────────────────────────────────
   Continua sendo só código: o funil é SVG inline, os chips são CSS. Nenhum
   vídeo, nenhuma imagem, nada pendente de produção.
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Geometria do funil ───────────────────────────────────────────────────
   Calculada, não hardcoded: mudar `STAGE_COUNT` no config (hoje 5) não
   quebra o desenho. Larguras vão de `W_TOP` a `W_BOTTOM` linearmente — é o
   estreitamento que carrega o significado da seção, então ele é derivado
   do número real de estágios, nunca de um SVG desenhado à mão. */
const VB_W = 400;
const BAND_H = 74;
const BAND_GAP = 14;
const W_TOP = 356;
const W_BOTTOM = 116;
const PAD_Y = 6;

function bandGeometry(index, total) {
  const step = (W_TOP - W_BOTTOM) / total;
  const yTop = PAD_Y + index * (BAND_H + BAND_GAP);
  const yBot = yTop + BAND_H;
  const wTop = W_TOP - index * step;
  const wBot = W_TOP - (index + 1) * step;
  const cx = VB_W / 2;
  return {
    yTop,
    yBot,
    cx,
    cy: yTop + BAND_H / 2,
    d: `M ${cx - wTop / 2} ${yTop} L ${cx + wTop / 2} ${yTop} L ${cx + wBot / 2} ${yBot} L ${cx - wBot / 2} ${yBot} Z`,
  };
}

/* Partícula que desce o eixo do funil — a leitura de "volume entrando em
   cima e sendo filtrado até embaixo". `cy` animado via Framer (não CSS):
   em SVG, `transform` CSS depende de `transform-box`/`transform-origin`
   com suporte desigual entre engines, enquanto animar o ATRIBUTO `cy` é
   universal. São 4 partículas no total — custo desprezível, e some
   inteiro sob `prefers-reduced-motion`. */
function FlowParticle({ delay, height }) {
  return (
    <motion.circle
      r="2.5"
      cx={VB_W / 2}
      fill="#C4B5FD"
      initial={{ cy: PAD_Y, opacity: 0 }}
      animate={{ cy: [PAD_Y, height], opacity: [0, 0.9, 0.9, 0] }}
      transition={{
        duration: 3.4,
        delay,
        repeat: Infinity,
        repeatDelay: 0.6,
        ease: 'easeIn',
        times: [0, 0.12, 0.82, 1],
      }}
      style={{ filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.9))' }}
    />
  );
}

function FunnelChart({ stages, activeIndex, onHover, reduce }) {
  const uid = useId().replace(/:/g, '');
  const total = stages.length;
  const height = PAD_Y * 2 + total * BAND_H + (total - 1) * BAND_GAP;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Funil de campanha: ${stages.map((s) => s.title).join(' → ')}`}
    >
      <defs>
        {/* Um gradiente por faixa: a saturação sobe conforme desce o funil —
            quanto mais filtrado, mais "quente" o público. É informação
            codificada em cor, não decoração. */}
        {stages.map((_, i) => (
          <linearGradient key={i} id={`${uid}-band-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4C1D95" stopOpacity={0.28 + i * 0.11} />
            <stop offset="50%" stopColor="#7C3AED" stopOpacity={0.34 + i * 0.13} />
            <stop offset="100%" stopColor="#4C1D95" stopOpacity={0.28 + i * 0.11} />
          </linearGradient>
        ))}
        <linearGradient id={`${uid}-active`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.55" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <rect x="0" y="0" width={VB_W} height={height} />
        </clipPath>
      </defs>

      {/* Partículas atrás das faixas — descem o eixo central e são
          "engolidas" pelo desenho, reforçando o filtro sem competir com o
          texto que fica por cima. */}
      {!reduce && (
        <g clipPath={`url(#${uid}-clip)`} opacity="0.75">
          {[0, 0.9, 1.8, 2.6].map((d) => (
            <FlowParticle key={d} delay={d} height={height - PAD_Y} />
          ))}
        </g>
      )}

      {stages.map((stage, i) => {
        const g = bandGeometry(i, total);
        const isActive = i === activeIndex;
        return (
          <g
            key={stage.title}
            onMouseEnter={() => onHover(i)}
            style={{ cursor: 'default' }}
          >
            <motion.path
              d={g.d}
              fill={isActive ? `url(#${uid}-active)` : `url(#${uid}-band-${i})`}
              stroke={isActive ? 'rgba(196,181,253,0.9)' : 'rgba(167,139,250,0.22)'}
              strokeWidth={isActive ? 1.6 : 1}
              initial={reduce ? false : { opacity: 0, scaleX: 0.72 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: i * 0.09, ease: EASE_LUXE }}
              style={{
                originX: `${VB_W / 2}px`,
                originY: `${g.cy}px`,
                filter: isActive ? 'drop-shadow(0 0 14px rgba(124,58,237,0.55))' : 'none',
                transition: 'filter 400ms ease',
              }}
            />

            {/* Rótulo dentro da faixa. `pointer-events:none` pra não roubar
                o hover do <path> que o envolve. */}
            <text
              x={VB_W / 2}
              y={g.cy - 4}
              textAnchor="middle"
              className="font-satoshi"
              style={{
                fill: isActive ? '#F8F9FA' : 'rgba(248,249,250,0.62)',
                fontSize: 17,
                fontWeight: 600,
                pointerEvents: 'none',
                transition: 'fill 300ms ease',
              }}
            >
              {stage.title}
            </text>
            <text
              x={VB_W / 2}
              y={g.cy + 17}
              textAnchor="middle"
              className="font-satoshi"
              style={{
                fill: isActive ? '#C4B5FD' : 'rgba(167,139,250,0.5)',
                fontSize: 12.5,
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                pointerEvents: 'none',
                transition: 'fill 300ms ease',
              }}
            >
              {stage.short}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* Card de estágio — o `leak` é o elemento de conversão da seção: diz o que
   se perde SEM aquela camada. Fica num bloco visualmente distinto (borda
   esquerda âmbar, não violeta) porque é conteúdo de outra natureza — o
   resto da página é o que a Ravenn entrega; isto é o risco de não ter. */
function StageCard({ stage, index, isActive, onActive, onHover, reduce }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onActive(index);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [index, onActive]);

  return (
    <motion.article
      ref={ref}
      onMouseEnter={() => onHover(index)}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: EASE_LUXE }}
      className={`relative rounded-2xl border p-6 transition-colors duration-500 md:p-7 ${
        isActive
          ? 'border-rv-purple/40 bg-white/[0.045]'
          : 'border-white/[0.08] bg-white/[0.015] hover:border-white/20'
      }`}
      style={isActive ? { boxShadow: '0 0 0 1px rgba(167,139,250,0.10), 0 18px 50px -24px rgba(124,58,237,0.7)' } : undefined}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-satoshi text-[13px] font-semibold tabular-nums transition-colors duration-500 ${
            isActive ? 'bg-rv-purple text-white' : 'bg-white/[0.06] text-rv-faint'
          }`}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="font-grotesk text-xl font-medium tracking-[-0.01em] text-rv-titanium md:text-[22px]">
          {stage.title}
        </h3>
      </div>

      <p className={`mt-3 font-satoshi text-rv-slate ${TYPE.cardDesc}`}>{stage.body}</p>

      <div
        className="mt-4 flex gap-3 rounded-xl border-l-2 px-4 py-3"
        style={{ borderLeftColor: 'rgba(251,146,60,0.65)', background: 'rgba(251,146,60,0.055)' }}
      >
        <span aria-hidden className="mt-[0.15em] shrink-0 text-[15px] leading-none text-[#FB923C]">
          !
        </span>
        <p className="font-satoshi text-[14.5px] leading-[1.55] text-[#FBCFA4]">
          <span className="font-semibold text-[#FDBA74]">Sem essa camada: </span>
          {stage.leak}
        </p>
      </div>
    </motion.article>
  );
}

/* ── Fechamento ───────────────────────────────────────────────────────────
   Era um parágrafo centralizado + botão. Virou o momento mais forte da
   seção, porque a frase ("você não paga por clique, paga por venda") É a
   tese comercial inteira do serviço em oito palavras.

   O par de chips existe pra dar CONTRASTE VISUAL à frase: métrica de
   vaidade (riscada, cinza, sem brilho) contra métrica real (violeta,
   viva). Sem eles a frase é só texto; com eles, a diferença entre as duas
   formas de medir fica visível antes de ser lida. */
function MetricChip({ variant, label, value }) {
  const isVanity = variant === 'vanity';
  return (
    <div
      className={`flex flex-1 items-center gap-4 rounded-2xl border px-5 py-4 ${
        isVanity ? 'border-white/[0.08] bg-white/[0.015]' : 'border-rv-purple/35 bg-rv-purple/[0.07]'
      }`}
      style={isVanity ? undefined : { boxShadow: '0 0 34px -14px rgba(124,58,237,0.85)' }}
    >
      <span
        aria-hidden
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold ${
          isVanity ? 'bg-white/[0.06] text-rv-faint' : 'bg-rv-purple text-white'
        }`}
      >
        {isVanity ? '✕' : '✓'}
      </span>
      <div className="min-w-0 text-left">
        <p
          className={`font-satoshi text-[12.5px] font-medium uppercase tracking-widest2 ${
            isVanity ? 'text-rv-faint' : 'text-rv-purple-400'
          }`}
        >
          {label}
        </p>
        <p
          className={`mt-0.5 font-grotesk text-[19px] font-medium leading-tight md:text-[21px] ${
            isVanity ? 'text-white/35 line-through decoration-white/25' : 'text-rv-titanium'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function Closing({ closing, reduce }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.8, ease: EASE_LUXE }}
      className="relative mx-auto mt-20 max-w-4xl overflow-hidden rounded-3xl border border-white/10 px-6 py-14 text-center md:mt-28 md:px-14 md:py-20"
      style={{ background: 'linear-gradient(165deg, rgba(46,23,94,0.42), rgba(8,6,15,0.9) 62%)' }}
    >
      {/* halo violeta atrás da frase — a única fonte de luz do bloco, o que
          faz a declaração ler como palco iluminado e não como caixa de aviso */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{ background: 'radial-gradient(ellipse 62% 100% at 50% 0%, rgba(124,58,237,0.28), transparent 72%)' }}
      />

      <p className="relative z-10 font-grotesk text-[clamp(1.9rem,3.4vw,3.1rem)] font-light leading-[1.12] tracking-[-0.025em]">
        {closing.lines.map((line, i) => (
          <span key={i} className={line.tone === 'bright' ? 'text-rv-titanium' : 'text-rv-slate'}>
            {line.text}{' '}
          </span>
        ))}
      </p>

      {closing.chips && (
        <div className="relative z-10 mx-auto mt-10 flex max-w-2xl flex-col gap-3 md:flex-row md:gap-4">
          <MetricChip variant="vanity" label={closing.chips.vanity.label} value={closing.chips.vanity.value} />
          <MetricChip variant="real" label={closing.chips.real.label} value={closing.chips.real.value} />
        </div>
      )}

      {closing.cta && (
        <a
          href={closing.cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative z-10 mt-10 inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-rv-purple px-8 py-4 font-satoshi font-medium text-white shadow-[0_0_44px_-8px_rgba(124,58,237,0.7)] transition-shadow duration-500 hover:shadow-[0_0_70px_-6px_rgba(124,58,237,0.95)] ${TYPE.button}`}
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

      {/* `rv-slate` pelo mesmo motivo de contraste do `funnelNote` acima —
          e aqui pesa mais: é a linha que remove a objeção de aprisionamento
          ("sem fidelidade", "a conta é sua"), não pode ser a menos legível
          do bloco. */}
      {closing.note && (
        <p className="relative z-10 mt-5 font-satoshi text-[14px] text-rv-slate">{closing.note}</p>
      )}
    </motion.div>
  );
}

export default function CampaignAnatomy({ data }) {
  const reduce = prefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  // `useCallback` porque `onActive` entra no array de deps do
  // IntersectionObserver de cada card — sem isso, o observer seria
  // destruído e recriado a cada render do pai.
  const handleActive = useCallback((i) => setActiveIndex(i), []);

  return (
    /* SEM `overflow-hidden` (nem `overflow-x-hidden` sozinho) — motivo
       verificado na prática, não suposição:

       1) Qualquer ancestral com overflow diferente de `visible`, em
          QUALQUER eixo, vira o container de referência de todo
          `position:sticky` descendente (o funil, mais abaixo). Como esta
          `<section>` não é o elemento que de fato rola
          (`[data-lp-scroller]`, várias camadas acima), isso travava o
          funil no lugar pra sempre em vez de deixá-lo grudar/soltar com o
          scroll real.
       2) A tentativa óbvia — `overflow-x-hidden` sozinho, ou até somado a
          `overflow-y-visible` explícito — NÃO resolve. Pegadinha real da
          spec CSS (verificada no DevTools: a section computava
          `overflow: hidden auto`, mesmo com `overflow-y-visible` escrito):
          se um eixo é diferente de `visible`/`clip`, o OUTRO eixo é
          FORÇADO a `auto` no valor computado, não importa o que foi
          declarado. `overflow-x: hidden` + `overflow-y: visible` juntos
          não existem de verdade no navegador — é sempre os dois ou
          nenhum.

       Nada aqui dentro precisa de corte horizontal de qualquer forma: o
       wash usa `inset-x-0` (já contido na largura da seção) e o glow do
       funil é `drop-shadow` de poucos pixels — não risco real de barra de
       rolagem horizontal. */
    <section id="conceitos" className={`relative border-t border-white/[0.06] bg-rv-void ${SECTION_PAD} ${GX}`}>
      {/* wash superior — costura com a seção anterior, mesma dose discreta
          que SilentInbox.jsx usa no topo dele */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[45%]"
        style={{
          background:
            'radial-gradient(ellipse 85% 70% at 50% 0%, rgba(124,58,237,0.13) 0%, rgba(124,58,237,0.05) 38%, transparent 76%)',
        }}
      />

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

        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-12 lg:gap-16">
          {/* Funil — sticky no desktop pra acompanhar a leitura dos cards.
              `top-28` deixa folga pro header fixo/pílula da LP. */}
          <div className="md:col-span-5">
            <div className="mx-auto max-w-[340px] md:sticky md:top-28 md:max-w-none">
              <FunnelChart
                stages={data.stages}
                activeIndex={activeIndex}
                onHover={handleActive}
                reduce={reduce}
              />
              {/* `rv-slate`, não `rv-faint`: mesma correção de contraste já
                  aplicada aos links do footer nesta base — `rv-faint` sobre
                  `rv-void` fica em ~3.8:1, abaixo do mínimo confortável. */}
              {data.funnelNote && (
                <p className="mt-5 text-center font-satoshi text-[13.5px] leading-relaxed text-rv-slate">
                  {data.funnelNote}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 md:col-span-7 md:gap-5">
            {data.stages.map((stage, i) => (
              <StageCard
                key={stage.title}
                stage={stage}
                index={i}
                isActive={i === activeIndex}
                onActive={handleActive}
                onHover={handleActive}
                reduce={reduce}
              />
            ))}
          </div>
        </div>

        {data.closing && <Closing closing={data.closing} reduce={reduce} />}
      </div>
    </section>
  );
}
