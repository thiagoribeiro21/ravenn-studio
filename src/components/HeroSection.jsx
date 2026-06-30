import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};


export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden overflow-x-hidden"
      style={{ padding: 'clamp(88px, 12vh, 140px) clamp(24px, 5vw, 96px)' }}
    >
      {/* ── Fade horizontal mínimo — só para legibilidade do texto ── */}
      <div
        aria-hidden
        style={{
          position:      'absolute',
          inset:         0,
          background:    'linear-gradient(to right, rgba(3,0,10,0.32) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />


      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative max-w-4xl"
        style={{ zIndex: 1 }}
      >
        {/* Eyebrow */}
        <motion.div variants={item} className="flex items-center mb-7">
          <span
            style={{
              fontSize:      11,
              fontWeight:    500,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color:         '#5B6472',
              display:       'flex',
              alignItems:    'center',
              gap:           12,
            }}
          >
            <span style={{
              display:      'inline-block',
              width:        6,
              height:       6,
              borderRadius: '50%',
              background:   '#7C3AED',
              flexShrink:   0,
            }} />
            Agência de Web Design em Niterói
          </span>
        </motion.div>

        {/* Headline */}
        <div style={{ overflow: 'hidden' }}>
          <motion.h1
            variants={item}
            className="text-balance"
            style={{
              fontSize:      'clamp(44px, 7.2vw, 92px)',
              fontWeight:    300,
              lineHeight:    1.02,
              letterSpacing: '-0.03em',
              color:         '#F8F9FA',
            }}
          >
            Negócios locais que vendem<br />
            <span style={{ color: '#A78BFA' }}>mesmo quando você dorme.</span>
          </motion.h1>
        </div>

        {/* Sub-headline */}
        <motion.p
          variants={item}
          style={{
            marginTop:  32,
            fontSize:   'clamp(16px, 1.4vw, 19px)',
            lineHeight: 1.65,
            color:      '#94A3B8',
            maxWidth:   520,
          }}
        >
          Unimos criação de sites de alta conversão com soluções de inteligência
          artificial para empresas que querem escalar lucros sem escalar equipe.
          Referência em desenvolvimento de sites e automação de atendimento em Niterói
          desde o primeiro projeto.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="flex flex-wrap gap-4 mt-11">
          <a
            href="#contact"
            className="inline-flex items-center whitespace-nowrap gap-2 h-12 md:h-14 px-5 md:px-9 text-[11px] md:text-[13px] tracking-[0.08em] md:tracking-[0.12em] rounded"
            style={{
              fontWeight:     500,
              textTransform:  'uppercase',
              background:     '#7C3AED',
              color:          '#fff',
              border:         '1px solid #7C3AED',
              textDecoration: 'none',
              transition:     'background 280ms ease, box-shadow 280ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#8B5CF6';
              e.currentTarget.style.boxShadow  = '0 0 32px -4px rgba(124,58,237,0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#7C3AED';
              e.currentTarget.style.boxShadow  = 'none';
            }}
          >
            Solicitar Diagnóstico Gratuito
          </a>
          <a
            href="https://wa.me/5521999999999?text=Olá%2C%20gostaria%20de%20agendar%20um%20diagnóstico%20gratuito."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex"
            style={{
              alignItems:     'center',
              gap:            10,
              height:         56,
              padding:        '0 36px',
              fontSize:       13,
              fontWeight:     500,
              textTransform:  'uppercase',
              letterSpacing:  '0.12em',
              background:     'transparent',
              color:          '#F8F9FA',
              borderRadius:   4,
              border:         '1px solid #2A2560',
              textDecoration: 'none',
              transition:     'border-color 280ms ease, box-shadow 280ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7C3AED';
              e.currentTarget.style.boxShadow   = '0 0 0 1px rgba(124,58,237,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2A2560';
              e.currentTarget.style.boxShadow   = 'none';
            }}
          >
            Falar pelo WhatsApp
          </a>
        </motion.div>

      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ pointerEvents: 'none' }}
      >
        <span style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#5B6472' }}>
          Scroll
        </span>
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, #5B6472, transparent)' }}
        />
      </motion.div>
    </section>
  );
}
