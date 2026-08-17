import { useEffect, useMemo, useRef } from 'react';

/* ══════════════════════════════════════════════════════════════════════════
   v2 — deixou de ser a ÚNICA implementação do ícone e virou a camada
   ECONÔMICA dele: continua sendo tudo que mobile/reduced-motion usa (não
   compensa gastar WebGL numa forma que nunca muda — ver `pinned` em
   PillarsShaped.jsx), e é também o fallback de `<PillarsCanvas>` (Three.js)
   pra navegador sem WebGL, conexão lenta, perda de contexto, E o placeholder
   do `Suspense` enquanto o chunk de Three.js ainda está baixando no desktop
   pinado — a troca pro morphing 3D real, quando chega, lê como um upgrade
   suave porque os dois desenham a MESMA coisa (4 formas morfando por
   `activeIndex`), só que um em Canvas2D e o outro em WebGL de verdade.

   A física de morfing (lerp partícula-a-partícula por índice, cada partícula
   "sabe" pra onde ir na próxima forma) é a mesma ideia do `ParticleMorpher`
   de ThreeServicesCanvas.jsx — é matemática de posição, não rendering 3D,
   então sai idêntica em Canvas2D. O que se perde aqui é profundidade/
   iluminação real; o que se ganha é: zero WebGL, zero contexto pra perder,
   e o peso de uma função pura em vez de um chunk de centenas de KB — por
   isso é a escolha certa pra quem não vai ver o morphing scroll-linkado de
   qualquer forma (mobile) ou não tem GPU/rede pra pagar o upgrade.

   ── Por que as 4 formas são o MESMO vocabulário do Glyph.jsx ────────────────
   `pillars.labels` varia de sentido entre as 6 LPs (aqui é "Treinado no seu
   negócio/Qualificação automática/...", em landing-pages.js é "Copy AIDA/
   Performance obsessiva/...") — não há uma forma literal única que sirva
   pra todas. Em vez de inventar 4 ícones nada a ver com o resto da marca,
   reaproveita as MESMAS 4 siluetas abstratas que já pontuam o Ato 2
   (concêntrico/anel/cruz/losango) — o sistema de partículas deste ícone e
   os glifos de texto passam a ler como o mesmo vocabulário visual em dois
   lugares da página, não dois sistemas soltos.

   ── Por que corrigia o corte (v_anterior cortava nas 4 bordas) ──────────────
   O nó 3D anterior enchia o frame quadrado de ponta a ponta, sem margem —
   visivelmente cortado nas bordas em qualquer tamanho de tela. Aqui o
   `scale` do desenho é calculado contra `min(largura,altura) / 26` num
   sistema de coordenadas de raio ~9.8 (igual ao viewBox 24×24 de
   Glyph.jsx): 26 em vez de ~19.6 (2×9.8) deixa uma margem deliberada de
   respiro, então nenhuma forma nunca toca a borda do quadro.
   ══════════════════════════════════════════════════════════════════════════ */

const N = 140; // total de partículas — igual em TODAS as formas (índice a índice)
const VIOLET = '124,58,237';
const VIOLET_LIGHT = '167,139,250';

function circlePoints(cx, cy, r, count) {
  const pts = [];
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function linePoints(x1, y1, x2, y2, count) {
  const pts = [];
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
  }
  return pts;
}

/* Cada shape soma exatamente N pontos por construção (não por corte/padding
   em runtime) — os quatro conjuntos precisam ter a MESMA contagem pra que o
   lerp partícula[i] → partícula[i] em `useMorphLoop` faça sentido; um
   conjunto com contagem diferente faria partículas "sobrando" saltarem pra
   um alvo errado (índice inexistente) no momento do morph. */
