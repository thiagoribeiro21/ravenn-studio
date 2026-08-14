import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import Aurora from '../primitives/Aurora';
import { EASE_LUXE, GX, TYPE, SECTION_PAD, prefersReducedMotion } from '../config/_base';

/* ══════════════════════════════════════════════════════════════════════════
   Ato "O que você recebe" — v10. Redesign completo.

   ── A mudança de fundo: de fac-símile de UI pra ícone animado ──────────────
   Até a v9 os 4 mockups eram MINIATURAS DE INTERFACE montadas em HTML: uma
   moldura de celular com <div>s, bolhas de chat com <div>s, um cartão de
   avaliação com <div>s, um anel + chips. Cada um tinha seu próprio
   vocabulário visual (um é um telefone, outro é uma conversa, outro é um
   card) — juntos liam como quatro capturas de tela diferentes coladas na
   mesma seção, não como um sistema.

   Agora os 4 são SVG de line-art no MESMO viewBox (200×200), com a mesma
   gramática: traço fino, gradiente violeta, desenho por `pathLength`
   (aquele "traço que se desenha sozinho" que é a assinatura visual de
   Lottie), e um loop de vida contínuo depois da entrada. É isso que faz
   parecer uma família de ícones animados em vez de quatro prints.

   Por que SVG e não Lottie de verdade: um .lottie/.json exigiria uma
   dependência nova (`lottie-web`, ~250kB) e um asset de rede por ícone —
   contra a regra que o projeto inteiro já segue (ver `NOISE_URI` em
   config/_base.js, um data-URI só pra não disparar uma requisição). SVG
   inline + Framer entrega a mesma linguagem visual com zero bytes de rede,
   zero dependência, e ainda deixa cada ícone reagir ao estado do React
   (`play`, `reduce`, cor de acento).

   ── Gotcha de SVG + Framer que moldou o código abaixo ──────────────────────
   `buildSVGAttrs` (node_modules/framer-motion/dist/es/render/svg/utils/)
   SOBRESCREVE `style.transformOrigin` de qualquer elemento SVG que o Framer
   esteja transformando — calculando a origem a partir do bbox do PRÓPRIO
   elemento (default 0.5/0.5 = centro dele mesmo), não do viewBox. Então
   `style={{ transformOrigin: '100px 100px' }}` seria descartado
   silenciosamente, e o ponto em órbita giraria em torno de si mesmo em vez
   de orbitar o centro. `calcOrigin` devolve strings verbatim — por isso a
   órbita usa `originX: '100px'` / `originY: '100px'`, que é a API correta
   pra isso (mesma classe do conflito Tailwind×Framer no `transform` que já
   apareceu no Ato 2).
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Sistema visual compartilhado pelos 4 ícones ─────────────────────────── */
const TRACK = 'rgba(255,255,255,0.09)';   // trilho "apagado" — o mesmo em todos
const DRAW_EASE = EASE_LUXE;

/* Par de gradiente por ícone. É direção de arte, não conteúdo — mora aqui,
   não no config (mesmo critério de `CARD_TINTS` em TargetAudienceCarousel).
   Os 3 primeiros são a escala de roxos da marca; o 4º mantém o verde do
   WhatsApp porque ali a cor é INFORMAÇÃO (diz de qual canal se está
   falando), não decoração — um acento entre quatro lê como sinal
   deliberado, não como ruído. */
const ACCENTS = {
  pagespeed: ['#C4B5FD', '#7C3AED'],
  wireframe: ['#A78BFA', '#7C3AED'],
  authority: ['#DDD6FE', '#8B5CF6'],
  target: ['#C4B5FD', '#8B5CF6'],
  whatsapp: ['#25D366', '#0E8043'],
};

/* `useId` (React 18) em vez de ids fixos: `<linearGradient id="x">` é
   GLOBAL no documento — dois SVGs com o mesmo id fazem o segundo herdar o
   gradiente do primeiro. Com um id fixo funcionaria hoje (uma instância de
   cada), mas quebraria no dia em que a mesma célula aparecesse duas vezes
   na página. */
