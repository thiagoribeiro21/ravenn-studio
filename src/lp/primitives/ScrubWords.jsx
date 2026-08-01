import { useEffect, useRef } from 'react';

/*
  Renderiza linhas de texto palavra por palavra, cada uma num <span> próprio
  (apagado por padrão: rv-faint), e devolve os elementos via `onWords` pra
  quem monta o timeline de GSAP ScrollTrigger (ScrubStatement.jsx) — este
  componente não sabe nada de scroll, só de marcação. Aceita o mesmo
  marcador `_palavra_` do WordReveal/ScrubText já usados no resto da marca
  pra indicar destaque em rv-purple-400.
*/
export default function ScrubWords({ lines, onWords, className = '', lineClassName = '' }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current || !onWords) return;
    const words = Array.from(rootRef.current.querySelectorAll('[data-scrub-word]'));
    onWords(words);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // registra uma vez no mount — `lines` é conteúdo estático desta LP;
          // reexecutar a cada render (ex.: quando o caller passa um array
          // literal inline como `lines={[texto]}`) causava loop de setState.

  return (
    <div ref={rootRef} className={className}>
      {lines.map((line, li) => (
        <div key={li} className={lineClassName}>
          {line.split(' ').map((w, wi) => {
            const accent = w.startsWith('_') && w.endsWith('_');
            const clean = accent ? w.slice(1, -1) : w;
            return (
              <span
                key={wi}
                data-scrub-word
                data-accent={accent ? '1' : '0'}
                className="inline-block text-rv-faint transition-none"
                style={{ marginRight: '0.28em' }}
              >
                {clean}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
