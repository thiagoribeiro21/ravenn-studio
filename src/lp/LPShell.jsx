import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Preloader from './Preloader';
import HeroDevice from './sections/HeroDevice';
import ScrubStatement from './sections/ScrubStatement';
import SilentInbox from './sections/SilentInbox';
import ConsequenceCarousel from './sections/ConsequenceCarousel';
import CurtainReveal from './sections/CurtainReveal';
import BentoValue from './sections/BentoValue';
import ConceptStack from './sections/ConceptStack';
import CampaignAnatomy from './sections/CampaignAnatomy';
import TechniqueStack from './sections/TechniqueStack';
import PillarsShaped from './sections/PillarsShaped';
import TargetAudienceCarousel from './sections/TargetAudienceCarousel';
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

          {/* CTA no lugar dos links de navegação (eram `Serviços/Conceitos/
              Contato`, `hidden md:flex` — ou seja, no mobile o header não
              tinha ABSOLUTAMENTE NADA além da logo). Pedido explícito: numa
              LP de tráfego pago, cada elemento no header deveria empurrar
              pra conversão, não oferecer rota de saída pra outra parte da
              página. Reaproveita `hero.ctaPrimary.href` — já existe por LP,
              já tem a mensagem de WhatsApp certa pro serviço (ver os 6
              configs), zero string nova pra manter sincronizada.

              Mobile = círculo só com o ícone (44px, cabe com folga ao lado
              da logo mesmo em 375px — testado; o rótulo completo por
              extenso ali estourava a largura). Desktop (`md:`) expande pra
              pílula com rótulo — mais espaço, mais contexto. */}
          <a
            href={config.hero.ctaPrimary.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Diagnóstico gratuito pelo WhatsApp"
            className="rv-navcta-pulse group relative flex w-11 shrink-0 items-center justify-center gap-0 overflow-hidden rounded-full bg-rv-purple px-0 text-white transition-[height,padding,gap] duration-[420ms] hover:bg-rv-purple-400 md:w-auto md:justify-start md:gap-2 md:px-5"
            style={{ height: scrolled ? 38 : 44, transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
          >
            {/* faixa de brilho no hover — mesma técnica dos CTAs finais das LPs */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
            />
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="relative z-10 shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="relative z-10 hidden whitespace-nowrap font-satoshi text-[15px] font-semibold md:inline">
              Diagnóstico grátis
            </span>
          </a>
        </nav>
      </header>

      <div ref={contentRef}>
        <HeroDevice data={config.hero} />
        <ScrubStatement data={config.scrub} />
        <SilentInbox data={config.consequence} />
        <BentoValue data={config.bento} />
        {/* Ponto de extensão do molde: por padrão toda LP mostra a
            vitrine de vídeo (ConceptStack) + o objeto 3D com declaração
            (PillarsShaped). Uma LP pode trocar a primeira por
            `config.concepts.kind === 'funnel'` (CampaignAnatomy — usado em
            gestao-google-ads.js, onde vitrine-de-site e "design premium"
            não são a linguagem certa pro comprador) ou `'tech'`
            (TechniqueStack — usado em sites-imersivos.js desde que essa LP
            parou de rodar em Ads: sem campanha ativa não fazia sentido
            produzir vídeo só pra preencher o placeholder dos 3 conceitos
            antigos) e pular a segunda deixando `config.pillars` de fora do
            config. Sem isso, as duas seções padrão continuam exatamente
            como eram — nenhuma LP existente muda de comportamento. */}
        {config.concepts.kind === 'funnel' ? (
          <CampaignAnatomy data={config.concepts} />
        ) : config.concepts.kind === 'tech' ? (
          <TechniqueStack data={config.concepts} />
        ) : (
          <ConceptStack data={config.concepts} />
        )}
        {config.pillars && <PillarsShaped data={config.pillars} />}
        <TargetAudienceCarousel data={config.audience} />
        <CurtainReveal>
          <ConsequenceCarousel id="processo" eyebrow={config.process.eyebrow} heading={config.process.heading} items={config.process.steps} bg={config.process.bg} cta={config.process.cta} />
        </CurtainReveal>
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
          {/* `md:pr-28` extra: o WhatsAppButton flutuante desta LP (fixed,
              right:24, width:56, z-index:9999) ocupa os últimos ~80px da
              borda direita o tempo todo — sem essa folga, o grupo mais à
              direita da linha (`justify-between` empurra os links jurídicos
              pra ponta) renderiza parte de "Termos de Uso" atrás do botão
              (medido: ~3px do texto sob o botão em 1280px de largura, e
              o alvo de clique do botão — quadrado, `<a>` inteiro, não só o
              círculo visível — cobre mais que isso). `md:` só, porque no
              mobile a linha empilha em coluna e não chega perto do canto. */}
          <div className={`mt-12 flex flex-col items-start justify-between gap-6 border-t border-white/[0.06] py-8 md:flex-row md:items-center md:pr-28 ${GX}`}>
            <img src={config.meta.logo} alt="Ravenn Studio" width={800} height={274} loading="lazy" decoding="async" className="h-8 w-auto md:h-9" />

            {/* Copyright + links jurídicos agrupados — mesmo padrão do
                sub-footer da home (Footer.jsx), reaproveitado aqui porque
                as LPs de tráfego pago não tinham NENHUM link legal antes
                (o footer só existia como fechamento visual/marca). */}
            <div className="flex flex-col items-start gap-3 md:items-end">
              <p className={`font-satoshi text-rv-slate ${TYPE.cardDesc}`}>
                {config.footer.line} · {new Date().getFullYear()}
              </p>
              <div className="flex gap-5">
                <a
                  href="/politica-de-privacidade.html"
                  /* `text-rv-slate` (era `text-rv-faint`, ~3.8:1 de
                     contraste contra `rv-void` — abaixo do mínimo de
                     leitura confortável). `rv-slate` é a MESMA cor que o
                     `<p>` de copyright logo acima já usa (`TYPE.cardDesc`)
                     — os dois elementos da mesma linha agora leem no mesmo
                     nível de contraste, em vez do link ficar mais apagado
                     que o texto ao lado dele. */
                  className="font-satoshi text-[14px] text-rv-slate transition-colors duration-300 hover:text-rv-titanium"
                >
                  Política de Privacidade
                </a>
                <a
                  href="/termos-de-uso.html"
                  /* `text-rv-slate` (era `text-rv-faint`, ~3.8:1 de
                     contraste contra `rv-void` — abaixo do mínimo de
                     leitura confortável). `rv-slate` é a MESMA cor que o
                     `<p>` de copyright logo acima já usa (`TYPE.cardDesc`)
                     — os dois elementos da mesma linha agora leem no mesmo
                     nível de contraste, em vez do link ficar mais apagado
                     que o texto ao lado dele. */
                  className="font-satoshi text-[14px] text-rv-slate transition-colors duration-300 hover:text-rv-titanium"
                >
                  Termos de Uso
                </a>
              </div>
            </div>
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
