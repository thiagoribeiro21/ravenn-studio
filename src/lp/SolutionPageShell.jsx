import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { MenuProvider, useMenu } from '../context/MenuContext';
import Navbar from '../components/Navbar';
import MenuPanel from '../components/MenuPanel';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

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
import { NOISE_URI } from './config/_base';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════════════════════════════════
   Ponte entre os dois "sites" que este projeto na verdade hospeda: a home
   (SPA de página única, chrome próprio — Navbar/MenuPanel/Footer, scroll via
   `data-scroll-content`) e as 6 LPs de tráfego pago (`LPShell.jsx`, chrome
   PRÓPRIO — pílula + rodapé com marquee, scroll via `data-lp-scroller` +
   Lenis). Pedido explícito: a pessoa que chega pela HOME e clica em
   "Explorar Serviço" (ou Soluções, no menu) deve cair no MESMO conteúdo da
   LP — as mesmas seções, os mesmos componentes, o mesmo `config` — só que
   dentro do header/footer da casa, como se fosse uma subpágina. Quem chega
   pelo Google Ads continua batendo direto nos arquivos `.html` originais
   (`agentes-ia.html` etc.), 100% intocados — nada aqui os toca.

   ── Por que não é só "trocar o header/footer dentro de LPShell.jsx" ───────
   As seções da LP (`ScrubStatement`, `PillarsShaped`, `SilentInbox`...)
   resolvem o próprio scroller via `document.querySelector('[data-lp-scroller]')`
   (`getScrollerEl()`, config/_base.js) — não recebem o container por prop
   nem por Context. Pra elas funcionarem sem NENHUMA alteração, o container
   desta página precisa continuar carregando `data-lp-scroller` E rodando
   Lenis exatamente como `LPShell.jsx` já faz (mesma receita, linha por
   linha). O que muda é só o CHROME ao redor: em vez do `<header>`/`<footer>`
   próprios da LP, entram `<Navbar/>`/`<Footer/>` da home — que por sua vez
   pedem `MenuProvider` (context) e um `scrollContainerRef` populado.

   ── Por que NÃO replica o "push 3D" do SiteShell.jsx ──────────────────────
   No site principal, abrir o menu faz a página inteira encolher/deslizar
   via `transform` num wrapper `position:fixed`, revelando o `MenuPanel`
   atrás dela. Emendar esse wrapper aqui empilharia um `transform` animado
   por cima de seções que já usam `pin:true` do GSAP ScrollTrigger
   (`PillarsShaped`, `ScrubStatement`) — risco real de cálculo de pin errado
   sem ganho perceptível pra quem só queria "o header e o footer da home".
   Em vez disso, `MenuPanel` ganhou (ver `MenuPanel.jsx`) uma opacidade
   própria amarrada a `isOpen` — funciona como overlay autônomo em QUALQUER
   página, sem depender de um irmão que recua pra revelá-lo. No site
   principal isso é invisível (o `SiteShell` já cobria/revelava do jeito
   antigo; a opacidade nova só reforça, não muda nada visível lá).
   ══════════════════════════════════════════════════════════════════════════ */

function SolutionPageInner({ config }) {
  const contentRef = useRef(null);
  const { isOpen, scrollContainerRef, setScrolled } = useMenu();

  /* `scrollContainerRef` (do Context) é o PRÓPRIO `ref` do container lá
     embaixo — não um ref local copiado pra dentro dele num efeito. A
     diferença importa: um `ref={x}` do React popula `x.current` de forma
     SÍNCRONA durante o commit, antes de qualquer `useEffect` rodar; copiar
     manualmente (`scrollContainerRef.current = algumRefLocal.current`)
     dentro de um efeito só aconteceria DEPOIS dos efeitos dos filhos — e
     `<Footer/>` é filho daqui, com seu próprio `useScroll({ container:
     scrollContainerRef })` que já tenta ler essa ref no PRÓPRIO efeito de
     montagem. Bug real, visto na tela: `scrollContainerRef.current` ainda
     `null` quando o Footer perguntava, a animação de revelação (clip-path)
     nunca recebia progresso e o rodapé ficava permanentemente "escondido"
     (mesmo comportamento visual de nunca ter rolado até ele). Usar a ref do
     Context diretamente no JSX é o mesmo padrão que `SiteShell.jsx` já usa
     pra isso, por um motivo — não é estilo, é a ordem de commit do React. */
  useEffect(() => {
    const wrapper = scrollContainerRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return undefined;

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

    // Mesmo refresh duplo de LPShell.jsx — ver o comentário completo lá,
    // vale palavra por palavra aqui (seções pinadas inserindo pin-spacer
    // fora da ordem que o ScrollTrigger espera).
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
  }, [scrollContainerRef, setScrolled]);

  return (
    <div
      ref={scrollContainerRef}
      data-lp-scroller
      className="relative bg-rv-void text-rv-titanium"
      /* `zIndex:10` cobre o `MenuPanel` (z:5) quando o menu está fechado —
         mesmo número que `SiteShell.jsx` usa na home, por consistência. O
         problema aparece quando ABRE: como esta página não tem o wrapper de
         `transform` que a home usa pra encolher o conteúdo e revelar o
         painel atrás dele (ver nota grande no topo do arquivo), sem MAIS
         NADA aqui o `zIndex:10` continuaria cobrindo o painel PARA SEMPRE,
         `isOpen` ou não — o menu abriria mas ficaria fisicamente atrás de
         uma página inteira ainda sólida por cima, inclusive interceptando
         cliques. `opacity`+`pointerEvents` amarrados a `isOpen` resolvem os
         dois problemas de uma vez: opacity 0 torna o conteúdo literalmente
         não-pintado (o que está atrás, z-index menor ou não, passa a
         aparecer), e `pointerEvents:none` libera o clique pro painel por
         baixo no mesmo instante — sem precisar de nenhum transform/scale
         que arriscasse interferir no `pin:true` do GSAP ScrollTrigger das
         seções da LP. */
      style={{
        height: '100dvh',
        overflowY: 'auto',
        zIndex: 10,
        opacity: isOpen ? 0 : 1,
        pointerEvents: isOpen ? 'none' : 'auto',
        transition: 'opacity 420ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <Preloader />
      <Navbar />

      <div ref={contentRef}>
        <HeroDevice data={config.hero} />
        <ScrubStatement data={config.scrub} />
        <SilentInbox data={config.consequence} />
        <BentoValue data={config.bento} />
        {/* Mesmo ponto de extensão de LPShell.jsx — ver o comentário
            completo lá. `kind: 'tech'` (TechniqueStack) hoje só em
            sites-imersivos.js. */}
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
      </div>

      <Footer />

      {/* Blur cinematográfico + grain — mesmo par de overlays de LPShell.jsx
          (ver lá o raciocínio completo), reaproveitados sem alteração. */}
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

export default function SolutionPageShell({ config }) {
  return (
    <MenuProvider>
      <MenuPanel />
      <SolutionPageInner config={config} />
    </MenuProvider>
  );
}
