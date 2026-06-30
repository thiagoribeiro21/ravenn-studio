import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WA_LINK =
  'https://wa.me/5521999999999?text=Olá%2C%20gostaria%20de%20agendar%20um%20diagnóstico%20gratuito%20com%20a%20Ravenn%20Studio.';

// ── Dados dos serviços (conteúdo completo do drawer incluso) ──────────────────
const SERVICES = [
  {
    id:       '01',
    category: 'Experience Design',
    title:    'Sites\nExperienciais',
    description:
      'Presença digital institucional que comanda autoridade. Engenheirada para performar, projetada para impressionar e construída para converter audiências exigentes.',
    tags: ['Branding', 'UI/UX', 'WebGL'],
    longDescription:
      'Cada decisão de pixel é estratégica. Construímos ecossistemas digitais que traduzem a sofisticação da sua marca em experiências de usuário memoráveis — do primeiro acesso ao preenchimento do formulário de contato. Velocidade, elegância e conversão coexistem sem concessão.',
    deliverables: [
      'Design System proprietário com componentes reutilizáveis em Figma e código',
      'Otimização Core Web Vitals — PageSpeed Score 90+ garantido em produção',
      'Copywriting de autoridade estruturado em hierarquia de conversão',
      'Responsividade Mobile-First testada em 12+ dispositivos e navegadores',
    ],
  },
  {
    id:       '02',
    category: 'Process Intelligence',
    title:    'Automação\nn8n',
    description:
      'Sistemas de workflow inteligentes que eliminam fricção, comprimem prazos e permitem que sua equipe opere acima de sua capacidade. Sob medida, não off-the-shelf.',
    tags: ['n8n', 'Make', 'API'],
    longDescription:
      'Processos manuais custam mais do que você imagina — tempo, margem e velocidade de resposta. Mapeamos sua operação, identificamos os gargalos e construímos automações que executam 24 horas por dia, sem erro humano, liberando sua equipe para o que realmente importa.',
    deliverables: [
      'Mapeamento e auditoria completa dos fluxos operacionais atuais',
      'Workflows customizados em n8n/Make com integrações a qualquer API',
      'Dashboards em tempo real para monitoramento de KPIs e saúde dos fluxos',
      'Suporte e manutenção prioritária com SLA de 8 horas úteis',
    ],
  },
  {
    id:       '03',
    category: 'Growth Intelligence',
    title:    'IA &\nTráfego',
    description:
      'Integrações de IA tecidas no seu produto e operação, combinadas com programas estratégicos de tráfego para crescimento composto e sustentado.',
    tags: ['AI Agents', 'SEO', 'Paid Media'],
    longDescription:
      'Crescimento não é sorte, é sistema. Combinamos agentes de IA treinados no seu nicho com SEO técnico de alto impacto e gestão de tráfego pago orientada por dados. O resultado: visitantes qualificados chegando, sendo nutridos e convertendo — de forma previsível.',
    deliverables: [
      'Agentes de IA personalizados para atendimento, qualificação e nutrição de leads',
      'Auditoria e implementação de SEO técnico com foco em palavras-chave de conversão',
      'Gestão de campanhas pagas (Google/Meta) com otimização semanal de ROAS',
      'Relatórios mensais de performance com insights acionáveis e roadmap de crescimento',
    ],
  },
];