function SvgDefs({ uid, from, to }) {
  return (
    <defs>
      <linearGradient id={`${uid}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
      <linearGradient id={`${uid}-shine`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${uid}-halo`}>
        <stop offset="0%" stopColor={from} stopOpacity="0.28" />
        <stop offset="100%" stopColor={from} stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/*
  Brilho aplicado por um <g> COMUM, nunca no `style` de um `motion.*` SVG.

  Motivo: `buildSVGAttrs` faz `state.attrs = state.style` — pra elementos
  SVG o Framer move o style inteiro pra ATRIBUTOS (só `transform` volta pro
  style). Então `style={{ filter: 'drop-shadow(...)' }}` num `motion.path`
  vira `filter="drop-shadow(...)"`, um atributo de apresentação. O SVG2
  aceita filter-functions ali, mas o suporte é desigual — o WebKit
  historicamente só honra `url(#id)` NO ATRIBUTO, enquanto a PROPRIEDADE CSS
  `filter` com drop-shadow() funciona em todos. Num <g> comum o React
  escreve style.filter de verdade (propriedade CSS), que é o caminho
  universalmente suportado.
*/
function Glow({ color, blur = 8, children }) {
  return <g style={{ filter: `drop-shadow(0 0 ${blur}px ${color})` }}>{children}</g>;
}

/* Moldura comum — todo ícone nasce no mesmo palco 200×200 com o mesmo halo
   de fundo. É o que faz os quatro lerem como um conjunto. */
function IconStage({ children, uid, className = '' }) {
  return (
    <svg viewBox="0 0 200 200" className={`h-full w-full ${className}`} aria-hidden focusable="false">
      {children}
      <circle cx="100" cy="100" r="92" fill={`url(#${uid}-halo)`} style={{ mixBlendMode: 'screen' }} />
    </svg>
  );
}

/* ══ 01 — Performance: medidor que preenche ═══════════════════════════════ */
const GAUGE_R = 62;
const GAUGE_PATH = 'M 56.16 143.84 A 62 62 0 1 1 143.84 143.84'; // 270°, começa em 135° e varre horário

function GaugeTick({ tick, progress, from }) {
  const opacity = useTransform(progress, [tick.at - 0.06, tick.at], [0.1, 1]);
  return (
    <motion.line
      x1={tick.x1}
      y1={tick.y1}
      x2={tick.x2}
      y2={tick.y2}
      stroke={from}
      strokeWidth="2"
      strokeLinecap="round"
      style={{ opacity }}
    />
  );
}

function PerformanceIcon({ play, reduce, uid, from, gaugeLabel = 'PAGESPEED' }) {
  const progress = useMotionValue(0);
  const value = useTransform(progress, (v) => Math.round(v * 100));

  const ticks = useMemo(() => {
    const out = [];
    const N = 26;
    for (let i = 0; i < N; i += 1) {
      const frac = i / (N - 1);
      const a = (135 + 270 * frac) * (Math.PI / 180);
      out.push({
        x1: 100 + Math.cos(a) * 72,
        y1: 100 + Math.sin(a) * 72,
        x2: 100 + Math.cos(a) * 79,
        y2: 100 + Math.sin(a) * 79,
        // último tick acende em 0.9 (o valor final), não em 1 — senão ficaria
        // apagado pra sempre, já que o medidor nunca chega a 100.
        at: frac * 0.9,
      });
    }
    return out;
  }, []);

  useEffect(() => {
    if (!play) return undefined;
    if (reduce) {
      progress.set(0.98);
      return undefined;
    }
    let cancelled = false;
    let controls;
    let pause;

    const cycle = async () => {
      while (!cancelled) {
        progress.set(0);
        controls = animate(progress, 0.98, { duration: 1.6, ease: DRAW_EASE });
        await controls;
        if (cancelled) return;
        await new Promise((r) => { pause = setTimeout(r, 2000); });
      }
    };
    cycle();

    return () => {
      cancelled = true;
      controls?.stop();
      clearTimeout(pause);
    };
  }, [play, reduce, progress]);

  return (
    <IconStage uid={uid}>
      <SvgDefs uid={uid} from={from} to={ACCENTS.pagespeed[1]} />

      {ticks.map((tick, i) => (
        <GaugeTick key={i} tick={tick} progress={progress} from={from} />
      ))}

      <path d={GAUGE_PATH} stroke={TRACK} strokeWidth="7" strokeLinecap="round" fill="none" />
      <Glow color={`${from}77`} blur={7}>
        <motion.path
          d={GAUGE_PATH}
          stroke={`url(#${uid}-stroke)`}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          style={{ pathLength: progress }}
        />
      </Glow>

      <motion.text
        x="100"
        y="96"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#F8F9FA"
        fontSize="44"
        fontFamily="ClashGrotesk-Variable, sans-serif"
        fontWeight="500"
      >
        {value}
      </motion.text>
      <text
        x="100"
        y="126"
        textAnchor="middle"
        fill="#5B6472"
        fontSize="11"
        letterSpacing="3"
        fontFamily="Satoshi-Variable, sans-serif"
      >
        {gaugeLabel}
      </text>
    </IconStage>
  );
}

/* ══ 02 — Arquitetura: blocos que se montam + fluxo até o botão ═══════════ */
const BLOCKS = [
  { x: 52, y: 44, w: 96, h: 11, rx: 5.5 },
  { x: 52, y: 68, w: 96, h: 24, rx: 8 },
  { x: 52, y: 100, w: 96, h: 24, rx: 8 },
];
const CTA_RECT = { x: 74, y: 138, w: 52, h: 19, rx: 9.5 };
const FLOW_CYCLE = 3.4;
const FLOW_LAND = 0.62; // fração do ciclo em que o ponto encosta no botão

function ArchitectureIcon({ play, reduce, uid, from }) {
  const loop = reduce ? undefined : { duration: FLOW_CYCLE, repeat: Infinity, ease: 'easeInOut' };

  return (
    <IconStage uid={uid}>
      <SvgDefs uid={uid} from={from} to={ACCENTS.wireframe[1]} />

      {BLOCKS.map((b, i) => (
        <motion.rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx={b.rx}
          fill="rgba(255,255,255,0.02)"
          stroke={i === 0 ? `url(#${uid}-stroke)` : TRACK}
          strokeWidth="1.6"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={play ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.9, delay: 0.15 + i * 0.16, ease: DRAW_EASE }}
        />
      ))}

      {/* botão-alvo — preenche e pulsa no instante em que o ponto chega */}
      <motion.rect
        x={CTA_RECT.x}
        y={CTA_RECT.y}
        width={CTA_RECT.w}
        height={CTA_RECT.h}
        rx={CTA_RECT.rx}
        fill={`url(#${uid}-stroke)`}
        style={{ willChange: 'opacity' }}
        animate={reduce ? { opacity: 0.9 } : { opacity: [0.35, 0.35, 1, 0.5, 0.35] }}
        transition={reduce ? undefined : { ...loop, times: [0, FLOW_LAND - 0.03, FLOW_LAND + 0.04, FLOW_LAND + 0.2, 1] }}
      />

      {/* anel de "clique" que expande no mesmo instante */}
      {!reduce && (
        <motion.circle
          cx={CTA_RECT.x + CTA_RECT.w / 2}
          cy={CTA_RECT.y + CTA_RECT.h / 2}
          r="16"
          fill="none"
          stroke={from}
          strokeWidth="1.5"
          style={{ willChange: 'transform, opacity' }}
          animate={{ scale: [0.6, 0.6, 1.5], opacity: [0, 0.7, 0] }}
          transition={{ ...loop, times: [0, FLOW_LAND, FLOW_LAND + 0.24] }}
        />
      )}

      {/* ponto de fluxo — desce pela coluna e encosta no botão */}
      {play && !reduce && (
        <Glow color={from}>
          <motion.circle
            r="4"
            cx="100"
            fill={from}
            style={{ willChange: 'opacity' }}
            animate={{ cy: [40, 80, 112, 147, 147], opacity: [0, 1, 1, 1, 0] }}
            transition={{ ...loop, times: [0, 0.24, 0.44, FLOW_LAND, FLOW_LAND + 0.18] }}
          />
        </Glow>
      )}
    </IconStage>
  );
}

/* ══ 03 — Autoridade: gema lapidada que se desenha + varredura de brilho ══ */
const GEM_OUTLINE = 'M 70 54 L 130 54 L 152 86 L 100 150 L 48 86 Z';
const GEM_FACETS = [
  'M 48 86 L 152 86',
  'M 70 54 L 84 86',
  'M 130 54 L 116 86',
  'M 84 86 L 100 150',
  'M 116 86 L 100 150',
];
const SPARK = 'M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z';
const SPARKS = [
  { x: 44, y: 44, d: 0 },
  { x: 158, y: 60, d: 0.5 },
  { x: 150, y: 132, d: 1 },
];

function AuthorityIcon({ play, reduce, uid, from }) {
  return (
    <IconStage uid={uid}>
      <SvgDefs uid={uid} from={from} to={ACCENTS.authority[1]} />
      <clipPath id={`${uid}-gem`}>
        <path d={GEM_OUTLINE} />
      </clipPath>

      {GEM_FACETS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke={TRACK}
          strokeWidth="1.4"
          fill="none"
          initial={reduce ? false : { pathLength: 0 }}
          animate={play ? { pathLength: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: DRAW_EASE }}
        />
      ))}

      <Glow color={`${from}66`} blur={9}>
        <motion.path
          d={GEM_OUTLINE}
          stroke={`url(#${uid}-stroke)`}
          strokeWidth="2.2"
          strokeLinejoin="round"
          fill="rgba(255,255,255,0.02)"
          initial={reduce ? false : { pathLength: 0 }}
          animate={play ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.3, delay: 0.1, ease: DRAW_EASE }}
        />
      </Glow>

      {/* varredura de luz — barra clara atravessando, recortada pela gema.
          O `rotate` é atributo ESTÁTICO no <g> (não animado pelo Framer),
          então não cai no problema de transform-origin descrito no topo do
          arquivo; só o `x` do filho é animado, e `x` no Framer vira
          translateX, que é exatamente o movimento desejado. */}
      {!reduce && (
        <g clipPath={`url(#${uid}-gem)`}>
          <g transform="rotate(16 100 100)">
            <motion.rect
              y="20"
              width="34"
              height="170"
              fill={`url(#${uid}-shine)`}
              style={{ willChange: 'transform' }}
              animate={{ x: [-60, 190] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2.6, ease: 'easeInOut' }}
            />
          </g>
        </g>
      )}

      {/* O `translate` fica num <g> ESTÁTICO e o `scale` no filho animado —
          nunca os dois no mesmo nó. Motivo: o Framer escreve `style.transform`
          pro scale, e a propriedade CSS `transform` VENCE o atributo de
          apresentação `transform` (atributo tem specificity zero). Com os
          dois juntos, o translate seria descartado e os três brilhos
          colapsariam no canto (0,0) do viewBox. Mesmo cuidado da varredura
          de luz acima. */}
      {SPARKS.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`}>
          <motion.path
            d={SPARK}
            fill={from}
            style={{ willChange: 'transform, opacity' }}
            animate={reduce ? { opacity: 0.8 } : { scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={reduce ? undefined : { duration: 2.2, repeat: Infinity, repeatDelay: 1.6, delay: s.d, ease: 'easeInOut' }}
          />
        </g>
      ))}
    </IconStage>
  );
}

/* ══ 05 — Precisão: alvo concêntrico que converge no centro ═══════════════
   Adicionado pra resolver um encaixe fraco: o ícone de autoridade (gema
   lapidada) comunica "luxo/caro", mas algumas células precisam comunicar
   "sob medida, não genérico" — coisas diferentes. Um alvo com anéis que se
   desenham de fora pra dentro e convergem num ponto central é a mesma
   gramática visual dos outros 3 (SvgDefs, Glow, IconStage, pathLength),
   só que a METÁFORA é "precisão/customização" em vez de "prestígio". */
const TARGET_RINGS = [78, 56, 34];

function TargetIcon({ play, reduce, uid, from }) {
  return (
    <IconStage uid={uid}>
      <SvgDefs uid={uid} from={from} to={ACCENTS.target[1]} />

      {/* 4 ticks cardeais — vocabulário de mira/precisão, reforça a leitura
          de "alvo" em vez de só "círculos concêntricos". */}
      {[0, 90, 180, 270].map((deg) => (
        <line
          key={deg}
          x1="100"
          y1="12"
          x2="100"
          y2="25"
          stroke={TRACK}
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}

      {TARGET_RINGS.map((r, i) => (
        <motion.circle
          key={r}
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={i === TARGET_RINGS.length - 1 ? `url(#${uid}-stroke)` : TRACK}
          strokeWidth={i === TARGET_RINGS.length - 1 ? 2.4 : 1.6}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={play ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.9, delay: 0.12 + i * 0.16, ease: DRAW_EASE }}
        />
      ))}

      <Glow color={from}>
        <motion.circle
          cx="100"
          cy="100"
          r="7"
          fill={from}
          style={{ willChange: 'transform, opacity' }}
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={play ? { scale: reduce ? 1 : [0, 1.3, 1], opacity: 1 } : undefined}
          transition={{ duration: 0.6, delay: 0.6, ease: DRAW_EASE }}
        />
      </Glow>

      {/* anel de "acerto" pulsando a partir do centro — mesma ideia do
          anel de clique do ArchitectureIcon, aqui em loop contínuo pra
          reforçar "sempre no alvo", não um evento único. */}
      {!reduce && (
        <motion.circle
          cx="100"
          cy="100"
          r="7"
          fill="none"
          stroke={from}
          strokeWidth="1.5"
          style={{ willChange: 'transform, opacity' }}
          animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.8, ease: 'easeOut' }}
        />
      )}
    </IconStage>
  );
}

