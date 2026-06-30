import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const WA_LINK =
  'https://wa.me/5521999999999?text=Olá%2C%20quero%20saber%20mais%20sobre%20os%20serviços%20da%20Ravenn%20Studio.';

const PARTICLE_COUNT = 11500; // ~8050 núcleo + ~3450 halo

// ── Cena de partículas ────────────────────────────────────────────────────────
function NebulaField() {
  const ref       = useRef();
  const baseRotY  = useRef(0); // acumula rotação base Y separado do pointer
  const { pointer } = useThree();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);

    const cCore  = new THREE.Color('#e9d5ff');
    const cMid   = new THREE.Color('#a855f7');
    const cOuter = new THREE.Color('#6d28d9');
    const cHalo  = new THREE.Color('#4c1d95');
    const coreCount = Math.floor(PARTICLE_COUNT * 0.70);
    const tmp = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x, y, z, t;

      if (i < coreCount) {
        const r     = Math.pow(Math.random(), 0.55) * 2.8;
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta) * 0.28;
        z = r * Math.cos(phi);
        t = r / 2.8;
      } else {
        const r     = 2.8 + Math.pow(Math.random(), 0.40) * 2.7;
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta) * 0.55;
        z = r * Math.cos(phi);
        t = 1;
      }

      pos[i * 3]     = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      if (t < 0.25)      tmp.lerpColors(cCore,  cMid,   t / 0.25);
      else if (t < 0.65) tmp.lerpColors(cMid,   cOuter, (t - 0.25) / 0.40);
      else               tmp.lerpColors(cOuter, cHalo,  (t - 0.65) / 0.35);

      col[i * 3]     = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }

    return [pos, col];
  }, []);

  useFrame(() => {
    if (!ref.current) return;

    // Rotação contínua de base
    baseRotY.current += 0.00045;
    ref.current.rotation.z += 0.00012;

    // Y = base + influência horizontal do cursor (parallax suave)
    ref.current.rotation.y = baseRotY.current + pointer.x * 0.18;

    // X = inclinação vertical seguindo o cursor (lerp para suavidade)
    ref.current.rotation.x += (-pointer.y * 0.14 - ref.current.rotation.x) * 0.03;
  });

  return (
    <points ref={ref} scale={[3.5, 3.5, 3.5]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors,    3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.38}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ── Seção CTA ─────────────────────────────────────────────────────────────────
export default function CTASection() {
  return (
    <section
      id="cta"
      style={{
        position:   'relative',
        overflow:   'hidden',
        borderTop:  '1px solid #1E1B4B',
        background: '#03000A',
      }}
    >

      {/* z-0 — Canvas de partículas */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Canvas
          camera={{ position: [0, 0, 7], fov: 75 }}
          gl={{ antialias: false, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <NebulaField />
        </Canvas>
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
          background: 'radial-gradient(circle at center, rgba(3,0,10,0.82) 0%, rgba(3,0,10,0.32) 42%, transparent 70%)',
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

        {/* Headline — fontWeight 400 + textShadow para saltar das partículas */}
        <h2
          style={{
            fontSize:      'clamp(32px, 5vw, 72px)',
            fontWeight:    400,
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
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            12,
            height:         64,
            padding:        '0 48px',
            fontSize:       13,
            fontWeight:     500,
            textTransform:  'uppercase',
            letterSpacing:  '0.14em',
            background:     '#7C3AED',
            color:          '#fff',
            borderRadius:   4,
            border:         '1px solid #7C3AED',
            textDecoration: 'none',
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