function buildShapes() {
  const concentric = [
    ...circlePoints(0, 0, 9.4, 70),
    ...circlePoints(0, 0, 5.4, 50),
    ...circlePoints(0, 0, 1.6, 20),
  ];

  const ring = [
    ...circlePoints(0, 0, 8.2, 100),
    ...circlePoints(0, 0, 2.2, 40),
  ];

  const cross = [
    ...linePoints(0, -9.8, 0, 9.8, 60),
    ...linePoints(-9.8, 0, 9.8, 0, 60),
    ...linePoints(-6.9, -6.9, 6.9, 6.9, 10),
    ...linePoints(6.9, -6.9, -6.9, 6.9, 10),
  ];

  const OUT = 8.4;
  const IN = 4.2;
  const diamond = [
    ...linePoints(0, -OUT, OUT, 0, 24),
    ...linePoints(OUT, 0, 0, OUT, 24),
    ...linePoints(0, OUT, -OUT, 0, 24),
    ...linePoints(-OUT, 0, 0, -OUT, 24),
    ...linePoints(0, -IN, IN, 0, 11),
    ...linePoints(IN, 0, 0, IN, 11),
    ...linePoints(0, IN, -IN, 0, 11),
    ...linePoints(-IN, 0, 0, -IN, 11),
  ];

  return [concentric, ring, cross, diamond];
}

/* Loop de física — mesma estrutura de 3 passos do ParticleMorpher (home):
   1. lerp posição-de-repouso → alvo (morph);
   2. respiro orgânico por partícula (fase própria, barato: só um seno);
   3. rotação 2D lenta em torno do centro (+ boost de velocidade de scroll,
      passado por ref pra não re-renderizar React a cada frame).
   Tudo em refs — nenhum state, nenhum re-render do componente por frame. */
function useMorphLoop(canvasRef, shapes, activeIndex, reduce, velocityRef) {
  const activeRef = useRef(activeIndex);
  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    const morphPos = shapes[0].map((p) => [...p]);
    let rotation = 0;
    let raf;
    let lastTs = null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (ts, dt) => {
      const target = shapes[activeRef.current] ?? shapes[0];
      const morphK = 1 - Math.exp(-dt * 4.2);

      const idle = reduce ? 0 : 0.32;
      const boost = velocityRef ? Math.min(Math.abs(velocityRef.current || 0) * 0.4, 1.6) : 0;
      rotation += (idle + boost) * dt;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      // 26 (não 2×9.8≈19.6): margem deliberada pra nunca tocar a borda do
      // frame — era exatamente essa folga que faltava no nó 3D anterior.
      const scale = Math.min(w, h) / 26;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < morphPos.length; i += 1) {
        const t = target[i];
        const p = morphPos[i];
        p[0] += (t[0] - p[0]) * morphK;
        p[1] += (t[1] - p[1]) * morphK;

        const jig = reduce ? 0 : Math.sin(ts * 0.0011 + i * 0.7) * 0.22;
        const px = p[0] + jig;
        const py = p[1];

        const rx = px * cos - py * sin;
        const ry = px * sin + py * cos;
        const x = cx + rx * scale;
        const y = cy + ry * scale;

        ctx.beginPath();
        ctx.fillStyle = i % 3 === 0 ? `rgba(${VIOLET_LIGHT},0.9)` : `rgba(${VIOLET},0.75)`;
        ctx.arc(x, y, 1.7 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (reduce) {
      // Sem loop contínuo: um frame só, já convergido na forma ativa (jig e
      // rotação valem 0 quando `reduce`, então uma iteração de `draw` com dt
      // "infinito" já deixa a partícula exatamente no alvo, sem depender de
      // várias chamadas pra o lerp assentar).
      draw(0, 1);
      return () => ro.disconnect();
    }

    const tick = (ts) => {
      if (lastTs == null) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      draw(ts, dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes, reduce]);
}

export default function PillarsMorphIcon({ activeIndex = 0, reduceMotion = false, velocityRef, className = '' }) {
  const canvasRef = useRef(null);
  const shapes = useMemo(buildShapes, []);
  useMorphLoop(canvasRef, shapes, activeIndex, reduceMotion, velocityRef);

  return (
    <div className={`relative ${className}`}>
      {/* Halo estático em CSS (não `shadowBlur` por partícula no canvas —
          blur por partícula multiplicaria o custo por N a cada frame; um
          único gradiente por trás é a mesma linguagem de glow que o resto
          da marca já usa, ver `Glow` em BentoValue.jsx). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(circle, rgba(${VIOLET},0.22), transparent 70%)`, filter: 'blur(18px)' }}
      />
      <canvas ref={canvasRef} className="relative h-full w-full" aria-hidden />
    </div>
  );
}
