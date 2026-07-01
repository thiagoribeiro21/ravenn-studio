import { motion } from 'framer-motion';

const METRICS = [
  { num: '90+',  label: 'PageSpeed Score',        detail: 'Sites otimizados para velocidade extrema e SEO'             },
  { num: '24/7', label: 'Atendimento Automático', detail: 'Agentes de IA trabalhando para você sem pausas'             },
  { num: '100%', label: 'Código Exclusivo',        detail: 'Zero templates. Design construído sob medida para sua marca' },
];

export default function MetricsBar() {
  return (
    <section
      aria-label="Métricas de autoridade"
      style={{
        borderTop:    '1px solid #1E1B4B',
        borderBottom: '1px solid #1E1B4B',
        position:     'relative',
        overflow:     'hidden',
      }}
    >
      {/* Aura discreta centralizada */}
      <div
        aria-hidden
        style={{
          position:      'absolute',
          top:           '50%',
          left:          '50%',
          transform:     'translate(-50%,-50%)',
          width:         600,
          height:        200,
          borderRadius:  '50%',
          background:    'radial-gradient(circle, rgba(76,29,149,0.14) 0%, transparent 70%)',
          filter:        'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="grid grid-cols-1 sm:grid-cols-3"
        style={{
          position:            'relative',
          zIndex:              1,
        }}
      >
        {METRICS.map(({ num, label, detail }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className={
              i < METRICS.length - 1
                ? 'border-b sm:border-b-0 sm:border-r border-[#1E1B4B]'
                : ''
            }
            style={{
              display:         'flex',
              flexDirection:   'column',
              alignItems:      'center',
              justifyContent:  'center',
              textAlign:       'center',
              padding:         'clamp(32px, 5vh, 60px) clamp(20px, 3vw, 48px)',
            }}
          >
            <span
              style={{
                fontSize:      'clamp(40px, 5.5vw, 72px)',
                fontWeight:    300,
                letterSpacing: '-0.03em',
                lineHeight:    1,
                color:         '#F8F9FA',
                display:       'block',
              }}
            >
              {num}
            </span>

            <span
              style={{
                display:       'block',
                marginTop:     10,
                fontSize:      11,
                fontWeight:    500,
                textTransform: 'uppercase',
                letterSpacing: '0.20em',
                color:         '#F8F9FA',
                opacity:       0.7,
              }}
            >
              {label}
            </span>

            <span
              style={{
                display:       'block',
                marginTop:     8,
                fontSize:      'clamp(12.5px, 1.3vw, 14px)',
                fontWeight:    400,
                lineHeight:    1.5,
                letterSpacing: '0.02em',
                color:         '#94A3B8',
                maxWidth:      240,
              }}
            >
              {detail}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
