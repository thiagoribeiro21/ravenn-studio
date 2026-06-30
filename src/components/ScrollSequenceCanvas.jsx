import { useRef, useEffect, useState, useCallback } from 'react';
import { useMenu } from '../context/MenuContext';

// ─── Constantes ───────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 121;

const pad    = (n) => String(n).padStart(3, '0');
const getUrl = (n) => `/frame-raven/frame_${pad(n)}.webp`;

// Classes idênticas para <video> e <canvas> — posicionamento extremo desktop
const MEDIA_CLASSES =
  'absolute top-0 w-full h-full object-cover ' +
  'lg:object-contain lg:left-[48vw] lg:w-[85vw] lg:scale-[1.35]';

// ─── Componente ───────────────────────────────────────────────────────────────
//
//  O scroll do site vive dentro do scrollContainerRef do SiteShell —
//  não no window. Por isso o listener é adicionado nesse container.
//
//  Crossfade via React state (isScrolled):
//    scrollTop === 0  → vídeo visível, canvas opacity-0
//    scrollTop > 20   → vídeo opacity-0, canvas visível
//  CSS transition-opacity duration-300 cuida da suavidade.
//
//  Frames calculados por RAF:
//    progress = scrollTop / maxScroll
//    frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1))
//
export default function ScrollSequenceCanvas({ endRef }) {
  const { scrollContainerRef } = useMenu();

  // Canvas só no desktop real (≥ 1024px)
  const isSmallRef = useRef(
    typeof window !== 'undefined' && window.innerWidth < 1024,
  );
  const isSmall = isSmallRef.current;

  // Estado que aciona o crossfade via CSS
  const [isScrolled, setIsScrolled] = useState(false);

  const innerRef  = useRef(null);
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const sizedRef  = useRef(false);
  const rafRef    = useRef(null);

  // ── drawFrame ──────────────────────────────────────────────────────────────
  // Canvas internal size = resolução natural da imagem (setado uma única vez).
  // Cobre 100% do canvas — CSS object-contain escala igual ao vídeo.
  const drawFrame = useCallback((idx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = framesRef.current[Math.min(idx, TOTAL_FRAMES - 1)];
    if (!img?.complete || !img.naturalWidth) return;

    if (!sizedRef.current) {
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      sizedRef.current = true;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  // ── Pré-carga dos frames WebP ──────────────────────────────────────────────
  useEffect(() => {
    if (isSmall) return;
    const imgs = new Array(TOTAL_FRAMES);
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img  = new Image();
      img.src    = getUrl(i + 1);
      // Frame 0 pintado logo que carrega (canvas ainda invisível → sem flash)
      img.onload = () => { if (i === 0) drawFrame(0); };
      imgs[i]    = img;
    }
    framesRef.current = imgs;
    return () => { framesRef.current = []; };
  }, [drawFrame, isSmall]);

  // ── Listener de scroll no container do SiteShell ──────────────────────────
  useEffect(() => {
    // No mobile mostramos apenas o vídeo em loop — sem lógica de frames
    const container = scrollContainerRef.current;
    if (!container) return;

    const video = videoRef.current;

    const handleScroll = () => {
      const scrollTop   = container.scrollTop;
      const nowScrolled = scrollTop > 20;

      // ── Crossfade bidirecional via state ────────────────────────────────────
      setIsScrolled(nowScrolled);

      if (nowScrolled) {
        if (video && !video.paused) video.pause();
      } else {
        if (video && video.paused) video.play().catch(() => {});
      }

      // ── Animação de frames (só desktop e quando há scroll) ─────────────────
      if (isSmall || !nowScrolled) return;

      // maxScroll: distância total até o fim da sequência
      const maxScroll = endRef?.current
        ? endRef.current.getBoundingClientRect().top + container.scrollTop
        : container.clientHeight * 3;

      const progress   = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      const frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));

      // Parallax horizontal leve no wrapper interno
      const inner = innerRef.current;
      if (inner) {
        const xT = Math.min(1, Math.max(0, (progress - 0.05) / 0.75));
        inner.style.transform = `translateX(${8 * xT}vw)`;
      }

      // Desenha dentro de um requestAnimationFrame para sincronizar com o display
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(frameIndex));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame, isSmall, endRef, scrollContainerRef]);

  // ── Render ─────────────────────────────────────────────────────────────────
  //
  // Opacidades controladas por Tailwind via isScrolled:
  //   vídeo : opacity-[0.38] → opacity-0  (some ao scrollar)
  //   canvas: opacity-0      → opacity-[0.38]  (surge ao scrollar)
  //   mobile : vídeo fixo em opacity-[0.18], sem canvas
  //
  const videoOpacity  = isSmall
    ? 'opacity-[0.18]'
    : isScrolled ? 'opacity-0' : 'opacity-[0.38]';

  const canvasOpacity = isScrolled ? 'opacity-[0.38]' : 'opacity-0';

  return (
    <div
      aria-hidden
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100%',
        height:        '100vh',
        overflow:      'hidden', // clipa o sangramento sem criar scrollbar
        pointerEvents: 'none',
        zIndex:        0,
      }}
    >
      <div
        ref={innerRef}
        style={{ position: 'absolute', inset: 0, willChange: 'transform' }}
      >
        {/* Vídeo — crossfade via CSS, classes de dimensionamento idênticas ao canvas */}
        <video
          ref={videoRef}
          src="/raven-loop-video.webm"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className={`${MEDIA_CLASSES} transition-opacity duration-300 ${videoOpacity}`}
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Canvas (desktop only) — classes idênticas ao vídeo */}
        {!isSmall && (
          <canvas
            ref={canvasRef}
            className={`${MEDIA_CLASSES} transition-opacity duration-300 ${canvasOpacity}`}
            style={{ mixBlendMode: 'screen', display: 'block' }}
          />
        )}
      </div>
    </div>
  );
}
