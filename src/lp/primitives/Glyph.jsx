import { forwardRef, useId } from 'react';

/*
  Glifos abstratos em line-art — intercalados entre palavras do Ato 2 como se
  fossem pontuação. Geométricos e neutros de propósito (não são ícones de UI —
  um glifo de "check" ou "seta" pareceria botão; um anel ou losango parece
  sistema/marca).

  ── Por que TUDO aqui é em `em` (v7) ────────────────────────────────────────
  O ScrubStatement move o par [glifo + palavra] da headline gigante até a
  âncora da direita usando UM único `transform: scale()` no par inteiro. Isso
  só é pixel-perfect se o glifo escalar junto com o texto — com `size` em px
  fixo, o glifo ficaria do mesmo tamanho enquanto a palavra encolhe, a razão
  largura-ghost/largura-âncora deixaria de ser igual à razão de font-size, e o
  cálculo do scale erraria. Em `em`, o par é um corpo rígido: um só número de
  escala descreve a transformação inteira, sem margem de erro.

  Isso vale para CADA camada nova da v11 abaixo (anel de varredura, órbita,
  satélite, halo): raio, espessura, deslocamento do satélite e os `box-shadow`
  são todos `em`. Nenhum px entra aqui — um único valor absoluto quebraria a
  rigidez do corpo e o brilho "descolaria" do glifo no meio do voo.

  ── `spin` liga QUATRO animações CSS em QUATRO nós (v11) ───────────────────
  Todas as camadas animam `transform`, e duas animations concorrentes na mesma
  propriedade do mesmo nó não se somam (a segunda substitui a primeira a cada
  frame). Por isso cada uma vive no seu próprio nó, compostas naturalmente
  pela árvore do DOM:

    <span rv-glyph-pulse>        respiração (escala + opacidade) + anel base
      <span rv-glyph-sweep />    cometa de luz cônico girando na borda
      <span rv-glyph-orbit>      trilho de órbita (gira)
        <i />                    satélite (parado no trilho, orbita com ele)
      <svg rv-glyph-spin>        a forma em si (giro lento, sentido oposto)

  Ver comentário completo em `index.css` junto das `@keyframes` — as quatro
  classes reaproveitam UMA keyframe de rotação, variando só duração e sentido.

  ── Por que o stroke é gradiente e não cor chapada (v11) ───────────────────
  Line-art de cor única lê como ícone de sistema. Um gradiente vertical
  (violeta claro no topo → violeta denso na base) dá volume e faz o glifo ler
  como objeto iluminado, coerente com o resto da cena — que é literalmente
  uma palavra voando sob luz. O `<linearGradient>` precisa de id ÚNICO por
  instância (são 4 na tela): dois `<defs>` com o mesmo id fariam todas as
  instâncias referenciarem a primeira, e ela some do DOM quando o Ato 2
  desmonta. `useId()` resolve isso sem contador global.
*/

/* `userSpaceOnUse` + coordenadas do viewBox (não `objectBoundingBox`): assim
   o gradiente atravessa o glifo INTEIRO com a mesma rampa, em vez de cada
   sub-forma (círculo externo, interno, núcleo) receber sua própria rampa
   completa — o que faria o círculo de 1.5 de raio ter o mesmo range de cor
   do de 9.2 e matar a leitura de volume. */
const STROKE_STOPS = [
  { offset: '0%', color: '#EDE9FE' },
  { offset: '48%', color: '#A78BFA' },
  { offset: '100%', color: '#7C3AED' },
];

/* Geometria v11 — cada glifo ganhou uma camada de leitura a mais que a
   line-art simples da v10, mantendo o vocabulário (círculo/cruz/losango).
   O `strokeDasharray` do anel externo só vira "radar" porque o `<svg>` gira:
   tracejado parado é textura, tracejado girando é mecanismo. */
const PATHS = {
  concentric: (
    <>
      <circle cx="12" cy="12" r="9.4" strokeWidth="1" strokeDasharray="2.6 3.8" opacity="0.7" />
      <circle cx="12" cy="12" r="5.4" />
      <circle cx="12" cy="12" r="1.6" strokeWidth="1.8" />
    </>
  ),
  ring: (
    <>
      <circle cx="12" cy="12" r="8.2" strokeWidth="1" opacity="0.38" />
      {/* Arco de ~120° em cima do anel apagado: é o que transforma um círculo
          estático num objeto com "frente" — sem ele o giro do <svg> seria
          imperceptível (um círculo perfeito girando parece parado). */}
      <path d="M12 3.8 A8.2 8.2 0 0 1 19.9 15.6" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.6" opacity="0.85" />
    </>
  ),
  cross: (
    <>
      <line x1="12" y1="2.2" x2="12" y2="21.8" />
      <line x1="2.2" y1="12" x2="21.8" y2="12" />
      {/* Diagonais mais finas e apagadas — densidade de estrela sem virar um
          asterisco de 8 pontas de peso uniforme, que leria como decoração. */}
      <line x1="5.4" y1="5.4" x2="18.6" y2="18.6" strokeWidth="0.9" opacity="0.42" />
      <line x1="18.6" y1="5.4" x2="5.4" y2="18.6" strokeWidth="0.9" opacity="0.42" />
    </>
  ),
  diamond: (
    <>
      <rect x="5.4" y="5.4" width="13.2" height="13.2" rx="1.8" transform="rotate(45 12 12)" />
      <rect
        x="8.9"
        y="8.9"
        width="6.2"
        height="6.2"
        rx="1"
        transform="rotate(45 12 12)"
        strokeWidth="1"
        opacity="0.5"
      />
    </>
  ),
};

