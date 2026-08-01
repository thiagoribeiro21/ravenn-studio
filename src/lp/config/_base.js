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

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
