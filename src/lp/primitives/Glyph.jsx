import { forwardRef, useId } from 'react';

/*
  Glifos abstratos em line-art — intercalados entre palavras do Ato 2 como se
  fossem pontuação. Geométricos e neutros de propósito (não são ícones de UI —
  um glifo de "check" ou "seta" pareceria botão; um anel ou losango parece
  sistema/marca).

  ── v12: o que saiu, e por quê ─────────────────────────────────────────────
  A v11 empilhava quatro camadas animadas dentro de uma PÍLULA com borda:
  cometa cônico girando, satélite em órbita, giro da forma e respiração. Duas
  coisas erradas ali:

    1. A borda arredondada fazia o glifo ler como CHIP/badge de UI — um
       objeto clicável no meio de uma headline. Pontuação não tem moldura.
    2. Quatro movimentos simultâneos num objeto de ~20px viram ruído: nenhum
       deles era legível, então o conjunto lia como "algo tremendo", não como
       um mecanismo.

  A v12 tira a moldura e fica com UM movimento que dá pra ler: um traço de luz
  que percorre o anel externo. O núcleo fica parado e nítido — é ele que
  diferencia um glifo do outro, e diferenciação não pode depender de pegar o
  objeto no frame certo.

  ── Por que o anel é comum aos quatro ──────────────────────────────────────
  Todos compartilham o MESMO anel externo traçado e mudam só o núcleo. Isso
  cria família (os quatro pertencem visivelmente ao mesmo sistema) e concentra
  a animação num elemento único — a luz corre igual nos quatro, o que faz a
  linha inteira do título pulsar junto em vez de cada glifo brigar com o
  vizinho.

  ── Por que TUDO aqui continua em `em` (regra herdada da v7, não mexer) ─────
  O ScrubStatement move o par [glifo + palavra] da headline gigante até a
  âncora da direita usando UM único `transform: scale()` no par inteiro. Isso
  só é pixel-perfect se o glifo escalar junto com o texto — com `size` em px
  fixo, o glifo ficaria do mesmo tamanho enquanto a palavra encolhe, a razão
  largura-ghost/largura-âncora deixaria de ser igual à razão de font-size, e o
  cálculo do scale erraria. Vale pro nudge de alinhamento e pro glow também:
  um único valor absoluto quebraria a rigidez do corpo no meio do voo.
*/

/* Alinhamento vertical com o texto (pedido explícito) — v13.

   O Glyph aparece em DOIS contextos de layout diferentes, e cada um resolve
   `vertical-align`/centralização de um jeito distinto:

     INLINE (KineticGlyph, os 3 glifos que pontuam a headline em fluxo
     normal) — o glifo fica dentro de um `motion.span.inline-block`, que por
     sua vez é só mais um elemento na linha de texto do `<h2>`. Aqui
     `vertical-align: middle` alinha o CENTRO da caixa com "baseline + metade
     da altura-x" (~0.26em acima da baseline na Clash Grotesk), enquanto o
     centro ÓPTICO de uma linha de texto misto fica na metade da altura de
     caixa-alta (~0.35em acima da baseline) — um nudge extra é necessário
     pra fechar essa diferença. Medido: sem nudge o glifo senta baixo demais;
     com -0.14em, desvio de 0.05px contra a caixa de tinta real da palavra
     vizinha (Range().getBoundingClientRect()).

     FLEX (ghost + âncora — o par [glifo, palavra] que voa como corpo
     rígido) — aqui os dois são filhos diretos de um `inline-flex
     items-center`, e `align-items: center` já centraliza o glifo contra a
     caixa da PALAVRA (não contra a linha inteira do título). Esse
     centro já bate quase exato com o texto por construção do flexbox:
     medido, desvio de +0.5px SEM nenhum nudge. Aplicar o MESMO -0.14em
     dos glifos inline aqui era literalmente somar uma correção que o
     layout já tinha feito sozinho — o glifo subia ~13px a mais do que
     devia (medido: -12.38px de desvio, praticamente o tamanho do nudge
     inteiro). Essa dupla-correção era a causa do "não sinto 100%
     alinhado": o glifo pequeno (inline) e o grande (âncora) usavam a
     MESMA constante pra dois problemas diferentes.

   Por isso o nudge agora é um prop (`nudge`, default `true` = contexto
   inline) em vez de uma constante fixa — cada chamada em ScrubStatement.jsx
   declara o contexto em que está.

   Aplicado como `top` (o span já é `relative`) e NÃO como transform: o
   `rv-glyph-pulse` já ocupa o `transform` deste nó, e duas animations/valores
   concorrentes na mesma propriedade não se somam — o nudge simplesmente
   sumiria no primeiro frame da respiração. */
