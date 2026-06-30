import { motion } from 'framer-motion';
import TextReveal from './TextReveal';
import { useMenu } from '../context/MenuContext';

const PRINCIPLES = [
  {
    num:   '001',
    label: 'Ser encontrado primeiro é vender mais',
    body:  'Soluções de inteligência artificial para empresas e criação de sites de alta conversão começam pelo mesmo ponto: visibilidade. Otimizamos cada detalhe técnico para sua empresa aparecer nas buscas que o seu cliente usa antes de ligar para o concorrente.',
  },
  {
    num:   '002',
    label: 'Design que fecha negócios antes da proposta',
    body:  'A presença digital da sua marca faz uma promessa silenciosa antes de você abrir a boca. Construímos sites premium que transmitem autoridade visual imediata e transformam o primeiro clique em confiança. Cada elemento visual serve para converter.',
  },
  {
    num:   '003',
    label: 'Automação que substitui o esforço repetitivo',
    body:  'Agentes de IA para WhatsApp e automação de atendimento para clínicas e serviços que trabalham enquanto você dorme. Seu negócio responde, qualifica e agenda sem depender de horário comercial ou de um funcionário disponível no momento certo.',
  },
];

export default function ManifestoSection() {
  const { scrollContainerRef } = useMenu();
  return (
    <section
      id="manifesto"
      style={{ borderTop: '1px solid #1E1B4B', position: 'relative', overflow: 'hidden' }}
    >
      {/* Aura violeta lateral */}
      <div aria-hidden style={{
        position:      'absolute',
        top:           '20%',
        left:          '-15%',
        width:         600,
        height:        600,
        borderRadius:  '50%',
        background:    'radial-gradient(circle, rgba(76,29,149,0.22) 0%, transparent 65%)',
        filter:        'blur(90px)',
        pointerEvents: 'none',
      }} />

      {/* ── Citação principal — centrada, imersiva ──────────────────────────── */}
      <div
        style={{
          padding:  'clamp(80px, 12vw, 160px) clamp(32px, 8vw, 180px)',
          textAlign: 'center',
          position:  'relative',
          zIndex:    1,
        }}
      >
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, amount: 0.05, root: scrollContainerRef }}
          style={{ display: 'block', marginBottom: 36 }}
        >
        <span style={{
          fontSize:      10,
          fontWeight:    500,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color:         '#5B6472',
          display:       'inline',
        }}>
          — Nossa Visão
        </span>
        </motion.span>

        <blockquote style={{ margin: 0, padding: 0 }}>
          <TextReveal
            text='"Não entregamos apenas sites. Construímos a infraestrutura digital necessária para sua marca dominar o mercado local."'
            style={{
              fontSize:      'clamp(28px, 4.2vw, 58px)',
              fontWeight:    300,
              lineHeight:    1.3,
              letterSpacing: '-0.03em',
              color:         '#F8F9FA',
            }}
          />
        </blockquote>
      </div>

      {/* ── Pilares — lista horizontal brutalista ───────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid #1E1B4B',
          position:  'relative',
          zIndex:    1,
        }}
      >
        {PRINCIPLES.map((p, i) => (
          <motion.div
            key={p.num}
            initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.05, root: scrollContainerRef }}
            className="flex flex-col items-start gap-3 px-6 py-7 md:grid md:items-center md:px-[clamp(32px,5vw,96px)] md:py-[clamp(28px,3.5vw,44px)] md:gap-[clamp(20px,3vw,48px)]"
            style={{
              gridTemplateColumns: 'clamp(52px, 8vw, 100px) 1fr 1fr',
              borderBottom:        '1px solid rgba(30,27,75,0.6)',
              cursor:              'default',
            }}
            whileHover={{ backgroundColor: 'rgba(124,58,237,0.04)' }}
          >
            {/* Número */}
            <span style={{
              fontSize:      'clamp(11px, 1vw, 13px)',
              fontWeight:    500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color:         '#7C3AED',
              lineHeight:    1,
              flexShrink:    0,
            }}>
              {p.num}
            </span>

            {/* Título do pilar */}
            <h3 style={{
              fontSize:      'clamp(20px, 2.4vw, 32px)',
              fontWeight:    300,
              letterSpacing: '-0.025em',
              lineHeight:    1.15,
              color:         '#F8F9FA',
              margin:        0,
            }}>
              {p.label}
            </h3>

            {/* Descrição */}
            <p style={{
              fontSize:   'clamp(13px, 1.1vw, 15px)',
              lineHeight: 1.72,
              color:      '#5B6472',
              margin:     0,
              width:      '100%',
            }}>
              {p.body}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── CTA pós-manifesto ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, amount: 0.05, root: scrollContainerRef }}
        style={{
          padding:        'clamp(40px, 5vh, 64px) clamp(32px, 5vw, 96px)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexWrap:       'wrap',
          gap:            24,
          position:       'relative',
          zIndex:         1,
          borderTop:      '1px solid #1E1B4B',
        }}
      >
        <p style={{
          fontSize:      13,
          fontWeight:    400,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color:         '#5B6472',
          margin:        0,
        }}>
          Sua empresa merece uma presença que compete. Vamos começar.
        </p>

        <a
          href="#contact"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            10,
            height:         48,
            padding:        '0 28px',
            fontSize:       11,
            fontWeight:     500,
            textTransform:  'uppercase',
            letterSpacing:  '0.14em',
            background:     'transparent',
            color:          '#F8F9FA',
            borderRadius:   4,
            border:         '1px solid #2A2560',
            textDecoration: 'none',
            transition:     'border-color 250ms ease, box-shadow 250ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#7C3AED';
            e.currentTarget.style.boxShadow   = '0 0 24px -4px rgba(124,58,237,0.40)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#2A2560';
            e.currentTarget.style.boxShadow   = 'none';
          }}
        >
          Falar com Especialista →
        </a>
      </motion.div>
    </section>
  );
}