/* ══ 04 — 24/7: balão de conversa + ponto em órbita permanente ════════════ */
const BUBBLE =
  'M 74 68 H 126 A 15 15 0 0 1 141 83 V 107 A 15 15 0 0 1 126 122 H 94 L 78 136 V 122 H 74 A 15 15 0 0 1 59 107 V 83 A 15 15 0 0 1 74 68 Z';

function AlwaysOnIcon({ play, reduce, uid, from }) {
  return (
    <IconStage uid={uid}>
      <SvgDefs uid={uid} from={from} to={ACCENTS.whatsapp[1]} />

      <circle cx="100" cy="100" r="78" fill="none" stroke={TRACK} strokeWidth="1.4" strokeDasharray="2 7" />

      {/* órbita — `originX/originY` como STRING é o único caminho que o
          Framer não sobrescreve (ver nota no topo do arquivo); com o default
          (bbox do próprio <g>) o ponto giraria em torno de si mesmo. */}
      {!reduce && (
        <motion.g
          style={{ originX: '100px', originY: '100px', willChange: 'transform' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        >
          <Glow color={from}>
            <circle cx="100" cy="22" r="4.5" fill={from} />
          </Glow>
        </motion.g>
      )}

      <Glow color={`${from}55`} blur={10}>
        <motion.path
          d={BUBBLE}
          stroke={`url(#${uid}-stroke)`}
          strokeWidth="2.2"
          strokeLinejoin="round"
          fill="rgba(255,255,255,0.025)"
          initial={reduce ? false : { pathLength: 0 }}
          animate={play ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.4, delay: 0.15, ease: DRAW_EASE }}
        />
      </Glow>

      {[82, 100, 118].map((cx, i) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy="95"
          r="5"
          fill={from}
          style={{ willChange: 'transform, opacity' }}
          animate={reduce ? { opacity: 0.9 } : { cy: [95, 88, 95], opacity: [0.35, 1, 0.35] }}
          transition={reduce ? undefined : { duration: 1.25, repeat: Infinity, delay: 1 + i * 0.16, ease: 'easeInOut' }}
        />
      ))}
    </IconStage>
  );
}

