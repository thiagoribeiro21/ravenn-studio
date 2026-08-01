import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { prefersReducedMotion } from '../config/_base';

gsap.registerPlugin(MorphSVGPlugin);

/*
  Glifo grande que morfa entre N formas conforme `activeIndex` muda —
  item 8 do brief v3. MorphSVGPlugin era plugin pago (Club GreenSock) na
  época em que o brief foi escrito; desde a aquisição do GSAP pela Webflow
  em 2024 todos os plugins ficaram gratuitos e já vêm no pacote `gsap` do
  npm (confirmado: `node_modules/gsap/MorphSVGPlugin.js` existe na versão
  instalada, 3.15.0) — não precisei da interpolação manual que o brief
  previa como alternativa.
*/
export default function MorphGlyph({ paths, activeIndex, size = 240, className = '' }) {
  const pathRef = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!pathRef.current) return;
    if (!mounted.current) {
      mounted.current = true;
      return; // primeiro path já está no `d` inicial, não precisa morfar
    }
    if (prefersReducedMotion()) {
      gsap.set(pathRef.current, { attr: { d: paths[activeIndex] } });
      return;
    }
    gsap.to(pathRef.current, { duration: 0.8, ease: 'power2.inOut', morphSVG: paths[activeIndex] });
  }, [activeIndex, paths]);

  return (
    <svg width={size} height={size} viewBox="0 0 240 240" className={className} aria-hidden>
      <path ref={pathRef} d={paths[0]} fill="none" stroke="#A78BFA" strokeWidth="1" />
    </svg>
  );
}
