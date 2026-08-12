import { useEffect, useLayoutEffect, useState } from 'react';
import { cubicBezier, useMotionValue } from 'framer-motion';

/* ── Defaults compartilhados entre todas as LPs clonadas de src/lp/ ──────── */

export const WA_PHONE = '5521989211887';

/**
 * Monta um link wa.me com mensagem pré-preenchida. Cada seção passa sua
 * própria mensagem para que o WhatsApp identifique de onde a pessoa saiu,
 * sem precisar de analytics.
 */
export function buildWaLink(text, phone = WA_PHONE) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/* Física de mola padrão da marca — pesada, fluida, cara. */
export const SPRING_LUXE = { mass: 0.5, damping: 20, stiffness: 100 };
export const EASE_LUXE = [0.16, 1, 0.3, 1];

/* Grain em SVG inline (data-URI) — zero requisição de rede. */
export const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* Margem lateral do grid — constante sagrada da página. */
export const GX = 'px-[6vw]';

/* ── Escala tipográfica v3 (Regra transversal 1) ──────────────────────────
   Fonte única de verdade — proibido tamanho solto em componente. Nada
   abaixo de 15px desktop / 14px mobile, exceto a exceção documentada no
   plano: micro-UI *dentro* dos mockups animados do bento (timestamp de
   chat, chips de métrica) é fac-símile de interface real em miniatura —
   esses continuam usando tamanho literal pequeno no próprio componente,
   não este token. Tracking já está correto em toda a página hoje (sempre
   `tracking-widest2`, nunca widest3/4) — não repetido aqui. */
export const TYPE = {
  eyebrow:   'text-[14px] md:text-[15px]',
  statLabel: 'text-[15px] md:text-[16px]',
  body:      'text-[16px] md:text-[18px] leading-[1.6]',
  cardDesc:  'text-[15px] md:text-[16px] leading-[1.55]',
  nav:       'text-[16px]',
  button:    'text-[16px]',
  statNum:   'text-[clamp(2.5rem,4vw,3.5rem)]',
  h2:        'text-[clamp(2.5rem,5vw,4.5rem)]',
  h1:        'text-[clamp(3.5rem,7vw,7rem)]',
};

/* ── Raios e sombras padronizados (Regra transversal / item 11) ─────────── */
export const RADIUS = { sm: 8, md: 18, lg: 28 }; // rounded-full fica à parte, categoria própria
export const SHADOW = {
  soft: '0 20px 50px -20px rgba(0,0,0,.6)',  // cards/mockups pequenos
  deep: '0 40px 80px -20px rgba(0,0,0,.8)',  // devices/mockups grandes flutuantes
};

/* Padding vertical mínimo por ato (item 11). */
export const SECTION_PAD = 'py-20 md:py-[120px]'; // 80px mobile / 120px desktop

/* Detecta conexões lentas / modo de economia de dados — usado pelo
   Preloader e pelo ParticleField pra degradar animação sem perguntar duas
   vezes em cada componente. */
export function isSlowConnection() {
  if (typeof navigator === 'undefined' || !navigator.connection) return false;
  const c = navigator.connection;
  return c.saveData === true || c.effectiveType === '2g' || c.effectiveType === 'slow-2g';
}

/* Detecta suporte real a WebGL — não é redundante com `isSlowConnection()`:
   aquela mede VELOCIDADE de rede, esta mede CAPACIDADE do navegador. Uma LP
   de tráfego pago recebe uma fatia relevante de cliques abertos dentro de
   webviews embutidas (Instagram, Facebook, TikTok) — vários deles restringem
   ou desligam WebGL mesmo em conexão 4G/5G rápida. Sem esse segundo check, o
   `<Canvas>` do react-three-fiber tenta montar mesmo assim e o "ícone" 3D
   simplesmente não pinta nada, sem erro visível — a causa mais provável do
   "não está aparecendo" num aparelho real que o teste em navegador de
   desktop não reproduz.

   Resultado cacheado num módulo-level var: criar e descartar um canvas de
   teste é barato, mas não há motivo pra repetir a cada chamada — o suporte a
   WebGL de um navegador não muda durante a sessão. */
