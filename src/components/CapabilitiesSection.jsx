import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

const ThreeServicesCanvas = lazy(() => import('./ThreeServicesCanvas'));

function useIsDesktop() {
  const [ok, setOk] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024,
  );
  useEffect(() => {
    const fn = () => setOk(window.innerWidth >= 1024);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return ok;
}

// ── Dados ─────────────────────────────────────────────────────────────────────
/* `lp` — slug da subpágina de serviço (`SolutionPageShell.jsx`, mesmo
   conteúdo das LPs de Ads, header/footer da home). Usado pelo botão
   "Explorar Serviço" em `ServiceBlock` — era um `onClick` que abria um
   modal local (`ServiceModal`, removido; ver histórico do arquivo), agora
   é link de verdade pra subpágina completa. */
const SERVICES = [
  {
    id:          '01',
    asset:       '/skyscraper_asset.webp',
    category:    'Posicionamento Digital',
    title:       'Sites Institucionais de Alta Autoridade',
    description: 'Presença digital que impõe respeito antes da primeira reunião. Design premium, estrutura técnica de SEO Local e velocidade que colocam sua empresa no topo do Google — exatamente onde decisões de alto valor são tomadas.',
    tags:        ['SEO Local', 'Google Business', 'Core Web Vitals'],
    lp:          'sites-institucionais',
  },
  {
    id:          '02',
    asset:       '/gravitational_funnel_asset.webp',
    category:    'Alta Conversão',
    title:       'Landing Pages de Alta Conversão',
    description: 'Cada real investido em tráfego pago merece uma página que converte, não que apenas existe. Copywriting orientado a vendas, design exclusivo sem templates e rastreamento pixel-perfeito — entrega em 7 dias úteis.',
    tags:        ['Google Ads', 'CRO', 'Copywriting'],
    lp:          'landing-pages',
  },
  {
    id:          '03',
    asset:       '/data_vortex_asset.webp',
    category:    'Experiência Imersiva',
    title:       'Sites Experienciais e Imersivos',
    description: 'Imagine um site que se comporta como um filme: cenas em 3D que reagem ao scroll, transições cinematográficas e uma navegação que parece mágica — como os efeitos visuais deste nosso próprio site. Para marcas de luxo, estúdios de arquitetura e design que não podem se dar ao luxo de parecer comuns.',
    tags:        ['WebGL', 'Three.js', 'Motion Design'],
    lp:          'sites-imersivos',
  },
  {
    id:          '04',
    asset:       '/geometric_plate_asset.webp',
    category:    'E-commerce de Alta Performance',
    title:       'Lojas Virtuais que Vendem 24 Horas por Dia',
    description: 'Chega de depender só do balcão. Criamos lojas virtuais de alta conversão com checkout ultrarrápido, vitrine que faz o produto vender sozinho e integração direta com os principais meios de pagamento — para faturar em vendas online enquanto você dorme.',
    tags:        ['E-commerce', 'Checkout Otimizado', 'Mobile-First'],
    lp:          'lojas-virtuais',
  },
  {
    id:          '05',
    asset:       '/data_arrow_asset.webp',
    category:    'Performance Digital',
    title:       'Google Ads de Alta Performance',
    description: 'Colocamos sua empresa na frente do cliente certo, no exato momento em que ele digita a busca e está pronto para comprar. Gestão orientada por dados, otimização semanal e foco obsessivo em custo por aquisição real — não em vaidade de métricas.',
    tags:        ['Google Ads', 'Google Search', 'Analytics'],
    lp:          'gestao-google-ads',
  },
  {
    id:          '06',
    asset:       '/neural_brain_asset.webp',
    category:    'Inteligência Artificial',
    title:       'Agentes de IA e Automação de Atendimento',
    description: 'Enquanto sua equipe dorme, seus concorrentes atendem. Agentes de IA treinados no seu negócio respondem, qualificam e agendam pelo WhatsApp 24 horas por dia — garantindo que nenhuma venda se perca às 3 da manhã.',
    tags:        ['n8n', 'AI Agents', 'WhatsApp API'],
    lp:          'agentes-ia',
  },
];

// ── Card de serviço ───────────────────────────────────────────────────────────
function ServiceBlock({ service, index, onActive }) {
  const blockRef = useRef(null);

  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onActive(index); },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [index, onActive]);

  return (
    <motion.article
      ref={blockRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: false, amount: 0.15 }}
      style={{
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        minHeight:      '100vh',
        padding:        'clamp(44px, 6vh, 88px) clamp(28px, 5vw, 80px)',
        borderTop:      '1px solid #1E1B4B',
      }}
    >
      {/* Index + category */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#5B6472' }}>
          {service.id}
        </span>
        <span style={{ fontSize: 15, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#7C3AED' }}>
          — {service.category}
        </span>
      </div>

      {/* Título */}
      <h2 style={{
        fontSize:      'clamp(40px, 4.8vw, 68px)',
        fontWeight:    300,
        lineHeight:    1.04,
        letterSpacing: '-0.03em',
        color:         '#F8F9FA',
        textWrap:      'balance',
        marginBottom:  16,
      }}>
        {service.title}
      </h2>

      {/* Descrição */}
      <p style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.74, color: '#94A3B8', maxWidth: 380, marginBottom: 24 }}>
        {service.description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {service.tags.map((tag) => (
          <span key={tag} style={{
            display: 'inline-flex', alignItems: 'center',
            height: 28, padding: '0 12px',
            fontSize: 15, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em',
            border: '1px solid #1E1B4B', borderRadius: 4, color: '#5B6472',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* ── CTAs — side by side ──────────────────────────────────────── */}
      <div className="flex flex-row flex-wrap items-center gap-6">

        {/* Botão 1 — Ação principal: pílula preenchida */}
        <a
          href="#contact"
          className="group relative px-6 py-3 bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-full overflow-hidden flex items-center gap-2 transition-all duration-300 hover:bg-[#7C3AED]/20 hover:border-[#7C3AED]/60 hover:shadow-[0_0_20px_rgba(124,58,237,0.20)]"
          style={{ textDecoration: 'none', fontSize: 15, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.80)' }}
        >
          Solicitar Orçamento
          <span className="transition-transform duration-200 group-hover:translate-x-1" style={{ color: '#A78BFA' }}>
            →
          </span>
        </a>

        {/* Botão 2 — agora a ação MAIS chamativa do par, não a secundária
            discreta que era: antes um link-fantasma quase invisível (fazia
            sentido quando só abria um resumo em modal); agora leva pra
            subpágina inteira do serviço (mesmas seções da LP de Ads,
            header/footer da home — ver SolutionPageShell.jsx), um destino
            bem mais rico que merece puxar o olho tanto quanto — ou mais que
            — "Solicitar Orçamento". Pílula sólida + glow + faixa de brilho
            no hover é o MESMO vocabulário que os CTAs primários já usam em
            outras seções do site (`MagneticCta`, `FinaleCta`) — reaproveita
            a linguagem em vez de inventar uma nova. */}
        <a
          href={`/solucoes/${service.lp}.html`}
          className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#7C3AED] px-6 py-3 text-white shadow-[0_0_24px_-6px_rgba(124,58,237,0.65)] transition-shadow duration-400 hover:shadow-[0_0_44px_-4px_rgba(124,58,237,0.90)]"
          style={{ textDecoration: 'none', fontSize: 15, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em' }}
        >
          {/* faixa de brilho varrendo o botão no hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />
          <span className="relative z-10">Explorar Serviço</span>
          <span className="relative z-10 transition-transform duration-200 group-hover:translate-x-1" aria-hidden>
            →
          </span>
        </a>

      </div>
    </motion.article>
  );
}

// ── Seção principal ───────────────────────────────────────────────────────────
export default function CapabilitiesSection() {
  const isDesktop       = useIsDesktop();
  const [activeIdx,     setActiveIdx]     = useState(0);
  const [canvas3D,      setCanvas3D]      = useState(false);
  const sectionRef = useRef(null);
  const onActive = useCallback((i) => setActiveIdx(i), []);

  // Só monta o ThreeServicesCanvas (e dispara o download do Three.js) quando a
  // seção está a 400 px do viewport — o bundle R3F não compete com o load inicial.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setCanvas3D(true); io.disconnect(); } },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
      <section ref={sectionRef} id="services" style={{ borderTop: '1px solid #1E1B4B' }}>

        {/* Header full-width */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.15 }}
          style={{
            padding:      'clamp(72px, 9vw, 128px) clamp(32px, 5vw, 96px) clamp(48px, 6vw, 80px)',
            borderBottom: '1px solid #1E1B4B',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#5B6472', display: 'block', marginBottom: 20 }}>
            — Serviços
          </span>
          <h2 style={{
            fontSize:      'clamp(36px, 5vw, 72px)',
            fontWeight:    300,
            letterSpacing: '-0.025em',
            lineHeight:    1.04,
            color:         '#F8F9FA',
            maxWidth:      920,
            textWrap:      'balance',
          }}>
            Da captação à automação.<br />
            <span style={{ color: '#A78BFA' }}>Zero dependência de sorte.</span>
          </h2>
        </motion.div>

        {/* Mobile: canvas sticky — compacto, centralizado */}
        {!isDesktop && (
          <div style={{
            position:       'sticky', top: 80, zIndex: 5,  /* top=80 respeita navbar height */
            background:     'rgba(3,0,10,0.92)',
            backdropFilter: 'blur(8px)',
            borderBottom:   '1px solid #1E1B4B',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '8px 0 6px',
            gap:            0,
          }}>
            <div className="w-28 h-28 md:w-36 md:h-36 relative">
              <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,29,149,0.28) 0%, transparent 70%)', pointerEvents: 'none' }} />
              {canvas3D && (
                <Suspense fallback={<div className="w-full h-full rounded-full" style={{ background: '#03000A' }} />}>
                  <ThreeServicesCanvas activeIndex={activeIdx} />
                </Suspense>
              )}
            </div>
          </div>
        )}

        {/* Layout */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>

          {/* Esquerda sticky — canvas 3D (desktop) */}
          {isDesktop && (
            <div style={{
              width: '50%', position: 'sticky', top: 0,
              height: '100vh', flexShrink: 0,
              borderRight: '1px solid #1E1B4B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'visible',
            }}>
              <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(76,29,149,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ width: 'min(88%, 620px)', aspectRatio: '1 / 1', position: 'relative', zIndex: 1 }}>
                {canvas3D && (
                  <Suspense fallback={<div className="w-full h-full" style={{ background: '#03000A' }} />}>
                    <ThreeServicesCanvas activeIndex={activeIdx} />
                  </Suspense>
                )}
              </div>
              <div aria-hidden style={{ position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 15, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#5B6472' }}>
                  — {SERVICES[activeIdx]?.category ?? ''} —
                </span>
              </div>
            </div>
          )}

          {/* Cards */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {SERVICES.map((s, i) => (
              <ServiceBlock key={s.id} service={s} index={i} onActive={onActive} />
            ))}
          </div>

        </div>
      </section>
  );
}
