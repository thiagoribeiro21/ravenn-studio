import { useEffect, useRef } from 'react';
import { isSlowConnection, prefersReducedMotion } from '../config/_base';

/*
  Nuvem de partículas em canvas 2D formando um blob orgânico — não uma
  esfera perfeita. Física portada do modelo do CTACanvas (Three.js, usado
  no site principal e no Finale antigo desta LP): cada partícula tem uma
  "casa" (basePos) e é puxada de volta por uma mola, com amortecimento e
  repulsão do mouse por cima. A diferença pro CTACanvas é que aqui a "casa"
  em si se move lentamente (respiração via soma de harmônicos senoidais no
  raio do blob, sem rotação), e é tudo canvas 2D — não Three.js — porque
  o orçamento de performance desta rota não permite o bundle do R3F.

  Reusado em dois lugares com a mesma física: Hero (Ato 1) e Finale (Ato 9,
  escala maior + opacidade menor) — ver §3/Ato 9 do plano.
*/

const SPRING_K = 8;
const VEL_DAMP = 5.5;
const MOUSE_RADIUS = 90;
const MOUSE_STRENGTH = 26;

const CORE = [124, 58, 237]; // rv-purple
const MID = [139, 92, 246]; // rv-purple-500
const EDGE = [167, 139, 250]; // rv-purple-400
const HOT = [233, 213, 255]; // ponto quente quase branco

function lerp3(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function blobRadius(angle, t, amp) {
  // soma de harmônicos com fases derivando lentamente no tempo — "respiração"
  // sem rotação (cada harmônico deriva em velocidade diferente).
  return (
    1 +
    amp * 0.22 * Math.sin(angle * 2 + t * 0.35) +
    amp * 0.14 * Math.sin(angle * 3 - t * 0.22 + 1.7) +
    amp * 0.09 * Math.sin(angle * 5 + t * 0.5 + 0.6)
  );
}

export default function ParticleField({ className = '', scale = 1, opacity = 1, offsetX = 0, offsetY = 0 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const visibleRef = useRef(true);
  const lastTsRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = prefersReducedMotion();
    const slow = isSlowConnection();
    if (slow) return; // fallback CSS cuida do visual (ver Hero/FinaleCta)

    const coarse = !window.matchMedia('(pointer: fine)').matches;
    const fine = !coarse;
    const PARTICLE_COUNT = coarse ? 220 : 640;
    const CONNECTION_DIST = coarse ? 0 : 46; // liga partículas vizinhas só no desktop

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const rand = (a, b) => a + Math.random() * (b - a);

    // amplitude do blob e ponto-quente no canto superior-esquerdo, em
    // fração do menor lado do canvas — recalculado por partícula no draw.
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = rand(0, Math.PI * 2);
      const f = Math.pow(Math.random(), 0.55); // mais denso perto do centro
      return {
        angle,
        f,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        r: rand(0.7, 2.4) * scale,
        alphaBase: rand(0.35, 0.9),
      };
    });

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: (e.clientX - rect.left) * dpr, y: (e.clientY - rect.top) * dpr };
    };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    if (fine) {
      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('mouseleave', onLeave);
    }

    const io = new IntersectionObserver(([entry]) => { visibleRef.current = entry.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    const onVisibility = () => { if (document.visibilityState !== 'visible') visibleRef.current = false; };
    document.addEventListener('visibilitychange', onVisibility);

    const draw = (ts) => {
      rafRef.current = requestAnimationFrame(draw);
      if (!visibleRef.current) { lastTsRef.current = ts; return; }

      const dt = Math.min((ts - (lastTsRef.current || ts)) / 1000, 0.05);
      lastTsRef.current = ts;
      const t = ts / 1000;

      const cw = canvas.width;
      const ch = canvas.height;
      const cx = cw / 2 + offsetX * dpr;
      const cy = ch / 2 + offsetY * dpr;
      const baseR = Math.min(cw, ch) * 0.34 * scale;
      const amp = baseR * 0.9;

      ctx.clearRect(0, 0, cw, ch);

      const pts = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const rAtAngle = baseR + amp * (blobRadius(p.angle, t, 1) - 1);
        const bx = cx + Math.cos(p.angle) * p.f * rAtAngle;
        const by = cy + Math.sin(p.angle) * p.f * rAtAngle * 0.86; // levemente achatado

        if (reduce) {
          // frame único: sem física, cai direto na posição de casa —
          // com dt=0 o loop de mola nunca teria movido a partícula de (0,0).
          p.x = bx;
          p.y = by;
        } else {
          // mola até a "casa" (que se move com o blob respirando)
          const dx0 = bx - p.x;
          const dy0 = by - p.y;
          p.vx += (dx0 * SPRING_K - p.vx * VEL_DAMP) * dt;
          p.vy += (dy0 * SPRING_K - p.vy * VEL_DAMP) * dt;

          // repulsão do mouse
          const ddx = p.x - mx;
          const ddy = p.y - my;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          const radiusPx = MOUSE_RADIUS * dpr;
          if (dist < radiusPx && dist > 0.001) {
            const force = (1 - dist / radiusPx) * MOUSE_STRENGTH;
            p.vx += (ddx / dist) * force * dt;
            p.vy += (ddy / dist) * force * dt;
          }

          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        // cor: núcleo violeta -> borda lilás, com boost quente no canto
        // superior-esquerdo do blob (ângulo ~225°).
        const edgeT = Math.min(1, p.f);
        let color = lerp3(CORE, edgeT < 0.5 ? MID : EDGE, edgeT < 0.5 ? edgeT * 2 : (edgeT - 0.5) * 2);
        const hotAngle = Math.atan2(-0.7, -0.7); // ~225°
        let angDiff = Math.abs(((p.angle - hotAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
        const hotT = Math.max(0, 1 - angDiff / 1.1) * (1 - edgeT) * 0.7;
        if (hotT > 0) color = lerp3(color, HOT, hotT);

        ctx.globalAlpha = p.alphaBase * opacity * (0.55 + 0.45 * (1 - edgeT));
        ctx.fillStyle = `rgb(${color[0] | 0}, ${color[1] | 0}, ${color[2] | 0})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      if (CONNECTION_DIST > 0) {
        const cd = CONNECTION_DIST * dpr;
        ctx.strokeStyle = `rgba(167,139,250,${0.12 * opacity})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < pts.length; i += 3) {
          for (let j = i + 3; j < pts.length; j += 5) {
            const a = pts[i], b = pts[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < cd) {
              ctx.globalAlpha = (1 - d / cd) * 0.25 * opacity;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }
    };

    if (reduce) {
      // congela num frame único e bonito, sem RAF contínuo
      draw(0);
      cancelAnimationFrame(rafRef.current);
    } else {
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      if (fine) {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseleave', onLeave);
      }
      document.removeEventListener('visibilitychange', onVisibility);
      io.disconnect();
    };
  }, [scale, opacity, offsetX, offsetY]);

  const slow = typeof navigator !== 'undefined' && isSlowConnection();

  if (slow) {
    // fallback CSS puro — sem canvas, sem RAF, custo ~0.
    return (
      <div
        aria-hidden
        className={className}
        style={{
          background:
            'radial-gradient(closest-side, rgba(124,58,237,0.55), rgba(139,92,246,0.22) 55%, transparent 78%)',
          filter: 'blur(2px)',
        }}
      />
    );
  }

  return <canvas ref={canvasRef} aria-hidden className={className} style={{ display: 'block' }} />;
}
