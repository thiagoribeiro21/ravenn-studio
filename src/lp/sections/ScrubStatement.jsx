import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrubWords from '../primitives/ScrubWords';
import Glyph from '../primitives/Glyph';
import { GX, TYPE, getScrollerEl, prefersReducedMotion } from '../config/_base';

gsap.registerPlugin(ScrollTrigger);

/*
  Ato 2, refinamento v4 (item 4) — 3 fases numa timeline pinada:

  Fase 1 (0 → 50%): a headline acende palavra a palavra, glifos SVG
  intercalados entre palavras acendem junto (fac-símile de pontuação, não
  ícone de UI).
  Fase 2 (50% → 65%): a headline inteira faz fade out, exceto o par final
  [glifo + última palavra], que translada até o canto inferior direito e
  fica lá, inteiro e legível.
  Fase 3 (65% → 100%): o parágrafo entra alinhado à esquerda, acendendo
  palavra por palavra pelo mesmo mecanismo de `ScrubWords`.

  `scroller` vem de `getScrollerEl()` (config/_base.js, lookup direto via
  `document.querySelector('[data-lp-scroller]')`) — não dá pra confiar em
  `ScrollTrigger.defaults()` porque o `useEffect` do LPShell que o
  configura roda depois deste `useLayoutEffect`.

  Bug original: a palavra final aparecia cortada no canto ("amador" virava
  "am"). Causa: o par persistente ganhava só um `transform: translate()`
  continuando `display:inline-flex` dentro do fluxo de texto do `<p>`
  centralizado — `transform` não tira o elemento do fluxo/layout, só afeta
  pintura. Fix: ao entrar na Fase 2, o par vira `position:absolute` com
  `top`/`left` explícitos, calculados **relativos à própria `<section>`**
  (não `position:fixed` relativo ao viewport, que seria posicionado
  incorretamente pelo transform que o GSAP aplica na seção pra sustentar o
  pin em cima de um scroller custom).

  Segundo bug, achado no QA desta rodada: depois de aumentar a headline pra
  `clamp(3rem,7vw,8rem)` (também item 4), o par persistente herdava esse
  mesmo font-size gigante e só encolhia por `scale:0.7` — nada perto do
  suficiente, o que jogava a palavra pra fora da viewport (chegava a
  sobrar ~225px além da borda direita em 1440px). A âncora também era só um
  ponto de 1px (`h-px w-px`), então `top`/`left` mediam a posição de um
  ponto, não de uma caixa do tamanho real que o par ocupa depois de
  encolher — outra fonte de erro. Fix: a âncora agora é um **clone
  invisível** do par (mesmo glifo + mesma palavra) já renderizado no
  font-size final pequeno (`PERSIST_FINAL_FONT`), posicionado via
  `bottom-[8vh] right-[6vw]` — o navegador calcula o `getBoundingClientRect()`
  real dessa caixa no tamanho certo, e é esse retângulo que vira o alvo de
  `top`/`left`. A Fase 2 anima `fontSize` da palavra (não mais `scale` da
  caixa inteira) até `PERSIST_FINAL_FONT` — o glifo já tem tamanho fixo em
  px (`Glyph.jsx`), não depende de font-size, então não precisa de ajuste.
*/
const PERSIST_FINAL_FONT = 'clamp(1.35rem, 2.4vw, 1.85rem)';

function Token({ token, persistRef, wordRefs, glyphRefs }) {
  if (token.br) return <br />;

  if (token.glyph && !token.persist) {
    return (
      <Glyph
        name={token.glyph}
        className="mx-2 -translate-y-1"
        ref={(el) => el && glyphRefs.current.push(el)}
      />
    );
  }

  if (token.persist) {
    return (
      <span ref={persistRef} className="mx-2 inline-flex items-center gap-2 align-middle">
        <Glyph name={token.glyph} ref={(el) => el && glyphRefs.current.push(el)} />
        <span
          data-accent="1"
          ref={(el) => el && wordRefs.current.push(el)}
          className="inline-block text-rv-faint"
        >
          {token.text}
        </span>
      </span>
    );
  }

  return (
    <span
      ref={(el) => el && wordRefs.current.push(el)}
      data-accent={token.accent ? '1' : '0'}
      className="mr-[0.28em] inline-block text-rv-faint"
    >
      {token.text || token}
    </span>
  );
}

