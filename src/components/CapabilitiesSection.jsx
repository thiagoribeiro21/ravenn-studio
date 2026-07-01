import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ThreeServicesCanvas = lazy(() => import('./ThreeServicesCanvas'));

const WA_LINK =
  'https://wa.me/5521989211887?text=Olá%2C%20gostaria%20de%20agendar%20um%20diagnóstico%20gratuito%20com%20a%20Ravenn%20Studio.';

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
const SERVICES = [
  {
    id:          '01',
    asset:       '/skyscraper_asset.webp',
    category:    'Posicionamento Digital',
    title:       'Sites Institucionais de Alta Autoridade',
    description: 'Presença digital que impõe respeito antes da primeira reunião. Design premium, estrutura técnica de SEO Local e velocidade que colocam sua empresa no topo do Google — exatamente onde decisões de alto valor são tomadas.',
    tags:        ['SEO Local', 'Google Business', 'Core Web Vitals'],
    longDescription:
      'Autoridade não se declara, se constrói em cada detalhe: hierarquia visual, copywriting institucional e uma arquitetura técnica pensada para dominar buscas locais. O resultado é um site que fecha negócio antes mesmo do primeiro contato.',
    deliverables: [
      'SEO técnico com auditoria de palavras-chave de alto valor local',
      'Google Business Profile otimizado para buscas "perto de mim"',
      'PageSpeed 90+ garantido com Core Web Vitals no padrão Google',
      'Schema markup para Rich Results e destaque nos SERPs',
    ],
  },
  {
    id:          '02',
    asset:       '/gravitational_funnel_asset.webp',
    category:    'Alta Conversão',
    title:       'Landing Pages de Alta Conversão',
    description: 'Cada real investido em tráfego pago merece uma página que converte, não que apenas existe. Copywriting orientado a vendas, design exclusivo sem templates e rastreamento pixel-perfeito — entrega em 7 dias úteis.',
    tags:        ['Google Ads', 'CRO', 'Copywriting'],
    longDescription:
      'Cada seção com hierarquia de conversão: headline que prende, prova social que convence e CTA que fecha. Nenhum template, nenhum WordPress — só estrutura pensada para maximizar o retorno da sua campanha.',
    deliverables: [
      'Copywriting AIDA com estrutura de conversão por nicho',
      'Design premium personalizado sem templates ou WordPress',
      'GA4 e UTMs configurados do zero para rastreamento completo',
      'Entrega em 7 dias úteis com 2 rodadas de revisão',
    ],
  },
  {
    id:          '03',
    asset:       '/data_vortex_asset.webp',
    category:    'Experiência Imersiva',
    title:       'Sites Experienciais e Imersivos',
    description: 'Imagine um site que se comporta como um filme: cenas em 3D que reagem ao scroll, transições cinematográficas e uma navegação que parece mágica — como os efeitos visuais deste nosso próprio site. Para marcas de luxo, estúdios de arquitetura e design que não podem se dar ao luxo de parecer comuns.',
    tags:        ['WebGL', 'Three.js', 'Motion Design'],
    longDescription:
      'Aqui, cada rolagem de tela conta uma história. Construímos experiências em WebGL e animações 3D que transformam a navegação em espetáculo — elevando o valor percebido da sua marca a um patamar que nenhum concorrente alcança.',
    deliverables: [
      'Cenas 3D interativas construídas com Three.js e WebGL',
      'Animações cinematográficas sincronizadas ao scroll do usuário',
      'Performance otimizada mesmo com gráficos avançados (60fps)',
      'Direção de arte exclusiva para marcas de altíssimo padrão',
    ],
  },
  {
    id:          '04',
    asset:       '/geometric_plate_asset.webp',
    category:    'Experiência Gastronômica',
    title:       'Cardápios Digitais que Vendem Sozinhos',
    description: 'Chega de PDF ilegível no celular do cliente. Criamos cardápios digitais com fotos que dão água na boca, navegação intuitiva e pedido finalizado direto no WhatsApp — sem fricção entre a fome e a compra.',
    tags:        ['UX Design', 'WhatsApp API', 'Mobile-First'],
    longDescription:
      'Seu cardápio é a primeira impressão do seu restaurante. Substituímos o PDF estático por uma experiência mobile fluida e visualmente irresistível, com pedidos roteados automaticamente para o WhatsApp do seu time — mais pedidos, menos atrito.',
    deliverables: [
      'Design de cardápio interativo com fotografia de alto padrão',
      'UX mobile-first otimizada para pedidos em menos de 3 toques',
      'Roteamento automático de pedidos para o WhatsApp Business',
      'Atualização de itens e preços sem depender de agência',
    ],
  },
  {
    id:          '05',
    asset:       '/data_arrow_asset.webp',
    category:    'Performance Digital',
    title:       'Google Ads de Alta Performance',
    description: 'Colocamos sua empresa na frente do cliente certo, no exato momento em que ele digita a busca e está pronto para comprar. Gestão orientada por dados, otimização semanal e foco obsessivo em custo por aquisição real — não em vaidade de métricas.',
    tags:        ['Google Ads', 'Google Search', 'Analytics'],
    longDescription:
      'Cada centavo orientado por ROAS: segmentação por palavra-chave de alta intenção de compra, teste A/B de anúncios e otimização semanal de lances. Você não paga por cliques, paga por vendas.',
    deliverables: [
      'Campanhas segmentadas por intenção de compra e etapa do funil',
      'Teste A/B de até 6 variações de criativos por mês',
      'Otimização semanal de lances e orçamento orientada por ROAS',
      'Relatório mensal com projeções e insights acionáveis',
    ],
  },
  {
    id:          '06',
    asset:       '/neural_brain_asset.webp',
    category:    'Inteligência Artificial',
    title:       'Agentes de IA e Automação de Atendimento',
    description: 'Enquanto sua equipe dorme, seus concorrentes atendem. Agentes de IA treinados no seu negócio respondem, qualificam e agendam pelo WhatsApp 24 horas por dia — garantindo que nenhuma venda se perca às 3 da manhã.',
    tags:        ['n8n', 'AI Agents', 'WhatsApp API'],
    longDescription:
      'Agentes de IA que atendem 24h, qualificam leads pelos critérios do seu nicho e entregam ao seu time apenas os contatos prontos para fechar. Mais vendas, menos fricção, zero lead perdido por falta de resposta.',
    deliverables: [
      'Agente de IA treinado no seu negócio via WhatsApp Business API',
      'Qualificação automática de leads por critérios do seu nicho',
      'Automações n8n integradas com CRM, agenda e comunicação',
      'Dashboard em tempo real com alertas e métricas de performance',
    ],
  },
];

