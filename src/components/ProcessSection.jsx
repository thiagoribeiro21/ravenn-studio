import { motion } from 'framer-motion';

const STEPS = [
  {
    num:   '01',
    title: 'Imersão e Diagnóstico',
    body:  'Entendimento profundo do modelo de negócio, público-alvo e posicionamento competitivo na Região Oceânica. Mapeamos cada oportunidade antes de escrever uma linha de código.',
  },
  {
    num:   '02',
    title: 'Engenharia e Design',
    body:  'Construção da interface exclusiva baseada em código puro — sem templates. Cada detalhe visual serve ao objetivo de conversão e ao posicionamento de autoridade da marca.',
  },
  {
    num:   '03',
    title: 'Entrega e Aceleração',
    body:  'Lançamento com foco em velocidade extrema (PageSpeed 90+) e SEO local. Monitoramos resultados e ajustamos para garantir crescimento orgânico sustentável.',
  },
];

export default function ProcessSection() {
  return (
    <section
      id="processo"
      style={{ borderTop: '1px solid #1E1B4B', position: 'relative', overflow: 'hidden' }}
    >
      {/* Aura lateral */}
      <div
        aria-hidden
        style={{
          position:      'absolute',
          top:           '30%',
          left:          '-20%',
          width:         700,
          height:        700,
          borderRadius:  '50%',
          background:    'radial-gradient(circle, rgba(76,29,149,0.22) 0%, transparent 65%)',
          filter:        'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Cabeçalho da seção ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: false, amount: 0.15 }}
        style={{
          padding:  'clamp(72px, 10vw, 128px) clamp(32px, 5vw, 96px) clamp(48px, 6vw, 72px)',
          position: 'relative',
          zIndex:   1,
        }}
      >
        <span
          style={{
            fontSize:      11,
            fontWeight:    500,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color:         '#5B6472',
            display:       'block',
            marginBottom:  28,
          }}
        >
          — Como trabalhamos
        </span>

        <h2
          style={{
            fontSize:      'clamp(26px, 3.8vw, 50px)',
            fontWeight:    300,
            lineHeight:    1.18,
            letterSpacing: '-0.025em',
            color:         '#F8F9FA',
            maxWidth:      680,
            margin:        0,
          }}
        >
          Três passos. Resultado{' '}
          <span style={{ color: '#A78BFA' }}>previsível.</span>
        </h2>
      </motion.div>

      {/* ── Grid de passos com hairline borders ───────────────────────────── */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          borderTop:           '1px solid #1E1B4B',
          position:            'relative',
          zIndex:              1,
        }}
      >
        {STEPS.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: false, amount: 0.15 }}
            style={{
              padding:     'clamp(40px, 5vw, 64px) clamp(32px, 4vw, 56px)',
              borderRight: i < STEPS.length - 1 ? '1px solid #1E1B4B' : 'none',
              position:    'relative',
            }}
          >
            {/* Linha decorativa no topo de cada passo */}
            <div
              aria-hidden
              style={{
                position:   'absolute',
                top:        0,
                left:       'clamp(32px, 4vw, 56px)',
                width:      40,
                height:     1,
                background: '#7C3AED',
                opacity:    0.6,
              }}
            />

            <span
              style={{
                fontSize:      11,
                fontWeight:    500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color:         '#7C3AED',
                display:       'block',
                marginBottom:  20,
              }}
            >
              {step.num}
            </span>

            <h3
              style={{
                fontSize:      'clamp(18px, 1.6vw, 22px)',
                fontWeight:    300,
                color:         '#F8F9FA',
                marginBottom:  16,
                letterSpacing: '-0.01em',
                lineHeight:    1.3,
              }}
            >
              {step.title}
            </h3>

            <p style={{ fontSize: 14, lineHeight: 1.78, color: '#94A3B8', margin: 0 }}>
              {step.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