function CornerMoire({ position }) {
  const isTR = position === 'tr';
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute h-[45vw] w-[45vw] opacity-40 ${isTR ? '-right-[15vw] -top-[15vw]' : '-bottom-[15vw] -left-[15vw]'}`}
      style={{
        backgroundImage: 'repeating-linear-gradient(115deg, rgba(124,58,237,0.35) 0px, rgba(124,58,237,0.35) 2px, transparent 2px, transparent 14px)',
        filter: 'blur(18px)',
        maskImage: 'radial-gradient(closest-side, black, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(closest-side, black, transparent 70%)',
      }}
    />
  );
}

export default function ScrubStatement({ data }) {
  const sectionRef = useRef(null);
  const bloomRef = useRef(null);
  const headlineRef = useRef(null);
  const persistRef = useRef(null);
  const anchorRef = useRef(null);
  const wordRefs = useRef([]);
  const glyphRefs = useRef([]);
  const [bodyWords, setBodyWords] = useState(null);

  const persistToken = data.headlineTokens.find((t) => typeof t === 'object' && t.persist);

  wordRefs.current = [];
  glyphRefs.current = [];

  useLayoutEffect(() => {
    if (!bodyWords || !sectionRef.current || !persistRef.current || !anchorRef.current) return;
    const reduce = prefersReducedMotion();
    const words = wordRefs.current;
    const glyphs = glyphRefs.current;
    const persistWords = persistRef.current.querySelectorAll('[data-accent]');
    const persistGlyph = persistRef.current.querySelector('[data-scrub-glyph]');
    const others = [...words, ...glyphs].filter((el) => !persistRef.current.contains(el));

    // posições calculadas relativas à própria seção (local, imune a
    // qualquer transform que o GSAP aplique na seção pra sustentar o pin).
    const sectionRect = sectionRef.current.getBoundingClientRect();
    const startRect = persistRef.current.getBoundingClientRect();
    const endRect = anchorRef.current.getBoundingClientRect();
    const startTop = startRect.top - sectionRect.top;
    const startLeft = startRect.left - sectionRect.left;
    const endTop = endRect.top - sectionRect.top;
    const endLeft = endRect.left - sectionRect.left;

    if (reduce) {
      gsap.set(words, { opacity: 1, color: '#F8F9FA' });
      gsap.set(words.filter((w) => w.dataset.accent === '1'), { color: '#A78BFA' });
      gsap.set(glyphs, { opacity: 1, borderColor: 'rgba(124,58,237,0.6)' });
      gsap.set(others, { opacity: 0 });
      gsap.set(persistRef.current, { position: 'absolute', top: endTop, left: endLeft, whiteSpace: 'nowrap' });
      gsap.set(persistWords, { fontSize: PERSIST_FINAL_FONT });
      gsap.set(bodyWords, { opacity: 1, color: '#94A3B8' });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          scroller: getScrollerEl(),
          start: 'top top',
          end: '+=220%',
          scrub: 0.6,
          pin: true,
        },
      });

      tl.to(bloomRef.current, { scale: 2.2, opacity: 0.85, ease: 'none' }, 0);

      // Fase 1 (0 → 50%) — headline + glifos acendem juntos, em ordem do DOM.
      const allSeq = [...words, ...glyphs].sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));
      allSeq.forEach((el, i) => {
        const t = (i / allSeq.length) * 0.5;
        if (el.dataset.scrubGlyph !== undefined || el.hasAttribute('data-scrub-glyph')) {
          tl.to(el, { opacity: 1, borderColor: 'rgba(124,58,237,0.6)', duration: 0.15, ease: 'none' }, t);
        } else {
          const accent = el.dataset.accent === '1';
          tl.to(el, { opacity: 1, color: accent ? '#A78BFA' : '#F8F9FA', duration: 0.15, ease: 'none' }, t);
        }
      });

      // Fase 2 (50% → 65%) — some tudo, exceto o par final. No exato
      // instante em que a fase começa, ele sai do fluxo de texto
      // (position:absolute, nowrap) plantado na sua própria posição atual
      // — só então anima top/left até o canto. Isso garante que a palavra
      // nunca fica espremida pelo texto ao redor dela encolhendo.
      tl.set(persistRef.current, { position: 'absolute', top: startTop, left: startLeft, whiteSpace: 'nowrap', x: 0, y: 0 }, 0.5);
      tl.to(others, { opacity: 0, duration: 0.15, ease: 'none' }, 0.5);
      tl.to(persistRef.current, { top: endTop, left: endLeft, duration: 0.15, ease: 'none' }, 0.5);
      tl.to(persistWords, { opacity: 1, color: '#A78BFA', fontSize: PERSIST_FINAL_FONT, duration: 0.15, ease: 'none' }, 0.5);
      tl.to(persistGlyph, { opacity: 1, borderColor: 'rgba(124,58,237,0.6)' }, 0.5);

      // Fase 3 (65% → 100%) — parágrafo entra à esquerda, mesmo mecanismo de ScrubWords.
      bodyWords.forEach((w, i) => {
        tl.to(w, { opacity: 1, color: '#94A3B8', duration: 0.12, ease: 'none' }, 0.68 + i * 0.02);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [bodyWords]);

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden bg-rv-void">
      <CornerMoire position="tr" />
      <CornerMoire position="bl" />

      <div
        ref={bloomRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70vh] origin-bottom opacity-30"
        style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(124,58,237,0.55), transparent 62%)' }}
      />

      {/* âncora invisível — clone do par [glifo+palavra] já no tamanho final
          pequeno (PERSIST_FINAL_FONT), posicionado no canto real via
          bottom/right. O navegador calcula o getBoundingClientRect() certo
          pra essa caixa, e é esse retângulo (não um ponto de 1px) que vira
          o alvo de top/left do par de verdade — assim o tamanho medido bate
          com o tamanho que ele vai ter quando chegar lá. */}
      {persistToken && (
        <span
          ref={anchorRef}
          aria-hidden
          // bottom-11vh (não 8vh): o botão fixo do WhatsApp ocupa o canto
          // inferior-direito real da viewport (bottom/right:24px, 56x56) —
          // essa folga extra garante que o par pousa acima dele, sem
          // sobreposição, em vez de disputar o mesmo pixel.
          className="pointer-events-none absolute bottom-[11vh] right-[6vw] inline-flex items-center gap-2 opacity-0"
          style={{ fontSize: PERSIST_FINAL_FONT }}
        >
          <Glyph name={persistToken.glyph} />
          <span>{persistToken.text}</span>
        </span>
      )}

      <div className={`relative z-10 flex h-full flex-col items-center justify-center ${GX}`}>
        <div ref={headlineRef} className="mx-auto max-w-5xl text-center">
          <p className={`font-grotesk font-light leading-[1.25] tracking-[-0.02em] ${TYPE.h1}`} style={{ fontSize: 'clamp(3rem,7vw,8rem)' }}>
            {data.headlineTokens.map((token, i) => (
              <Token
                key={i}
                token={typeof token === 'string' ? { text: token } : token}
                persistRef={persistRef}
                wordRefs={wordRefs}
                glyphRefs={glyphRefs}
              />
            ))}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl self-start md:self-center md:text-left">
          <ScrubWords
            lines={[data.paragraph]}
            onWords={setBodyWords}
            lineClassName={`font-satoshi text-left ${TYPE.body}`}
          />
        </div>
      </div>
    </section>
  );
}
