// AudienceSection — "Para quem é"
//
// Layout: full-width "Selected Work" table — sem grid 50/50.
// O corvo (ScrollSequenceCanvas sticky no heroManifestoRef) aparece como
// background atrás desta seção via camada de composição — não empurra o layout.
// Container: max-w-7xl mx-auto px-6, sem alturas estáticas.

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ITEMS = [
  {
    num:         '01',
    title:       'Empresas invisíveis nas buscas da sua cidade',
    tag:         'CAPTAÇÃO LOCAL',
    description: 'Criação de sites de alta conversão e gestão de tráfego para negócios locais que precisam ser a primeira opção quando o cliente pesquisa no Google. Desenvolvimento de sites em Niterói integrado a Google Ads para atrair compradores qualificados todos os dias.',
  },
  {
    num:         '02',
    title:       'Negócios premium com presença digital amadora',
    tag:         'POSICIONAMENTO DE AUTORIDADE',
    description: 'Quando o site parece panfleto digital morto, o preço cobrado perde credibilidade antes da reunião começar. Construímos a presença digital que justifica cada centavo da sua proposta e fecha contratos de alto valor com autoridade visual.',
  },
  {
    num:         '03',
    title:       'Empresários que perdem vendas fora do horário',
    tag:         'AUTOMAÇÃO INTELIGENTE',
    description: 'Agentes de IA para WhatsApp que atendem, qualificam e agendam reuniões de forma autônoma. Automação de atendimento para clínicas e serviços que elimina o gargalo operacional e garante resposta imediata de madrugada ou final de semana.',
  },
];

// ── Linha da tabela ─────────────────────────────────────────────────────────
function ServiceRow({ item, index }) {
  return (
    <motion.div
      className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/10 group cursor-pointer"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Número */}
      <span
        className="text-[10px] font-mono tracking-[0.20em] text-white/20 group-hover:text-violet-400 transition-colors duration-300 shrink-0 md:w-10 mb-1.5 md:mb-0"
        aria-hidden
      >
        {item.num}
      </span>

      {/* Título */}
      <div className="md:w-1/3 text-2xl md:text-3xl font-light tracking-tight leading-tight text-gray-300 group-hover:text-white transition-colors duration-300 mb-2 md:mb-0">
        {item.title}
      </div>

      {/* Descrição */}
      <div className="md:w-1/3 text-sm leading-relaxed text-gray-500 group-hover:text-gray-300 transition-colors duration-300 mb-3 md:mb-0 md:px-8">
        {item.description}
      </div>

      {/* Tag */}
      <div className="md:w-1/3 flex md:justify-end">
        <span className="px-4 py-1.5 rounded-full text-xs md:text-sm font-mono tracking-widest text-white/90 bg-white/10 border border-white/20 uppercase">
          {item.tag}
        </span>
      </div>
    </motion.div>
  );
}

// ── Seção principal ──────────────────────────────────────────────────────────
export default function AudienceSection() {
  const sectionRef = useRef(null);

  // scrollYProgress do traversal completo desta seção pela viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Parallax sutil: heading sobe levemente conforme a seção sai da viewport
  const headingY = useTransform(scrollYProgress, [0, 1], [40, -20]);
  const eyebrowY = useTransform(scrollYProgress, [0, 1], [24, -14]);

  return (
    <section
      ref={sectionRef}
      id="audience"
      style={{
        position:      'relative',
        borderTop:     '1px solid rgba(255,255,255,0.05)',
        paddingTop:    'clamp(72px, 9vh, 112px)',
        paddingBottom: 'clamp(80px, 10vh, 128px)',
      }}
    >
      {/* Aura decorativa — fundo direito, não interfere no layout */}
      <div
        aria-hidden
        style={{
          position:      'absolute',
          inset:         0,
          pointerEvents: 'none',
          background:    'radial-gradient(ellipse 55% 70% at 92% 45%, rgba(76,29,149,0.10) 0%, transparent 65%)',
          zIndex:        0,
        }}
      />

      {/* ── Container de conteúdo: alinhado com o padding padrão do site ── */}
      <div
        className="relative z-10"
        style={{ paddingLeft: 'clamp(32px, 5vw, 96px)', paddingRight: 'clamp(32px, 5vw, 96px)' }}
      >

        {/* Eyebrow com parallax */}
        <motion.span
          style={{
            y:             eyebrowY,
            display:       'block',
            fontSize:      11,
            fontWeight:    500,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color:         '#5B6472',
            marginBottom:  20,
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          — Para quem é
        </motion.span>

        {/* Heading com parallax */}
        <motion.h2
          style={{
            y:             headingY,
            fontSize:      'clamp(28px, 3.8vw, 56px)',
            fontWeight:    300,
            letterSpacing: '-0.025em',
            lineHeight:    1.05,
            color:         '#F8F9FA',
            marginBottom:  'clamp(48px, 7vh, 80px)',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          Sua empresa se encaixa aqui.<br />
          <span style={{ color: '#A78BFA' }}>Vamos resolver.</span>
        </motion.h2>

        {/* ── Lista estilo "Selected Work" ──────────────────────────────────
             border-top na lista — border-bottom em cada item via className. */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          {ITEMS.map((item, i) => (
            <ServiceRow key={item.num} item={item} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          style={{ marginTop: 'clamp(40px, 6vh, 60px)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.7 }}
        >
          <a
            href="#contact"
            onMouseEnter={(e) => {
              e.currentTarget.querySelector('.cta-lbl').style.color     = '#A78BFA';
              e.currentTarget.querySelector('.cta-arr').style.transform = 'translateX(5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.querySelector('.cta-lbl').style.color     = 'rgba(255,255,255,0.40)';
              e.currentTarget.querySelector('.cta-arr').style.transform = 'translateX(0)';
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
          >
            <span
              className="cta-lbl"
              style={{
                fontSize:      11,
                fontWeight:    500,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color:         'rgba(255,255,255,0.40)',
                transition:    'color 200ms ease',
              }}
            >
              Solicitar Diagnóstico Gratuito
            </span>
            <span
              className="cta-arr"
              style={{
                color:      '#7C3AED',
                fontSize:   14,
                display:    'inline-block',
                transition: 'transform 200ms ease',
              }}
            >
              →
            </span>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
