import { useRef, useEffect } from 'react';
import { scrollStore } from './scrollStore';

import { MenuProvider } from './context/MenuContext';
import MenuPanel           from './components/MenuPanel';
import SiteShell           from './components/SiteShell';

import CustomCanvasBackground from './components/CustomCanvasBackground';
import ScrollSequenceCanvas   from './components/ScrollSequenceCanvas';
import WhatsAppButton         from './components/WhatsAppButton';
import Navbar                 from './components/Navbar';
import Footer                 from './components/Footer';

import HeroSection         from './components/HeroSection';
import MetricsBar          from './components/MetricsBar';
import AudienceSection     from './components/AudienceSection';
import PortfolioSection    from './components/PortfolioSection';
import CapabilitiesSection from './components/CapabilitiesSection';
import ProcessSection      from './components/ProcessSection';
import ManifestoSection    from './components/ManifestoSection';
import FAQSection          from './components/FAQSection';
import CTASection          from './components/CTASection';
import ContactSection      from './components/ContactSection';

export default function App() {
  const animEndRef = useRef(null);

  useEffect(() => {
    const onMouse = (e) => {
      scrollStore.mouseX =  (e.clientX / window.innerWidth)  * 2 - 1;
      scrollStore.mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => { scrollStore.mouseX = 0; scrollStore.mouseY = 0; };
    window.addEventListener('mousemove',  onMouse, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove',  onMouse);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <MenuProvider>
      {/*
        ┌── z-layering ─────────────────────────────────────────────────────────┐
        │   5  MenuPanel     (position:fixed, revelado quando SiteShell recua)  │
        │  10  SiteShell     (position:fixed, push 3D)                          │
        │        ├─ bgLayer ─────────────────────────────────────────────────── │
        │        │   CustomCanvasBackground (position:fixed rel. SiteShell, z=2)│
        │        │   ScrollSequenceCanvas   (position:fixed rel. SiteShell, z=0)│
        │        └─ div[data-scroll-content] z=10, transparent ─────────────── │
        │             ├─ Navbar (sticky)                                        │
        │             ├─ main → seções transparentes: canvas visível            │
        │             │         seções sólidas (bg-[#03000A]): cobrem canvas    │
        │             └─ Footer                                                 │
        │  50  WhatsAppButton (position:fixed, fora do SiteShell → viewport)   │
        └───────────────────────────────────────────────────────────────────────┘

        Os canvases estão DENTRO do SiteShell via bgLayer.
        Como SiteShell tem transform/willChange, position:fixed dentro dele
        é relativo ao SiteShell (não ao viewport). Isso é correto:
        o canvas aparece dentro do "quadro" do site, revelado pelas seções
        com background transparente (Hero, MetricsBar, AudienceSection).
      */}

      <MenuPanel />

      <SiteShell
        bgLayer={
          <>
            <CustomCanvasBackground />
            <ScrollSequenceCanvas endRef={animEndRef} />
          </>
        }
      >
        <Navbar />

        <main
          className="relative z-20 w-full min-h-screen font-grotesk"
          style={{ overflowX: 'clip' }}
        >
          {/* ── Bloco transparente: canvases visíveis por trás ──────────── */}
          <div style={{ position: 'relative' }}>
            <div
              aria-hidden
              style={{
                position:      'absolute',
                inset:         0,
                zIndex:        -1,
                pointerEvents: 'none',
                background:    'linear-gradient(to bottom, transparent 0%, rgba(3,0,10,0.40) 40%, rgba(3,0,10,0.85) 100%)',
              }}
            />
            <HeroSection />
            <MetricsBar />
            <AudienceSection />
            <div ref={animEndRef} />
          </div>

          {/* ── Cortina sólida: cobre canvases a partir do Portfolio ─────── */}
          <div className="relative z-30 bg-[#03000A]">
            <PortfolioSection />
            <CapabilitiesSection />
            <ProcessSection />
            <ManifestoSection />
            <FAQSection />
            <CTASection />
            <ContactSection />
          </div>
        </main>

        <Footer />
      </SiteShell>

      {/*
        WhatsApp Button: FORA do SiteShell para que position:fixed
        seja relativo ao viewport (não ao SiteShell transformado).
        z-50 garante que fica acima do SiteShell (z-10).
      */}
      <WhatsAppButton />
    </MenuProvider>
  );
}