const ICONS = {
  pagespeed: PerformanceIcon,
  wireframe: ArchitectureIcon,
  authority: AuthorityIcon,
  target: TargetIcon,
  whatsapp: AlwaysOnIcon,
};

/*
  Cartão — v10. O ícone deixou de morar numa caixa própria (a v9 embrulhava
  cada mockup num `bg-rv-surface-2 p-6` com sombra, uma moldura dentro da
  moldura) e passou a flutuar direto sobre o cartão: menos bordas
  competindo, é o "clean" pedido. `CellIcon` (o quadradinho lilás de 40px
  que ficava acima do título) saiu junto — com um ícone grande e animado
  logo acima, um segundo ícone estático do MESMO conceito era redundância,
  não informação.
*/
function BentoCell({ cell, index, delay }) {
  const [play, setPlay] = useState(false);
  const uid = useId().replace(/:/g, ''); // `useId` devolve ":r0:" — ':' é inválido em seletor url(#...)
  const Icon = ICONS[cell.mockup];
  const [from, to] = ACCENTS[cell.mockup] ?? ACCENTS.pagespeed;
  const reduce = prefersReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      onViewportEnter={() => setPlay(true)}
      transition={{ duration: 0.85, delay, ease: EASE_LUXE }}
      className="group relative isolate flex flex-col overflow-hidden rounded-[28px] border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-colors duration-700 hover:bg-white/[0.035]"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -40px rgba(0,0,0,0.8)' }}
    >
      {/* Borda em gradiente que acende no hover. Técnica de máscara dupla:
          a camada é pintada só na faixa de 1px entre a borda externa e a
          caixa de conteúdo (`content-box`), porque as duas máscaras se
          cancelam no miolo (`exclude`/`xor`). É o jeito de ter borda em
          gradiente SEM abrir mão do fundo de vidro translúcido — um
          wrapper com `background:gradient` + filho opaco por cima só
          funcionaria com fundo sólido. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          padding: 1,
          background: `linear-gradient(140deg, ${from}AA, transparent 42%, transparent 58%, ${to}88)`,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
        }}
      />

      {/* Banho de cor atrás do ícone — sempre presente (fraco), reforça no
          hover. É o "gradiente" do pedido aplicado como LUZ, não como fundo
          chapado: nasce no topo, onde o ícone está, e morre antes do texto,
          que continua sobre preto puro e legível. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[62%] opacity-60 transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: `radial-gradient(75% 100% at 50% 0%, ${from}1F, transparent 72%)` }}
      />

      <div className="relative z-10 flex h-[240px] items-center justify-center px-6 pt-2 md:h-[268px]">
        <div className="h-full w-full max-w-[240px]">
          <Icon play={play} reduce={reduce} uid={uid} from={from} gaugeLabel={cell.gaugeLabel} />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-4 border-t border-white/[0.06] px-8 py-4 md:px-10">
        <span className="font-satoshi text-[13px] tabular-nums tracking-widest text-rv-faint">
          {String(index + 1).padStart(2, '0')}
        </span>
        {cell.pill && (
          <span
            className="bg-clip-text font-grotesk text-[15px] font-medium text-transparent md:text-base"
            style={{ backgroundImage: `linear-gradient(120deg, ${from}, ${to})` }}
          >
            {cell.pill}
          </span>
        )}
      </div>

      <div className="relative z-10 px-8 pb-9 md:px-10 md:pb-10">
        <h3 className="font-grotesk text-xl font-medium tracking-[-0.01em] text-rv-titanium md:text-2xl">
          {cell.title}
        </h3>
        <p className={`mt-2.5 font-satoshi text-rv-slate ${TYPE.cardDesc}`}>{cell.body}</p>
      </div>
    </motion.article>
  );
}

function BentoBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
      <Aurora variant="subtle" />
      <div
        className="absolute -right-[10vw] -top-[10vw] h-[40vw] w-[40vw] opacity-30"
        style={{
          backgroundImage: 'repeating-linear-gradient(115deg, rgba(124,58,237,0.3) 0px, rgba(124,58,237,0.3) 1px, transparent 1px, transparent 16px)',
          filter: 'blur(14px)',
          maskImage: 'radial-gradient(closest-side, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(closest-side, black, transparent 70%)',
        }}
      />
    </div>
  );
}

export default function BentoValue({ data }) {
  return (
    <section id="bento" className={`relative overflow-hidden border-t border-white/[0.06] ${SECTION_PAD} ${GX}`}>
      <BentoBackdrop />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: EASE_LUXE }}
        className="relative z-10 mb-14 max-w-2xl"
      >
        <p className={`flex items-center gap-3 font-satoshi font-medium uppercase tracking-widest2 text-rv-slate ${TYPE.eyebrow}`}>
          <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
          O que você recebe
        </p>
        <h2 className={`mt-6 font-grotesk font-light leading-[1.1] tracking-[-0.015em] text-rv-titanium ${TYPE.h2}`}>
          Não é só um site bonito.
        </h2>
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        {data.cells.map((cell, i) => (
          <BentoCell key={cell.key} cell={cell} index={i} delay={i * 0.1} />
        ))}
      </div>
    </section>
  );
}