let _webglSupport;
export function hasWebGL() {
  if (_webglSupport !== undefined) return _webglSupport;
  if (typeof document === 'undefined') return (_webglSupport = false);

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    _webglSupport = !!gl;
  } catch {
    _webglSupport = false;
  }
  return _webglSupport;
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* `md` do Tailwind é 768px — o mesmo valor aqui, não um número solto.
   Extraído de PillarsShaped.jsx (era local, virou compartilhado quando
   CurtainReveal.jsx passou a precisar da mesma checagem): cenas
   cinematográficas pinadas pressupõem folga vertical de sobra que telas
   curtas não têm — quem usa isto troca de árvore inteira por breakpoint
   (não `md:hidden`/`hidden md:block`, que deixaria as duas montadas ao
   mesmo tempo; ver a nota completa em PillarsShaped.jsx sobre por que isso
   importa quando um dos lados tem um `<canvas>` WebGL). */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}

/*
  Lookup direto do container de scroll (LPShell) via atributo DOM, em vez
  de ref/Context. Motivo: um ref de Context (`scrollRef.current`) chegou a
  ler `null` dentro do `useLayoutEffect` de `ThreeTabs.jsx` mesmo já
  populado com sucesso, no mesmo commit, para `ScrubStatement.jsx` — a
  causa exata não foi isolada (suspeita: a própria inserção do
  `.pin-spacer` pelo GSAP, fora do controle do React, interferindo na
  reconciliação de irmãos seguintes), mas `document.querySelector` é
  imune a esse tipo de timing porque não depende de quando o React
  processa refs/efeitos — o nó já existe no DOM real nesse ponto,
  independente de ordem. Use isto em vez de qualquer ref pra passar
  `scroller` aos ScrollTrigger criados pelas seções. */
export function getScrollerEl() {
  if (typeof document === 'undefined') return undefined;
  return document.querySelector('[data-lp-scroller]') || undefined;
}

/* ══════════════════════════════════════════════════════════════════════════
   Máquina de scroll-progress compartilhada — extraída de ScrubStatement.jsx
   (Ato 2) quando PillarsShaped.jsx (Ato 4) passou a precisar exatamente da
   mesma coisa: um progresso 0→1 de um trilho `sticky`, amortecido por mola,
   fatiável em janelas por trecho. Duplicar essas ~50 linhas na segunda seção
   seria o sinal clássico de "devia ser uma função" — a primeira cópia é
   coincidência, a segunda é padrão.
   ══════════════════════════════════════════════════════════════════════════ */

/* Física de mola do scrub — SUPERAMORTECIDA de propósito (damping ratio
   ≈ 1.5 com stiffness:100/damping:30): a mola persegue o progresso real sem
   nunca ultrapassar o alvo. Overshoot aqui tocaria valores fora de [0,1] em
   quem consome o progresso (opacity, scale, blur) — overdamped garante que
   o pior caso é "chega um instante depois", nunca "passa do ponto". */
export const SCRUB_SPRING = { stiffness: 100, damping: 30, restDelta: 0.001 };

/* `useTransform` espera uma EasingFunction de verdade, não a tupla bezier
   que `animate()`/`transition` aceitam — passar `[0.16,1,0.3,1]` direto ali
   seria lido como um array de easings por segmento e quebraria
   silenciosamente. `cubicBezier` compila a curva da marca numa função.
   Nome deliberadamente diferente de `EASE_LUXE` (a tupla, usada em toda
   `transition={{ ease: ... }}` do resto do LP) — são tipos incompatíveis,
   um alias teria escondido a diferença exatamente onde ela mais importa. */
export const EASE_LUXE_FN = cubicBezier(0.16, 1, 0.3, 1);

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Reparte uma janela de progresso em N fatias sobrepostas. `overlap` controla
 * o quanto uma fatia começa antes da anterior terminar — 1 = sequência dura,
 * 0.5 = onda macia. Pensado pra revelações MONOTÔNICAS (acende e fica —
 * palavra, parágrafo): não serve pra algo que precisa apagar de novo depois
 * (um item "ativo" que volta a ficar "inativo" quando o próximo assume —
 * isso é uma janela sobe-e-desce, forma diferente, cada consumidor com essa
 * necessidade define a própria função local em vez de forçar os dois
 * formatos dentro de uma função só).
 */
