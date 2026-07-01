import { lazy, Suspense, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CTACanvas = lazy(() => import('./CTACanvas'));

const WA_LINK =
  'https://wa.me/5521989211887?text=Olá%2C%20quero%20saber%20mais%20sobre%20os%20serviços%20da%20Ravenn%20Studio.';

// ── Seção CTA ─────────────────────────────────────────────────────────────────
export default function CTASection() {
  const sectionRef    = useRef(null);
  const [entered, setEntered] = useState(false);

  // Só monta o Canvas 3D (e dispara o download do Three.js) quando a seção
  // está a 300 px do viewport — evita bloquear o thread durante o load inicial.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setEntered(true); io.disconnect(); } },
      { rootMargin: '300px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      style={{
        position:   'relative',
        overflow:   'hidden',
        borderTop:  '1px solid #1E1B4B',
        background: '#03000A',
      }}
    >

      {/* z-0 — Canvas de partículas: só renderiza quando próximo do viewport */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {entered && (
          <Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#03000A' }} />}>
            <CTACanvas />
          </Suspense>
        )}
      </div>

      {/* z-5 — Vinheta perimetral: partículas dissolvem antes das bordas */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex:     5,
          background: 'radial-gradient(ellipse at center, transparent 30%, #03000A 95%)',
        }}
      />

      {/* z-10 — Máscara de contraste central: "buraco" escuro atrás do texto */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex:     10,
          background: 'radial-gradient(circle at center, rgba(3,0,10,0.60) 0%, rgba(3,0,10,0.22) 42%, transparent 70%)',
        }}
      />

      {/* z-20 — Conteúdo */}
      <motion.div
        initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: false, amount: 0.15 }}
        style={{
          position:      'relative',
          zIndex:        20,
          textAlign:     'center',
          padding:       'clamp(96px, 14vh, 160px) clamp(32px, 5vw, 96px)',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          pointerEvents: 'none', // deixa o mouse passar pro canvas 3D; reativado nos filhos clicáveis
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            fontSize:      11,
            fontWeight:    500,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color:         '#7C3AED',
            display:       'block',
            marginBottom:  28,
          }}
        >
          — Próximo passo
        </span>

        {/* Headline — fontWeight 300 + textShadow para saltar das partículas */}
        <h2
          style={{
            fontSize:      'clamp(32px, 5vw, 72px)',
            fontWeight:    300,
            letterSpacing: '-0.03em',
            lineHeight:    1.04,
            color:         '#F8F9FA',
            maxWidth:      760,
            margin:        '0 0 48px',
            textShadow:    '0 2px 24px rgba(0,0,0,0.90)',
          }}
        >
          Pronto para dominar<br />
          <span style={{ color: '#A78BFA' }}>o seu mercado?</span>
        </h2>

        {/* CTA WhatsApp */}
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center whitespace-nowrap gap-2 md:gap-3 h-12 md:h-16 px-5 md:px-12 text-[11px] md:text-[13px] tracking-[0.09em] md:tracking-[0.14em] rounded"
          style={{
            fontWeight:     500,
            textTransform:  'uppercase',
            background:     '#7C3AED',
            color:          '#fff',
            border:         '1px solid #7C3AED',
            textDecoration: 'none',
            pointerEvents:  'auto',
            transition:     'background 280ms ease, box-shadow 280ms ease, transform 120ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#8B5CF6';
            e.currentTarget.style.boxShadow  = '0 0 48px -6px rgba(124,58,237,0.65)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#7C3AED';
            e.currentTarget.style.boxShadow  = 'none';
          }}
          onMouseDown={(e)  => { e.currentTarget.style.transform = 'scale(0.985)'; }}
          onMouseUp={(e)    => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Falar com a equipe no WhatsApp
        </a>

        <p
          style={{
            marginTop:     24,
            fontSize:      11,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color:         'rgba(255,255,255,0.70)',
          }}
        >
          Resposta em até 2 horas · Sem compromisso
        </p>
      </motion.div>

    </section>
  );
}
