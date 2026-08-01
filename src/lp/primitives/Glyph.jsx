import { forwardRef } from 'react';

/*
  Glifos abstratos em line-art (item 4 do brief v3) — intercalados entre
  palavras do Ato 2 como se fossem pontuação. Geométricos e neutros de
  propósito (não são ícones de UI — um glifo de "check" ou "seta" pareceria
  botão; um anel ou losango parece sistema/marca).

  forwardRef porque o ScrubStatement precisa do nó real (`data-scrub-glyph`)
  pra animar opacity/borderColor via GSAP.
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

const Glyph = forwardRef(function Glyph({ name = 'ring', size = 28, className = '' }, ref) {
  const shape = PATHS[name] || PATHS.ring;
  return (
    <span
      ref={ref}
      data-scrub-glyph
      className={`inline-flex items-center justify-center rounded-full border align-middle ${className}`}
      style={{ width: size, height: size, borderColor: 'rgba(42,37,96,1)' /* rv-line-strong */, opacity: 0.3 }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1">
        {shape}
      </svg>
    </span>
  );
});

export default Glyph;
