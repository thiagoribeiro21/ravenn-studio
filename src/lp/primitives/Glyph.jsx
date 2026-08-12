import { forwardRef } from 'react';

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

  Vale para o glow também (box-shadow em `em`) — ele cresce e diminui na mesma
  proporção, então o brilho nunca "descola" do glifo durante o voo.

  ── `spin` agora liga DUAS animações CSS em DOIS nós (v8) ──────────────────
  Giro (`rv-glyph-spin`) no `<svg>` interno, respiração de escala/opacidade
  (`rv-glyph-pulse`) no `<span>` externo — precisam ser elementos diferentes
  porque as duas mexem em `transform`, e duas animations concorrentes na
  mesma propriedade do mesmo nó não se somam (a segunda simplesmente
  substitui a primeira a cada frame). Ver comentário completo em
  `index.css` junto das duas `@keyframes`.
*/
const PATHS = {
  concentric: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
    </>
  ),
  ring: <circle cx="12" cy="12" r="7" />,
  cross: (
    <>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </>
  ),
  diamond: <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" />,
};

const Glyph = forwardRef(function Glyph(
  { name = 'ring', size = '0.66em', className = '', spin = false, glow = false, pulseDelay = 0, style },
  ref,
) {
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
        borderWidth: '0.04em',
        borderColor: 'rgba(124,58,237,0.55)',
        // halo difuso em `em` — escala junto com o par, nunca descola.
        boxShadow: glow
          ? '0 0 1.4em -0.55em rgba(124,58,237,0.9), inset 0 0 0.7em -0.4em rgba(167,139,250,0.6)'
          : 'none',
        '--rv-glyph-delay': `${pulseDelay}s`,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#A78BFA"
        strokeWidth="1.4"
        strokeLinecap="round"
        className={spin ? 'rv-glyph-spin' : ''}
        style={{
          width: '52%',
          height: '52%',
          filter: glow ? 'drop-shadow(0 0 0.35em rgba(167,139,250,0.55))' : 'none',
        }}
      >
        {shape}
      </svg>
    </span>
  );
});

export default Glyph;