// ── ServiceDrawer ─────────────────────────────────────────────────────────────
function ServiceDrawer({ service, onClose }) {
  // Trava o scroll do body enquanto o drawer está aberto
  useEffect(() => {
    if (service) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [service]);

  // Fecha com ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {service && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────────────── */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
            aria-hidden
            style={{
              position:             'fixed',
              inset:                0,
              zIndex:               50,
              background:           'rgba(0,0,0,0.52)',
              backdropFilter:       'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          {/* ── Drawer ───────────────────────────────────────────────────── */}
          <motion.aside
            key="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes — ${service.title.replace('\n', ' ')}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position:      'fixed',
              top:           0,
              right:         0,
              height:        '100%',
              width:         '100%',
              maxWidth:      480,
              zIndex:        60,
              background:    '#03000A',
              borderLeft:    '1px solid rgba(255,255,255,0.06)',
              display:       'flex',
              flexDirection: 'column',
              overflowY:     'auto',
            }}
          >

            {/* Header */}
            <div
              style={{
                padding:       '28px 32px 24px',
                borderBottom:  '1px solid rgba(255,255,255,0.05)',
                display:       'flex',
                alignItems:    'flex-start',
                justifyContent:'space-between',
                gap:           16,
                flexShrink:    0,
              }}
            >
              <div>
                <span
                  style={{
                    display:       'block',
                    fontSize:      10,
                    fontWeight:    500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.24em',
                    color:         '#7C3AED',
                    marginBottom:  12,
                  }}
                >
                  {service.id} — {service.category}
                </span>
                <h3
                  style={{
                    fontSize:      'clamp(22px, 3vw, 32px)',
                    fontWeight:    300,
                    letterSpacing: '-0.025em',
                    lineHeight:    1.08,
                    color:         '#F8F9FA',
                    margin:        0,
                    whiteSpace:    'pre-line',
                  }}
                >
                  {service.title}
                </h3>
              </div>

              {/* Botão fechar */}
              <button
                onClick={onClose}
                aria-label="Fechar painel"
                style={{
                  flexShrink:   0,
                  marginTop:    2,
                  width:        36,
                  height:       36,
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent:'center',
                  background:   'rgba(255,255,255,0.04)',
                  border:       '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 4,
                  color:        'rgba(255,255,255,0.50)',
                  cursor:       'pointer',
                  transition:   'background 200ms ease, color 200ms ease',
                  lineHeight:   1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.12)';
                  e.currentTarget.style.color      = '#A78BFA';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color      = 'rgba(255,255,255,0.50)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Corpo */}
            <div style={{ flex: 1, padding: '32px 32px 0', overflowY: 'auto' }}>

              {/* Descrição longa */}
              <p
                style={{
                  fontSize:     15,
                  lineHeight:   1.78,
                  color:        '#94A3B8',
                  margin:       '0 0 40px',
                }}
              >
                {service.longDescription}
              </p>

              {/* Label entregáveis */}
              <span
                style={{
                  display:       'block',
                  fontSize:      10,
                  fontWeight:    500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  color:         '#5B6472',
                  marginBottom:  20,
                }}
              >
                Entregáveis
              </span>

              {/* Lista */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {service.deliverables.map((item) => (
                  <li
                    key={item}
                    style={{
                      display:    'flex',
                      alignItems: 'flex-start',
                      gap:        12,
                      fontSize:   14,
                      lineHeight: 1.65,
                      color:      '#CBD5E1',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{ color: '#7C3AED', flexShrink: 0, marginTop: 2, fontSize: 12 }}
                    >
                      ▸
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32, paddingBottom: 32 }}>
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display:       'inline-flex',
                      alignItems:    'center',
                      height:        26,
                      padding:       '0 12px',
                      fontSize:      10,
                      fontWeight:    500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      border:        '1px solid rgba(124,58,237,0.30)',
                      borderRadius:  4,
                      color:         '#7C3AED',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer CTA — fixo na base */}
            <div
              style={{
                padding:    '24px 32px 36px',
                flexShrink: 0,
                borderTop:  '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            12,
                  height:         56,
                  background:     '#7C3AED',
                  color:          '#fff',
                  borderRadius:   4,
                  fontSize:       12,
                  fontWeight:     500,
                  textTransform:  'uppercase',
                  letterSpacing:  '0.14em',
                  textDecoration: 'none',
                  transition:     'background 260ms ease, box-shadow 260ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#8B5CF6';
                  e.currentTarget.style.boxShadow  = '0 0 36px -4px rgba(124,58,237,0.65)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#7C3AED';
                  e.currentTarget.style.boxShadow  = 'none';
                }}
              >
                <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Agendar Diagnóstico Gratuito
              </a>

              <p
                style={{
                  marginTop:     12,
                  textAlign:     'center',
                  fontSize:      10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color:         '#3B3F4A',
                }}
              >
                Resposta em até 2 horas · Sem compromisso
              </p>
            </div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── ServiceBlock ──────────────────────────────────────────────────────────────
function ServiceBlock({ service, onOpen }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
      viewport={{ once: true, margin: '-12%' }}
      className="flex flex-col justify-center min-h-screen py-20"
      style={{
        paddingLeft:  'clamp(24px, 5vw, 72px)',
        paddingRight: 'clamp(24px, 4vw, 48px)',
        borderTop:    '1px solid #1E1B4B',
      }}
    >
      {/* Index + category */}
      <div className="flex items-center gap-4 mb-5">
        <motion.span
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
          style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#5B6472' }}
        >
          {service.id}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          viewport={{ once: true }}
          style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#7C3AED' }}
        >
          — {service.category}
        </motion.span>
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize:      'clamp(38px, 4.5vw, 66px)',
          fontWeight:    300,
          lineHeight:    1.04,
          letterSpacing: '-0.03em',
          color:         '#F8F9FA',
          whiteSpace:    'pre-line',
          marginBottom:  24,
        }}
      >
        {service.title}
      </h2>

      {/* Description */}
      <p style={{ fontSize: 15, lineHeight: 1.7, color: '#94A3B8', maxWidth: 380, marginBottom: 28 }}>
        {service.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-10">
        {service.tags.map((tag) => (
          <span
            key={tag}
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              height:        28,
              padding:       '0 12px',
              fontSize:      10,
              fontWeight:    500,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              border:        '1px solid #1E1B4B',
              borderRadius:  4,
              color:         '#5B6472',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* CTA → abre o drawer */}
      <button
        onClick={() => onOpen(service)}
        style={{
          display:    'inline-flex',
          alignItems: 'center',
          gap:        10,
          background: 'none',
          border:     'none',
          padding:    0,
          cursor:     'pointer',
          width:      'fit-content',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.querySelector('.svc-lbl').style.color      = '#A78BFA';
          e.currentTarget.querySelector('.svc-icon').style.transform  = 'translateX(3px)';
          e.currentTarget.querySelector('.svc-icon').style.color      = '#A78BFA';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.querySelector('.svc-lbl').style.color      = '#5B6472';
          e.currentTarget.querySelector('.svc-icon').style.transform  = 'translateX(0)';
          e.currentTarget.querySelector('.svc-icon').style.color      = '#7C3AED';
        }}
      >
        <span
          className="svc-lbl"
          style={{
            fontSize:      11,
            fontWeight:    500,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color:         '#5B6472',
            transition:    'color 200ms ease',
          }}
        >
          Explorar Arquitetura
        </span>
        <span
          className="svc-icon"
          style={{
            color:      '#7C3AED',
            fontSize:   16,
            display:    'inline-block',
            transition: 'transform 200ms ease, color 200ms ease',
            lineHeight: 1,
          }}
        >
          +
        </span>
      </button>
    </motion.article>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function ServicesSection() {
  const [activeService, setActiveService] = useState(null);

  return (
    <>
      <section id="services">

        {/* Full-width section header */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          style={{
            padding:   'clamp(80px,10vw,140px) clamp(32px,5vw,96px) clamp(56px,6vw,96px)',
            borderTop: '1px solid #1E1B4B',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#5B6472', display: 'block', marginBottom: 20 }}>
            — Capabilities
          </span>
          <h2
            style={{
              fontSize:      'clamp(36px, 5vw, 72px)',
              fontWeight:    300,
              letterSpacing: '-0.025em',
              lineHeight:    1.04,
              color:         '#F8F9FA',
              maxWidth:      720,
            }}
          >
            Três disciplinas,<br />um único padrão.
          </h2>
        </motion.div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left ghost — canvas ocupa este espaço via fixed */}
          <div className="hidden lg:block" aria-hidden="true" />

          {/* Right column — service blocks */}
          <div>
            {SERVICES.map((s) => (
              <ServiceBlock key={s.id} service={s} onOpen={setActiveService} />
            ))}
          </div>
        </div>

      </section>

      {/* Drawer renderizado fora da seção para não herdar overflow:hidden */}
      <ServiceDrawer service={activeService} onClose={() => setActiveService(null)} />
    </>
  );
}