const BASELINE_NUDGE = '-0.14em';

/* `userSpaceOnUse` + coordenadas do viewBox (não `objectBoundingBox`): assim
   o gradiente atravessa o núcleo inteiro com a mesma rampa, em vez de cada
   sub-forma receber sua própria rampa completa — o que faria um círculo de
   raio 2 ter o mesmo range de cor de um de raio 5 e matar a leitura de volume. */
const STROKE_STOPS = [
  { offset: '0%', color: '#EDE9FE' },
  { offset: '52%', color: '#A78BFA' },
  { offset: '100%', color: '#7C3AED' },
];

const RING_R = 9.4;

/* Só o NÚCLEO muda entre os glifos — o anel externo é montado uma vez no
   componente. Núcleos deliberadamente distintos em SILHUETA (não em detalhe):
   a esta escala, dois glifos que só diferem por espessura de traço leem como
   o mesmo glifo. */
const CORES = {
  concentric: <circle cx="12" cy="12" r="4.6" />,
  ring: <circle cx="12" cy="12" r="2" strokeWidth="2.4" />,
  cross: (
    <>
      <line x1="12" y1="6.6" x2="12" y2="17.4" />
      <line x1="6.6" y1="12" x2="17.4" y2="12" />
    </>
  ),
  diamond: <rect x="8.1" y="8.1" width="7.8" height="7.8" rx="1.1" transform="rotate(45 12 12)" />,
};

const Glyph = forwardRef(function Glyph(
  { name = 'ring', size = '0.8em', className = '', spin = false, glow = false, pulseDelay = 0, nudge = true, style },
  ref,
) {
  // `useId()` devolve algo como `:r0:` — os dois-pontos são válidos num
  // atributo `id`, mas viram terreno pantanoso dentro de `url(#…)` (e
  // quebrariam de vez se alguém um dia tentar `querySelector` nisso).
  // Trocados fora na origem: o id continua único, sem caractere de risco.
  const uid = useId().replace(/:/g, '');
  const gradientId = `rv-glyph-core-${uid}`;
  const core = CORES[name] || CORES.ring;

  return (
    <span
      ref={ref}
      data-scrub-glyph
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center align-middle ${spin ? 'rv-glyph-pulse' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        top: nudge ? BASELINE_NUDGE : 0,
        '--rv-glyph-delay': `${pulseDelay}s`,
        // Delay NEGATIVO pro traço de luz: um delay positivo deixaria o glifo
        // parado esperando N segundos antes da primeira passada (lê como
        // travado). Negativo entra já adiantado no ciclo — os 3 glifos inline
        // nunca ficam em lockstep, e nenhum deles nasce imóvel.
        '--rv-glyph-offset': `-${(pulseDelay * 2.6).toFixed(2)}s`,
        ...style,
      }}
    >
      {/* `overflow-visible` porque o `drop-shadow` do glow vaza da viewBox e
          seria cortado pelo clip padrão do <svg> em alguns engines. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        overflow="visible"
        style={{
          width: '100%',
          height: '100%',
          filter: glow ? 'drop-shadow(0 0 0.34em rgba(167,139,250,0.55))' : 'none',
        }}
      >
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="12" y1="5" x2="12" y2="19">
            {STROKE_STOPS.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>

        {/* Trilho do anel — apagado de propósito: ele existe pra dar a FORMA
            completa do círculo, não pra brilhar. Quem brilha é o traço. */}
        <circle cx="12" cy="12" r={RING_R} stroke="rgba(139,92,246,0.32)" strokeWidth="1" />

        {/* Traço de luz que percorre o anel.

            `pathLength="1"` é o que torna isto simples: normaliza o
            comprimento do caminho para 1, então `strokeDasharray="0.2 0.8"` é
            literalmente "20% aceso, 80% apagado" e o keyframe anima o offset
            de 0 a -1 (uma volta exata) sem ninguém precisar calcular 2πr nem
            reajustar nada se o raio mudar. */}
        {spin && (
          <circle
            className="rv-glyph-trace"
            cx="12"
            cy="12"
            r={RING_R}
            pathLength="1"
            strokeDasharray="0.2 0.8"
            stroke="#DDD6FE"
            strokeWidth="1.5"
          />
        )}

        {/* Núcleo — parado e nítido, é ele que identifica o glifo. */}
        <g stroke={`url(#${gradientId})`} strokeWidth="1.5">
          {core}
        </g>
      </svg>
    </span>
  );
});

export default Glyph;
