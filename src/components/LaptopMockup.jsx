import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// ── LaptopMockup ──────────────────────────────────────────────────────────────
//
// CSS pseudo-3D. Sem WebGL. A ilusão vem de:
//   • perspective: 1100px no container externo
//   • rotateX / rotateY via Framer Motion spring → tilt reativo ao mouse
//   • translateY: -8px no hover → sensação de levitação
//   • Box-shadow com glow violeta → âncora de profundidade
//
// Props:
//   src   — caminho do vídeo (autoplay loop muted playsInline)
//
export default function LaptopMockup({ src }) {
  const containerRef = useRef(null);

  // Posição raw do mouse normalizada de -1 a 1
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Spring suave → evita overshooting
  const spring = { stiffness: 75, damping: 18, mass: 0.7 };
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-14, 14]), spring);
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [9, -9]),  spring);
  const lift    = useSpring(useMotionValue(0), spring);

  const handleMouseMove = useCallback((e) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    rawX.set(((e.clientX - r.left) / r.width)  * 2 - 1);
    rawY.set(((e.clientY - r.top)  / r.height) * 2 - 1);
    lift.set(-10);
  }, [rawX, rawY, lift]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    lift.set(0);
  }, [rawX, rawY, lift]);

  return (
    <div
      ref={containerRef}
      style={{ perspective: '1100px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          y: lift,
          transformStyle: 'preserve-3d',
        }}
      >

        {/* ── Chassi / Tampa (screen) ─────────────────────────────────── */}
        <div
          style={{
            background:   'linear-gradient(160deg, #2e2e30 0%, #1e1e20 55%, #141416 100%)',
            borderRadius: '14px 14px 4px 4px',
            padding:      '10px 10px 0',
            border:       '1px solid rgba(255,255,255,0.11)',
            position:     'relative',
            boxShadow: [
              'inset 0 1px 0 rgba(255,255,255,0.08)',   /* brilho superior */
              'inset 0 -1px 0 rgba(0,0,0,0.7)',          /* sombra inferior */
              '0 50px 100px -20px rgba(0,0,0,0.85)',     /* sombra de chão */
              '0 0 60px -8px rgba(124,58,237,0.22)',     /* aura violeta */
              '0 0 0 0.5px rgba(0,0,0,0.9)',             /* contorno */
            ].join(', '),
          }}
        >
          {/* Highlight metálico no topo */}
          <div
            aria-hidden
            style={{
              position:   'absolute',
              top:        0,
              left:       '12%',
              right:      '12%',
              height:     1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
              borderRadius: 1,
            }}
          />

          {/* Câmera */}
          <div
            aria-hidden
            style={{
              width:        7,
              height:       7,
              borderRadius: '50%',
              background:   'radial-gradient(circle at 38% 32%, #3a3a3d, #0f0f11)',
              border:       '1px solid rgba(255,255,255,0.06)',
              boxShadow:    'inset 0 1px 2px rgba(0,0,0,0.95), 0 0 0 1.5px rgba(0,0,0,0.5)',
              margin:       '2px auto 8px',
            }}
          />

          {/* Tela com vídeo — 16:9 exato igual à resolução dos vídeos (1920×1080) */}
          <div
            style={{
              borderRadius: '6px 6px 0 0',
              overflow:     'hidden',
              background:   '#000',
              aspectRatio:  '16 / 9',
              position:     'relative',
            }}
          >
            <video
              src={src}
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              style={{
                display:    'block',
                width:      '100%',
                height:     '100%',
                objectFit:  'contain',
              }}
            />
            {/* Reflexo de glare */}
            <div
              aria-hidden
              style={{
                position:      'absolute',
                inset:         0,
                background:    'linear-gradient(140deg, rgba(255,255,255,0.055) 0%, transparent 42%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* ── Dobradiça ──────────────────────────────────────────────── */}
        <div
          aria-hidden
          style={{
            height:     3,
            background: 'linear-gradient(90deg, #080808 0%, #2a2a2c 40%, #1a1a1c 60%, #080808 100%)',
            margin:     '0 6px',
          }}
        />

        {/* ── Base (teclado) ─────────────────────────────────────────── */}
        <div
          style={{
            background:   'linear-gradient(180deg, #232326 0%, #17171a 100%)',
            borderRadius: '0 0 12px 12px',
            height:       32,
            border:       '1px solid rgba(255,255,255,0.07)',
            borderTop:    'none',
            position:     'relative',
            overflow:     'hidden',
          }}
        >
          {/* Sombra do teclado */}
          <div
            aria-hidden
            style={{
              position:     'absolute',
              top:          4,
              left:         '8%',
              right:        '8%',
              height:       10,
              background:   'rgba(0,0,0,0.28)',
              borderRadius: 2,
            }}
          />
          {/* Trackpad */}
          <div
            aria-hidden
            style={{
              position:     'absolute',
              bottom:       5,
              left:         '50%',
              transform:    'translateX(-50%)',
              width:        '22%',
              height:       11,
              background:   'rgba(255,255,255,0.025)',
              border:       '1px solid rgba(255,255,255,0.055)',
              borderRadius: 4,
            }}
          />
        </div>

        {/* ── Reflexo de mesa ────────────────────────────────────────── */}
        <div
          aria-hidden
          style={{
            height:    16,
            background:'linear-gradient(to bottom, rgba(255,255,255,0.045), transparent)',
            transform: 'scaleY(-1)',
            opacity:   0.22,
            filter:    'blur(4px)',
          }}
        />

      </motion.div>
    </div>
  );
}