// ── ServiceModal ──────────────────────────────────────────────────────────────
function ServiceModal({ service, onClose }) {
  useEffect(() => {
    if (service) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [service]);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // Portal pro document.body: o modal fica dentro de <main>, que cria seu
  // próprio stacking context (position:relative + z-index:20). Um z-index
  // alto aqui dentro (z-[9000]) só compete com irmãos DENTRO de <main> — o
  // header (position:sticky, z-index:50) é irmão de <main>, fora desse
  // contexto, então sempre pintava por cima do modal independente do z-index
  // interno. Portal escapa da hierarquia inteira e resolve de vez.
  return createPortal(
    <AnimatePresence>
      {service && (
        /* ── Backdrop ──────────────────────────────────────────────────── */
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
          className="fixed inset-0 z-[9000] flex items-center justify-center p-3 md:p-4"
          style={{
            background:           'rgba(3,0,10,0.85)',
            backdropFilter:       'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* ── Modal box — duas colunas ────────────────────────────── */}
          <motion.div
            key="modal-box"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes — ${service.title.replace(/\n/g, ' ')}`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full overflow-hidden"
            style={{
              maxWidth:     1520,
              maxHeight:    '90vh',
              background:   'rgba(3,0,10,0.97)',
              border:       '1px solid rgba(255,255,255,0.06)',
              borderRadius: 24,
              boxShadow:    '0 0 80px rgba(124,58,237,0.08), 0 32px 64px rgba(0,0,0,0.65)',
              display:      'flex',
              flexDirection:'column',
            }}
          >
            {/* Botão fechar — z-20 para ficar acima do vídeo */}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:rotate-90 transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.50)' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* ── Grid: conteúdo (7) + vídeo (5) ───────────────────────
                Mobile: uma coluna, um scroll só (o grid inteiro rola).
                Desktop (md+): duas colunas lado a lado, cada uma com seu
                próprio scroll interno — comportamento original. */}
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 overflow-y-auto md:overflow-hidden">

              {/* Coluna esquerda — conteúdo + CTA */}
              <div className="md:col-span-7 flex flex-col overflow-visible md:overflow-hidden">

                {/* Marca d'água */}
                <span
                  aria-hidden
                  className="absolute pointer-events-none select-none font-light hidden md:block"
                  style={{
                    fontSize:      'clamp(7rem, 18vw, 12rem)',
                    lineHeight:    1,
                    letterSpacing: '-0.06em',
                    color:         'rgba(255,255,255,0.022)',
                    right:         '42%',
                    top:           '16px',
                    zIndex:        0,
                  }}
                >
                  {service.id}
                </span>

                {/* Área scrollável — no mobile é o grid pai que rola (ver
                    acima), então aqui overflow fica solto pra não competir
                    com aquele scroll (dois overflow:auto aninhados = duas
                    barras de scroll brigando pelo mesmo gesto). */}
                <div
                  data-modal-scroll
                  className="md:overflow-y-auto"
                  style={{
                    flex:      1,
                    overflowX: 'hidden',
                    padding:   'clamp(32px,3vw,44px) clamp(32px,4vw,56px) 0',
                    position:  'relative',
                    zIndex:    1,
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.28, duration: 0.60, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Eyebrow */}
                    <span style={{
                      display:       'block',
                      fontSize:      10,
                      fontWeight:    500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.28em',
                      color:         '#7C3AED',
                      marginBottom:  14,
                    }}>
                      {service.id} — {service.category}
                    </span>

                    {/* Título */}
                    <h3 style={{
                      fontSize:      'clamp(20px, 2.4vw, 34px)',
                      fontWeight:    300,
                      letterSpacing: '-0.03em',
                      lineHeight:    1.08,
                      color:         '#F8F9FA',
                      margin:        '0 0 10px',
                      textWrap:      'balance',
                    }}>
                      {service.title}
                    </h3>

                    {/* Linha violeta */}
                    <div style={{ width: 32, height: 1, background: 'linear-gradient(to right, #7C3AED, transparent)', marginBottom: 14 }} />

                    {/* Descrição */}
                    <p style={{ fontSize: 14, lineHeight: 1.72, color: '#94A3B8', margin: '0 0 20px' }}>
                      {service.longDescription}
                    </p>

                    {/* Label */}
                    <span style={{
                      display:       'block',
                      fontSize:      9,
                      fontWeight:    600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.30em',
                      color:         '#5B6472',
                      marginBottom:  10,
                    }}>
                      Entregáveis incluídos
                    </span>

                    {/* Lista */}
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column' }}>
                      {service.deliverables.map((item, idx) => (
                        <li
                          key={item}
                          style={{
                            display:      'flex',
                            alignItems:   'flex-start',
                            gap:          14,
                            padding:      '9px 0',
                            borderBottom: idx < service.deliverables.length - 1
                              ? '1px solid rgba(255,255,255,0.04)'
                              : 'none',
                            fontSize:   13,
                            lineHeight: 1.60,
                            color:      '#CBD5E1',
                          }}
                        >
                          <span aria-hidden style={{
                            flexShrink:     0,
                            marginTop:      2,
                            width:          18,
                            height:         18,
                            borderRadius:   '50%',
                            border:         '1px solid rgba(124,58,237,0.40)',
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            fontSize:       8,
                            color:          '#7C3AED',
                          }}>
                            ✓
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingBottom: 16 }}>
                      {service.tags.map((tag) => (
                        <span key={tag} style={{
                          display:       'inline-flex',
                          alignItems:    'center',
                          height:        24,
                          padding:       '0 12px',
                          fontSize:      9,
                          fontWeight:    600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.18em',
                          border:        '1px solid rgba(124,58,237,0.25)',
                          borderRadius:  '9999px',
                          color:         '#7C3AED',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Footer CTA */}
                <div style={{
                  padding:    '22px clamp(36px,4vw,64px) clamp(28px,3vw,40px)',
                  flexShrink: 0,
                  borderTop:  '1px solid rgba(124,58,237,0.10)',
                  background: 'rgba(3,0,10,0.50)',
                }}>
                  <a
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center gap-3 w-full transition-all duration-300 hover:shadow-[0_0_40px_-6px_rgba(124,58,237,0.65)]"
                    style={{
                      height:         52,
                      background:     '#7C3AED',
                      color:          '#fff',
                      borderRadius:   8,
                      fontSize:       11,
                      fontWeight:     500,
                      textTransform:  'uppercase',
                      letterSpacing:  '0.16em',
                      textDecoration: 'none',
                    }}
                  >
                    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Agendar Diagnóstico Gratuito
                  </a>
                  <p style={{ marginTop: 9, textAlign: 'center', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.60)' }}>
                    Resposta em até 2 horas · Sem compromisso
                  </p>
                </div>

              </div>{/* /col esquerda */}

              {/* Coluna direita — imagem de referência visual do serviço */}
              <div
                className="md:col-span-5 relative overflow-hidden h-[220px] md:h-auto min-h-[220px] md:min-h-[300px]"
                style={{ background: '#080516' }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={service.asset}
                    src={service.asset}
                    alt={`Referência visual — ${service.title.replace(/\n/g, ' ')}`}
                    initial={{ opacity: 0, scale: 1.12 }}
                    animate={{ opacity: 0.68, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none animate-ravenn-kenburns"
                  />
                </AnimatePresence>

                {/* Glow ambiente pulsante — ecoa a cor do próprio asset */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none animate-ravenn-pulse-glow"
                  style={{
                    background:    'radial-gradient(circle at 50% 45%, rgba(124,58,237,0.45) 0%, transparent 62%)',
                    mixBlendMode:  'screen',
                  }}
                />

                {/* Sfumato — funde a imagem com a coluna de texto */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#03000A] to-transparent z-10" />
                {/* Escurecimento superior e inferior */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#03000A] to-transparent z-10" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#03000A] to-transparent z-10" />

                {/* Rótulo da categoria — canto inferior esquerdo da imagem */}
                <div className="absolute left-6 bottom-6 z-10 flex items-center gap-2">
                  <span aria-hidden style={{ width: 5, height: 5, borderRadius: '50%', background: '#A78BFA', boxShadow: '0 0 8px 1px rgba(167,139,250,0.85)' }} />
                  <span style={{
                    fontSize:      9,
                    fontWeight:    600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.24em',
                    color:         'rgba(248,249,250,0.75)',
                  }}>
                    {service.category}
                  </span>
                </div>
              </div>

            </div>{/* /grid */}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ── Card de serviço ───────────────────────────────────────────────────────────
function ServiceBlock({ service, index, onActive, onOpen }) {
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
        <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#5B6472' }}>
          {service.id}
        </span>
        <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#7C3AED' }}>
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
      <p style={{ fontSize: 15, lineHeight: 1.74, color: '#94A3B8', maxWidth: 380, marginBottom: 24 }}>
        {service.description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {service.tags.map((tag) => (
          <span key={tag} style={{
            display: 'inline-flex', alignItems: 'center',
            height: 28, padding: '0 12px',
            fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em',
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
          style={{ textDecoration: 'none', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.80)' }}
        >
          Solicitar Orçamento
          <span className="transition-transform duration-200 group-hover:translate-x-1" style={{ color: '#A78BFA' }}>
            →
          </span>
        </a>

        {/* Botão 2 — Ação secundária: ghost minimalista → abre modal */}
        <button
          onClick={() => onOpen(service)}
          className="group relative inline-flex items-center gap-2 uppercase tracking-widest text-white/50 hover:text-white transition-colors duration-300"
          style={{ background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', fontSize: 11, letterSpacing: '0.20em' }}
        >
          Explorar Serviço
          <span
            className="inline-block text-violet-500 transition-transform duration-300 group-hover:rotate-90"
            style={{ fontSize: 15, lineHeight: 1 }}
            aria-hidden
          >
            +
          </span>
          {/* Underline que expande */}
          <span
            className="absolute bottom-0 left-0 h-px bg-violet-500/60 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
            style={{ right: '20px' }}
            aria-hidden
          />
        </button>

      </div>
    </motion.article>
  );
}

// ── Seção principal ───────────────────────────────────────────────────────────
export default function CapabilitiesSection() {
  const isDesktop       = useIsDesktop();
  const [activeIdx,     setActiveIdx]     = useState(0);
  const [activeService, setActiveService] = useState(null);
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
    <>
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
          <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#5B6472', display: 'block', marginBottom: 20 }}>
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
                <span style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#5B6472' }}>
                  — {SERVICES[activeIdx]?.category ?? ''} —
                </span>
              </div>
            </div>
          )}

          {/* Cards */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {SERVICES.map((s, i) => (
              <ServiceBlock key={s.id} service={s} index={i} onActive={onActive} onOpen={setActiveService} />
            ))}
          </div>

        </div>
      </section>

      {/* Modal — fora da section para não herdar overflow */}
      <ServiceModal service={activeService} onClose={() => setActiveService(null)} />
    </>
  );
}