export function slot([start, end], index, total, overlap = 0.55) {
  const step = (end - start) / Math.max(total, 1);
  const from = start + index * step * overlap;
  return [from, Math.min(from + step / overlap, 1)];
}

/**
 * Progresso 0→1 de um trilho `sticky`, lido do container de scroll do
 * LPShell (`getScrollerEl()`) em vez de `window`.
 *
 * Mede por `getBoundingClientRect` a cada frame (via rAF, não a cada evento
 * de scroll) em vez de cachear offsets: seções vizinhas ainda usam pin do
 * GSAP, que muda a altura do conteúdo depois do mount, e qualquer offset
 * cacheado ficaria desatualizado justo nesse intervalo. Duas leituras de
 * layout por frame, sem escrita entre elas (o Framer agrupa os writes de
 * transform no próprio batch) — não há thrash, é o mesmo padrão do
 * ScrollTrigger.
 *
 * Por que não `useScroll` do Framer: essas rotas não rolam a `window` — o
 * LPShell rola um container próprio (`[data-lp-scroller]`,
 * `overflow-y:auto`). `useScroll({ container })` exige um RefObject já
 * populado no momento em que o hook monta, e o scroller só é descoberto via
 * `getScrollerEl()` (querySelector) depois do commit — forçar isso a
 * sincronizar pediria um remount. Esta função alimenta a MotionValue
 * diretamente; dali pra baixo (`useSpring`, `useTransform`) é Framer Motion
 * idiomático de novo.
 */
export function useTrackProgress(trackRef, disabled) {
  const progress = useMotionValue(disabled ? 1 : 0);

  useLayoutEffect(() => {
    if (disabled) {
      progress.set(1);
      return undefined;
    }
    const track = trackRef.current;
    const scroller = getScrollerEl();
    if (!track) return undefined;

    // Fallback para scroll de documento caso a seção seja usada fora do LPShell.
    const target = scroller || window;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const t = track.getBoundingClientRect();
      const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const viewHeight = scroller ? scroller.clientHeight : window.innerHeight;
      const travel = t.height - viewHeight;
      if (travel <= 0) {
        progress.set(0);
        return;
      }
      progress.set(clamp01((viewTop - t.top) / travel));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    target.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    const ro = new ResizeObserver(schedule);
    ro.observe(track);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      target.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
    };
  }, [trackRef, disabled, progress]);

  return progress;
}

/**
 * Progresso 0→1 de uma seção NORMAL (não pinada, altura de fluxo comum)
 * conforme ela atravessa a viewport — mesma semântica do offset
 * `["start end", "end start"]` do `useScroll` do Framer Motion: 0 quando o
 * TOPO da seção toca a BASE da viewport (ela está prestes a entrar), 1
 * quando a BASE da seção toca o TOPO da viewport (ela está prestes a sair
 * por completo). Pensado pra parallax de entrada/saída (fundo, elevação de
 * conteúdo) em seções curtas — `useTrackProgress` acima resolve o caso
 * irmão (trilho alto e pinado), este resolve o caso "seção de altura
 * normal passando pela tela".
 *
 * Mesmo motivo de `useTrackProgress` pra não usar `useScroll` do Framer
 * direto: esta rota não rola a `window`, e `useScroll({ container })`
 * exige o RefObject do scroller já populado no momento em que o hook monta
 * — aqui ele só é descoberto via `getScrollerEl()` depois do commit.
 */
export function useSectionProgress(sectionRef, disabled) {
  const progress = useMotionValue(disabled ? 1 : 0);

  useLayoutEffect(() => {
    if (disabled) {
      progress.set(1);
      return undefined;
    }
    const section = sectionRef.current;
    const scroller = getScrollerEl();
    if (!section) return undefined;

    const target = scroller || window;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const r = section.getBoundingClientRect();
      const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const viewHeight = scroller ? scroller.clientHeight : window.innerHeight;
      const localTop = r.top - viewTop; // topo da seção relativo ao topo da viewport real
      const travel = viewHeight + r.height; // distância entre "start end" e "end start"
      progress.set(clamp01((viewHeight - localTop) / travel));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    target.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    const ro = new ResizeObserver(schedule);
    ro.observe(section);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      target.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
    };
  }, [sectionRef, disabled, progress]);

  return progress;
}
