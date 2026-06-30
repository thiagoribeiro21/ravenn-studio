import { useEffect, useRef } from 'react';

// ── Constants ────────────────────────────────────────────────────────────────
const PARTICLE_COUNT   = 80;
const REPULSION_RADIUS = 110;
const CONNECTION_DIST  = 145;
const DAMPING          = 0.984;
const SPEED_CLAMP      = 1.1;
const NOISE            = 0.002;
const PARTICLE_COLOR   = '#7C3AED';

// ── Helpers ──────────────────────────────────────────────────────────────────
function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

function drawTriangle(ctx, x, y, r) {
  const s = r * 2.2;
  ctx.beginPath();
  ctx.moveTo(x,             y - s);
  ctx.lineTo(x + s * 0.866, y + s * 0.5);
  ctx.lineTo(x - s * 0.866, y + s * 0.5);
  ctx.closePath();
  ctx.fill();
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CustomCanvasBackground() {
  const canvasRef  = useRef(null);
  const mouseRef   = useRef({ x: -9999, y: -9999 });
  const rafRef     = useRef(null);
  const partsRef   = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    // ── Resize ────────────────────────────────────────────────
    const resize = () => {
      const prevW = canvas.width;
      const prevH = canvas.height;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-clamp particle positions so they stay on-screen after resize
      const ps = partsRef.current;
      if (ps.length && (prevW !== canvas.width || prevH !== canvas.height)) {
        for (let i = 0; i < ps.length; i++) {
          ps[i].x = (ps[i].x / prevW) * canvas.width;
          ps[i].y = (ps[i].y / prevH) * canvas.height;
        }
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Init particles ────────────────────────────────────────
    partsRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x:     rand(0, canvas.width),
      y:     rand(0, canvas.height),
      vx:    rand(-0.2, 0.2),
      vy:    rand(-0.2, 0.2),
      r:     rand(1, 2.8),
      shape: i < PARTICLE_COUNT * 0.55 ? 'circle' : 'triangle',
      alpha: rand(0.2, 0.65),
    }));

    // ── Draw loop ─────────────────────────────────────────────
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const ps = partsRef.current;

      ctx.clearRect(0, 0, W, H);

      // — Update physics —
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];

        // Mouse repulsion
        const dx   = p.x - mx;
        const dy   = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPULSION_RADIUS && dist > 0) {
          const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS;
          p.vx += (dx / dist) * force * 0.9;
          p.vy += (dy / dist) * force * 0.9;
        }

        // Damping + organic noise
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.vx += (Math.random() - 0.5) * NOISE;
        p.vy += (Math.random() - 0.5) * NOISE;

        // Speed clamp
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > SPEED_CLAMP) {
          p.vx = (p.vx / spd) * SPEED_CLAMP;
          p.vy = (p.vy / spd) * SPEED_CLAMP;
        }

        // Position + wrap
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10)    p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10)    p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      }

      // — Connection lines —
      ctx.strokeStyle = PARTICLE_COLOR;
      ctx.lineWidth   = 0.5;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a  = ps[i], b = ps[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECTION_DIST) {
            ctx.globalAlpha = (1 - d / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // — Draw particles —
      ctx.fillStyle = PARTICLE_COLOR;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        ctx.globalAlpha = p.alpha;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawTriangle(ctx, p.x, p.y, p.r);
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    // ── Mouse tracking ────────────────────────────────────────
    const onMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = ()  => { mouseRef.current = { x: -9999, y: -9999 }; };
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('mouseleave', onLeave);

    // ── Page visibility: restart RAF if tab was hidden ────────
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        cancelAnimationFrame(rafRef.current);
        draw();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
