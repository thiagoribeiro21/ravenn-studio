import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Preloader from './Preloader';
import HeroDevice from './sections/HeroDevice';
import ScrubStatement from './sections/ScrubStatement';
import CostReveal from './sections/CostReveal';
import ConsequenceCarousel from './sections/ConsequenceCarousel';
import BentoValue from './sections/BentoValue';
import ConceptStack from './sections/ConceptStack';
import PillarsShaped from './sections/PillarsShaped';
import FaqPanel from './sections/FaqPanel';
import FinaleCta from './sections/FinaleCta';
import WhatsAppButton from '../components/WhatsAppButton';
import { GX, NOISE_URI, TYPE } from './config/_base';

gsap.registerPlugin(ScrollTrigger);

/*
  Árvore de atos + chrome persistente (navbar pílula, WhatsAppButton,
  Preloader) — igual em todas as LPs clonadas de src/lp/, só o `config`
  muda. Único sistema de scroll da rota: Lenis controla o container local
  (`scrollRef`, não `window` — ver decisão 1 do plano, index.css força
  overflow:hidden em html/body pra ambas as páginas do build multi-page).

  `ScrollTrigger.defaults({ scroller })` abaixo NÃO é suficiente sozinho:
  esse `useEffect` roda depois dos `useLayoutEffect` das seções filhas
  (React dispara layout effects filho-antes-do-pai), então qualquer seção
  que criasse seu ScrollTrigger contando só com o default já teria pinado
  contra o `window` errado. Um ref via Context foi tentado primeiro e se
  provou não-confiável (`scrollerRef.current` chegou a ler `null` dentro do
  `useLayoutEffect` de uma seção mesmo já populado, no mesmo commit, para
  outra — suspeita: o próprio `.pin-spacer` que o GSAP insere no DOM, fora
  do controle do React, interferindo na reconciliação dos irmãos
  seguintes). A solução robusta: o container carrega `data-lp-scroller`, e
  cada seção resolve o scroller via `getScrollerEl()`
  (`document.querySelector`, config/_base.js) — imune a timing de
  ref/efeito porque não depende de quando o React processa nada, só do nó
  já existir no DOM. O default abaixo fica como rede de segurança pra
  triggers futuros criados fora dessa árvore.
*/
export default function LPShell({ config }) {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const wrapper = scrollRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const lenis = new Lenis({ wrapper, content, autoRaf: false, duration: 1.1, smoothWheel: true });
    ScrollTrigger.defaults({ scroller: wrapper });

    const raf = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);

    const onScroll = () => setScrolled(wrapper.scrollTop > 24);
    wrapper.addEventListener('scroll', onScroll, { passive: true });

    // Refresh duplo: sections com pin:true inserem pin-spacer no DOM de
    // forma síncrona, no próprio useLayoutEffect de cada uma — se
    // ScrollTrigger.refresh() rodar entre esses efeitos (ex.: efeito de
    // uma seção pinada roda, ScrollTrigger já calcula start/end usando a
    // altura ANTES do spacer de uma seção anterior existir), o cálculo
    // fica errado e um refresh() sozinho depois não corrige — o valor já
    // ficou cravado no trigger. Dois refreshes com folga entre eles (300ms
    // + 900ms) resolve na prática: o segundo roda bem depois de todos os
    // spacers já estarem no lugar final.
    const refreshTimer1 = setTimeout(() => ScrollTrigger.refresh(), 300);
    const refreshTimer2 = setTimeout(() => ScrollTrigger.refresh(), 900);
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(refreshTimer1);
      clearTimeout(refreshTimer2);
      gsap.ticker.remove(raf);
      wrapper.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div ref={scrollRef} data-lp-scroller className="relative bg-rv-void text-rv-titanium" style={{ height: '100dvh', overflowY: 'auto' }}>
      <Preloader />

      <header
        className="fixed inset-x-0 top-0 z-40 flex justify-center pt-4 transition-[padding] duration-[420ms]"
        style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)', padding: scrolled ? '20px 0 0' : '14px 0 0' }}
      >
        <nav
          className={`flex items-center justify-between gap-6 ${GX}`}
          style={{
            width: scrolled ? '92%' : '100%',
            maxWidth: scrolled ? '64rem' : 'none',
            padding: scrolled ? '12px 28px' : '18px clamp(24px,5vw,72px)',
            borderRadius: scrolled ? 9999 : 0,
            background: scrolled ? 'rgba(5,3,10,0.60)' : 'transparent',
            backdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none',
            border: '1px solid',
            borderColor: scrolled ? 'rgba(255,255,255,0.05)' : 'transparent',
            boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)' : 'none',
            transition: [
              'width 420ms cubic-bezier(0.16,1,0.3,1)',
              'max-width 420ms cubic-bezier(0.16,1,0.3,1)',
              'padding 420ms cubic-bezier(0.16,1,0.3,1)',
              'border-radius 420ms cubic-bezier(0.16,1,0.3,1)',
              'background 420ms cubic-bezier(0.16,1,0.3,1)',
              'box-shadow 420ms cubic-bezier(0.16,1,0.3,1)',
              'border-color 420ms cubic-bezier(0.16,1,0.3,1)',
            ].join(', '),
          }}
        >
          <a href="#hero" aria-label="Ravenn Studio — início">
            <img src={config.meta.logo} alt="Ravenn Studio" width={800} height={274} className="h-7 w-auto md:h-8" />
          </a>
          <div className="hidden items-center gap-6 md:flex">
            {config.nav.links.map((l) => (
              <a key={l.label} href={l.href} className={`font-satoshi text-rv-slate transition-colors duration-300 hover:text-rv-titanium ${TYPE.nav}`}>
                {l.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <div ref={contentRef}>
        <HeroDevice data={config.hero} />
        <ScrubStatement data={config.scrub} />
        <CostReveal data={config.consequence} />
        <BentoValue data={config.bento} />
        <ConceptStack data={config.concepts} />
        <PillarsShaped data={config.pillars} />
        <ConsequenceCarousel id="processo" eyebrow={config.process.eyebrow} heading={config.process.heading} items={config.process.steps} bg={config.process.bg} cta={config.process.cta} />
        <FaqPanel data={config.faq} />
        <FinaleCta data={config.finale} />

        <footer className="overflow-hidden border-t border-white/[0.06] pt-14">
          <div className="lp-marquee flex w-max" aria-hidden>
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="flex items-center gap-8 pr-8 md:gap-14 md:pr-14">
                    <span className="lp-outline-text-strong font-grotesk text-[13vw] font-semibold leading-none md:text-[8vw]">
                      {config.footer.marqueeText}
                    </span>
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-rv-purple/70" />
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className={`mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] py-8 md:flex-row md:items-center ${GX}`}>
            <img src={config.meta.logo} alt="Ravenn Studio" width={800} height={274} loading="lazy" decoding="async" className="h-8 w-auto md:h-9" />
            <p className={`font-satoshi text-rv-slate ${TYPE.cardDesc}`}>
              {config.footer.line} · {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>

      {/* Blur cinematográfico fixo no rodapé da viewport — profundidade de
          campo sutil, presente o tempo todo enquanto a pessoa rola a
          página (não é atrelado a evento de scroll, é o mesmo overlay que
          vários sites premium usam pra dar sensação de "câmera com
          profundidade de campo" na base da tela). mask-image faz o blur
          entrar em rampa (nada no topo da faixa, cheio na borda) em vez de
          um corte seco; pointer-events:none nunca bloqueia clique; z-20
          fica abaixo do WhatsAppButton (z:9999) pra ele continuar nítido. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-[12vh]"
        style={{
          backdropFilter: 'blur(7px)',
          WebkitBackdropFilter: 'blur(7px)',
          maskImage: 'linear-gradient(to top, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30 opacity-[0.05]"
        style={{ backgroundImage: NOISE_URI, backgroundRepeat: 'repeat' }}
      />

      <WhatsAppButton link={config.whatsapp.message} />
    </div>
  );
}
