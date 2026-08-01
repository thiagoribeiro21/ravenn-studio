import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Aurora from '../primitives/Aurora';
import { EASE_LUXE, GX, RADIUS, SHADOW, TYPE, getScrollerEl, prefersReducedMotion } from '../config/_base';

gsap.registerPlugin(ScrollTrigger);

/*
  Ato 3, refinamento v3 (item 5) — "as três abas": encena o argumento em
  vez de descrever. Quem chega pelo Google abre três abas e fecha duas.
  Três janelas de navegador minimalistas e genéricas (nunca um site real
  ou de concorrente) em leque; conforme o scroll, a 1ª e depois a 2ª
  dessaturam/escurecem e saem; a 3ª ganha cor, borda violeta, e assume o
  centro — só então a punchline entra. Pura CSS/GSAP, zero asset.

  Substitui o antigo uso do ConsequenceCarousel/GlassCard aqui — esse
  componente agora fica exclusivo do Processo (Ato 7), onde a numeração
  `// 01·03` é informação real (sequência), não repetida visualmente.
*/
function BrowserWindow() {
  return (
    <div
      className="w-[min(78vw,26rem)] overflow-hidden border border-white/10 bg-rv-surface-2"
      style={{ borderRadius: RADIUS.md, boxShadow: SHADOW.deep }}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-3 h-5 flex-1 rounded-full bg-white/[0.05]" />
      </div>
      <div className="space-y-3 p-5">
        <div className="h-3 w-2/3 rounded bg-white/10" />
        <div className="h-16 rounded bg-white/[0.04]" />
        <div className="h-3 w-1/2 rounded bg-white/[0.06]" />
        <div className="h-3 w-4/5 rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}

export default function ThreeTabs({ data }) {
  const sectionRef = useRef(null);
  const panelRefs = [useRef(null), useRef(null), useRef(null)];
  const punchlineRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    const reduce = prefersReducedMotion();
    const panels = panelRefs.map((r) => r.current);

    if (reduce) {
      gsap.set(panels[0], { opacity: 0.25, filter: 'grayscale(1)', x: '-30%', rotateY: 8 });
      gsap.set(panels[1], { opacity: 0.25, filter: 'grayscale(1)', x: '30%', rotateY: -8 });
      gsap.set(panels[2], { opacity: 1, filter: 'grayscale(0)', x: '0%', rotateY: 0, scale: 1.08, borderColor: 'rgba(124,58,237,0.6)' });
      gsap.set(punchlineRef.current, { opacity: 1, y: 0 });
      return;
    }

    // Estado inicial pode ser aplicado já — não depende de medição de scroll.
    gsap.set(panels[0], { x: '-32%', rotateY: 10, scale: 0.9, zIndex: 1 });
    gsap.set(panels[1], { x: '0%', rotateY: 0, scale: 1, zIndex: 2 });
    gsap.set(panels[2], { x: '32%', rotateY: -10, scale: 0.9, zIndex: 1 });
    gsap.set(punchlineRef.current, { opacity: 0, y: 24 });

    // A criação do ScrollTrigger é adiada até o layout estabilizar:
    // `start:'top top'` media a posição como se o pin-spacer do Ato 2
    // (criado no useLayoutEffect anterior, mesmo commit) ainda não
    // existisse — 1080+900 em vez do correto 1080+2880 — e nem
    // `ScrollTrigger.refresh()` chamado na hora corrigia. Testado
    // empiricamente: um `setTimeout(0)` não é suficiente, mas 1000ms
    // resolve — em vez de cravar um número mágico (frágil em devices mais
    // lentos ou mais rápidos), espera-se o `getBoundingClientRect().top`
    // ficar igual em dois frames seguidos via `requestAnimationFrame`,
    // que é o sinal real de "layout parou de se mexer", com teto de
    // segurança de 90 frames (~1,5s) pra nunca travar de vez.
    let ctx;
    let rafId;
    let cancelled = false;
    let lastTop = null;
    let stableFrames = 0;
    let attempts = 0;

    const waitForStableLayout = () => {
      if (cancelled) return;
      const top = sectionRef.current.getBoundingClientRect().top;
      attempts++;
      if (top === lastTop) {
        stableFrames++;
      } else {
        stableFrames = 0;
        lastTop = top;
      }
      if (stableFrames >= 2 || attempts >= 90) {
        createTrigger();
        return;
      }
      rafId = requestAnimationFrame(waitForStableLayout);
    };

    const createTrigger = () => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            scroller: getScrollerEl(),
            start: 'top top',
            end: '+=180%',
            scrub: 0.6,
            pin: true,
          },
        });

        // aba 1 dessatura, escurece e desliza pra fora
        tl.to(panels[0], { filter: 'grayscale(1) brightness(0.5)', opacity: 0, x: '-70%', duration: 0.3, ease: 'none' }, 0);
        // aba 2 (a "sobrevivente" na composição inicial do meio) some também
        tl.to(panels[1], { filter: 'grayscale(1) brightness(0.5)', opacity: 0, x: '-10%', scale: 0.85, duration: 0.3, ease: 'none' }, 0.32);
        // aba 3 assume o centro, ganha cor e borda violeta
        tl.to(panels[2], {
          x: '0%', rotateY: 0, scale: 1.1, zIndex: 3,
          borderColor: 'rgba(124,58,237,0.6)', boxShadow: '0 0 60px -10px rgba(124,58,237,0.35), 0 40px 80px -20px rgba(0,0,0,.8)',
          duration: 0.36, ease: 'none',
        }, 0.6);
        // punchline entra por baixo
        tl.to(punchlineRef.current, { opacity: 1, y: 0, duration: 0.2, ease: 'none' }, 0.85);
      }, sectionRef);
    };

    rafId = requestAnimationFrame(waitForStableLayout);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ctx?.revert();
    };
  }, []);

  return (
    <section id="consequencia" ref={sectionRef} className="relative h-screen overflow-hidden bg-rv-void">
      <Aurora variant="subtle" />

      <span className={`absolute right-[6vw] top-28 font-satoshi font-medium uppercase tracking-widest2 text-rv-faint ${TYPE.eyebrow}`}>
        3 abas abertas → 1 sobrevive
      </span>

      <div className={`relative z-10 flex h-full flex-col items-center justify-center ${GX}`} style={{ perspective: 1400 }}>
        <div className="relative flex h-[26rem] w-full items-center justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={panelRefs[i]}
              className="absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <BrowserWindow />
            </div>
          ))}
        </div>

        <p
          ref={punchlineRef}
          className="mt-4 max-w-3xl text-center font-grotesk font-light leading-[1.2] text-rv-titanium"
          style={{ fontSize: 'clamp(1.6rem,3.6vw,2.75rem)' }}
        >
          {data.punchline}
        </p>
      </div>
    </section>
  );
}
