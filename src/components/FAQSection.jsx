import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    q: 'Qual é o prazo de entrega de um site?',
    a: 'Landing pages e sites institucionais são entregues em 7 a 21 dias úteis, dependendo da complexidade. Projetos experienciais e e-commerces seguem um cronograma personalizado definido na fase de imersão. Trabalhamos com prazos reais — sem promessas irreais.',
  },
  {
    q: 'Quem gerencia os anúncios do Google Ads?',
    a: 'Nossa equipe assume a gestão completa das campanhas: criação, segmentação por palavra-chave, otimização contínua e relatórios semanais. Você acompanha os resultados em tempo real e tem acesso total à conta de anúncios.',
  },
  {
    q: 'O serviço inclui manutenção após a entrega?',
    a: 'Sim. Todos os projetos incluem 30 dias de suporte pós-lançamento. Planos de manutenção mensal (atualizações, backups, monitoramento de performance) estão disponíveis e são apresentados ao final do projeto.',
  },
  {
    q: 'A Ravenn Studio atende fora da Região Oceânica?',
    a: 'Atendemos clientes em todo o Brasil de forma remota. Nossa especialidade e foco de SEO local está na Região Oceânica, mas o nosso design e desenvolvimento atendem qualquer mercado ou nicho.',
  },
  {
    q: 'É possível integrar automações de WhatsApp ao site?',
    a: 'Sim. Desenvolvemos fluxos de automação via WhatsApp Business API integrados ao seu site — qualificação de leads, agendamentos automáticos e atendimento com IA. É um dos nossos serviços de maior retorno.',
  },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div style={{ borderBottom: '1px solid #1E1B4B' }}>
      <button
        onClick={onToggle}
        style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          width:           '100%',
          textAlign:       'left',
          padding:         'clamp(20px, 3vh, 28px) 0',
          background:      'none',
          border:          'none',
          cursor:          'pointer',
          gap:             24,
        }}
        aria-expanded={isOpen}
      >
        <span
          style={{
            fontSize:      'clamp(15px, 1.4vw, 19px)',
            fontWeight:    400,
            letterSpacing: '-0.01em',
            lineHeight:    1.3,
            color:         isOpen ? '#F8F9FA' : '#94A3B8',
            transition:    'color 200ms ease',
            fontFamily:    'inherit',
          }}
        >
          {item.q}
        </span>

        {/* Ícone +/- */}
        <span
          aria-hidden
          style={{
            flexShrink:  0,
            width:       28,
            height:      28,
            borderRadius: '50%',
            border:      `1px solid ${isOpen ? '#7C3AED' : '#1E1B4B'}`,
            display:     'flex',
            alignItems:  'center',
            justifyContent: 'center',
            color:       isOpen ? '#A78BFA' : '#5B6472',
            fontSize:    18,
            lineHeight:  1,
            transition:  'border-color 200ms ease, color 200ms ease',
          }}
        >
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p
              style={{
                fontSize:   15,
                lineHeight: 1.78,
                color:      '#94A3B8',
                margin:     '0 0 clamp(20px, 3vh, 28px)',
                maxWidth:   720,
              }}
            >
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i));

  return (
    <section
      id="faq"
      style={{ borderTop: '1px solid #1E1B4B', position: 'relative', overflow: 'hidden' }}
    >
      {/* Imagem de fundo — desktop */}
      <div
        aria-hidden
        className="hidden lg:block"
        style={{
          position:           'absolute',
          inset:              0,
          backgroundImage:    'url(/bg-faq-ravenn/431a9833-34aa-4eef-8da8-3f31568d5eae.webp)',
          backgroundSize:     'cover',
          backgroundPosition: 'center right',
          backgroundRepeat:   'no-repeat',
          pointerEvents:      'none',
        }}
      />

      {/* Imagem de fundo — mobile */}
      <div
        aria-hidden
        className="lg:hidden"
        style={{
          position:           'absolute',
          inset:              0,
          backgroundImage:    'url(/bg-faq-ravenn/259f0eba-dac6-4e8f-aee5-374b66a4aadb.webp)',
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          backgroundRepeat:   'no-repeat',
          pointerEvents:      'none',
        }}
      />

      {/* Overlay: escurece a foto mantendo apenas um toque de profundidade — desktop */}
      <div
        aria-hidden
        className="hidden lg:block"
        style={{
          position:   'absolute',
          inset:      0,
          background: 'linear-gradient(to bottom, rgba(3,0,10,0.80) 0%, rgba(3,0,10,0.66) 50%, rgba(3,0,10,0.86) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Overlay: escurece a foto mantendo apenas um toque de profundidade — mobile */}
      <div
        aria-hidden
        className="lg:hidden"
        style={{
          position:   'absolute',
          inset:      0,
          background: 'linear-gradient(to bottom, rgba(3,0,10,0.88) 0%, rgba(3,0,10,0.78) 50%, rgba(3,0,10,0.92) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          padding:  'clamp(72px, 9vw, 120px) clamp(32px, 5vw, 96px)',
          position: 'relative',
          zIndex:   1,
        }}
      >
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.15 }}
          style={{ marginBottom: 'clamp(48px, 7vh, 72px)' }}
        >
          <span
            style={{
              fontSize:      11,
              fontWeight:    500,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color:         '#5B6472',
              display:       'block',
              marginBottom:  20,
            }}
          >
            — Perguntas Frequentes
          </span>
          <h2
            style={{
              fontSize:      'clamp(28px, 3.8vw, 54px)',
              fontWeight:    300,
              letterSpacing: '-0.025em',
              lineHeight:    1.06,
              color:         '#F8F9FA',
              margin:        0,
              maxWidth:      560,
            }}
          >
            Tudo que você precisa<br />
            <span style={{ color: '#A78BFA' }}>saber antes de começar.</span>
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: false, amount: 0.1 }}
          style={{
            borderTop: '1px solid #1E1B4B',
            maxWidth:  880,
          }}
        >
          {FAQS.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              isOpen={openIdx === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