const Glyph = forwardRef(function Glyph(
  { name = 'ring', size = '0.66em', className = '', spin = false, glow = false, pulseDelay = 0, style },
  ref,
) {
  // `useId()` devolve algo como `:r0:` — os dois-pontos são válidos num
  // atributo `id`, mas viram terreno pantanoso dentro de `url(#…)` (e
  // quebrariam de vez se alguém um dia tentar `querySelector` nisso).
  // Trocados por `-` na origem: o id continua único, sem caractere de risco.
  const uid = useId().replace(/:/g, '');
  const gradientId = `rv-glyph-stroke-${uid}`;
  const shape = PATHS[name] || PATHS.ring;

  return (
    <span
      ref={ref}
      data-scrub-glyph
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full border align-middle ${spin ? 'rv-glyph-pulse' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        borderWidth: '0.035em',
        // Anel base mais apagado que na v10 (era 0.55): agora ele é o trilho
        // sobre o qual o cometa de luz corre, não a fonte de luz em si.
        borderColor: 'rgba(124,58,237,0.38)',
        // halo difuso em `em` — escala junto com o par, nunca descola.
        boxShadow: glow
          ? '0 0 1.6em -0.55em rgba(124,58,237,0.95), inset 0 0 0.8em -0.42em rgba(167,139,250,0.65)'
          : 'none',
        '--rv-glyph-delay': `${pulseDelay}s`,
        // Delay NEGATIVO pras rotações contínuas: um delay positivo deixaria o
        // glifo parado esperando N segundos antes do primeiro giro (lê como
        // travado). Negativo entra já adiantado no ciclo — os 3 glifos inline
        // nunca ficam em lockstep, e nenhum deles fica imóvel na entrada.
        '--rv-glyph-offset': `-${(pulseDelay * 2.6).toFixed(2)}s`,
        ...style,
      }}
    >
      {/* ── Camada 1: cometa de luz cônico ────────────────────────────────
          Um `conic-gradient` (transparente na maior parte da volta, subindo
          até branco-violeta num arco curto) mascarado em ANEL e girando: a
          luz corre pela borda do glifo em vez do glifo inteiro piscar. É o
          que dá a leitura "premium/vivo" sem aumentar amplitude de movimento.

          A máscara é o que transforma o disco cônico em anel — `closest-side`
          faz `100%` valer o raio do elemento, então `calc(100% - Xem)` é a
          borda interna. Ambas as sintaxes (padrão + `-webkit-`) porque o
          Safari só implementa a prefixada. */}
      {spin && (
        <span
          className="rv-glyph-sweep pointer-events-none absolute rounded-full"
          style={{
            inset: '-0.05em',
            background:
              'conic-gradient(from 0deg, rgba(167,139,250,0) 0deg, rgba(167,139,250,0) 190deg, rgba(167,139,250,0.55) 288deg, rgba(237,233,254,0.95) 342deg, rgba(167,139,250,0) 360deg)',
            // `circle` explícito: sem isso a forma padrão é `ellipse`, que
            // num nó não-quadrado (arredondamento de subpixel em zoom, por
            // exemplo) deixaria o anel de espessura desigual.
            maskImage:
              'radial-gradient(circle closest-side, transparent calc(100% - 0.055em), #000 calc(100% - 0.05em))',
            WebkitMaskImage:
              'radial-gradient(circle closest-side, transparent calc(100% - 0.055em), #000 calc(100% - 0.05em))',
          }}
        />
      )}

      {/* ── Camada 2: satélite em órbita ──────────────────────────────────
          O wrapper é que gira; o ponto fica parado no topo do trilho e é
          carregado pela rotação. Sentido inverso ao do cometa, pra cena ter
          duas direções de movimento em vez de uma massa girando junta. */}
      {spin && (
        <span className="rv-glyph-orbit pointer-events-none absolute inset-0">
          <span
            className="absolute rounded-full"
            style={{
              top: '-0.035em',
              left: '50%',
              width: '0.07em',
              height: '0.07em',
              transform: 'translateX(-50%)',
              background: '#EDE9FE',
              boxShadow: '0 0 0.32em rgba(196,181,253,0.95)',
            }}
          />
        </span>
      )}

      {/* ── Camada 3: a forma ─────────────────────────────────────────────
          `overflow-visible` porque o `drop-shadow` do glow vaza da viewBox e
          seria cortado pelo clip padrão do <svg> em alguns engines. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        overflow="visible"
        className={spin ? 'rv-glyph-spin' : ''}
        style={{
          width: '54%',
          height: '54%',
          filter: glow ? 'drop-shadow(0 0 0.38em rgba(167,139,250,0.6))' : 'none',
        }}
      >
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="12" y1="1.5" x2="12" y2="22.5">
            {STROKE_STOPS.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
        {shape}
      </svg>
    </span>
  );
});

export default Glyph;
