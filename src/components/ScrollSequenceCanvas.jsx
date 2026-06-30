import { useRef, useEffect, useState, useCallback } from "react";
import { useMenu } from "../context/MenuContext";

// ─── Constantes ───────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 121;

const pad = (n) => String(n).padStart(3, "0");
const getUrl = (n) => `/frame-raven/frame_${pad(n)}.webp`;

// Classes idênticas para <video> e <canvas> — posicionamento extremo desktop
const MEDIA_CLASSES =
  "absolute top-0 w-full h-full object-cover " +
  "lg:object-contain lg:left-[48vw] lg:w-[85vw] lg:scale-[1.35]";

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
    typeof window !== "undefined" && window.innerWidth < 1024,
  );
  const isSmall = isSmallRef.current;

  // Estado que aciona o crossfade via CSS
  const [isScrolled, setIsScrolled] = useState(false);

  const innerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const sizedRef = useRef(false);
  const rafRef = useRef(null);
  // Frames só começam a baixar na primeira vez que o usuário scrolla —
  // evita competição com recursos críticos no carregamento inicial.
  const framesLoadedRef = useRef(false);

  // ── drawFrame ──────────────────────────────────────────────────────────────
  const drawFrame = useCallback((idx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = framesRef.current[Math.min(idx, TOTAL_FRAMES - 1)];
    if (!img?.complete || !img.naturalWidth) return;

    if (!sizedRef.current) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      sizedRef.current = true;
    }

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  // ── Listener de scroll no container do SiteShell ──────────────────────────
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const video = videoRef.current;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const nowScrolled = scrollTop > 20;

      setIsScrolled(nowScrolled);

      if (nowScrolled) {
        if (video && !video.paused) video.pause();
      } else {
        if (video && video.paused) video.play().catch(() => {});
      }

      if (isSmall || !nowScrolled) return;

      // ── Carga lazy dos frames: só inicia no primeiro scroll ────────────────
      if (!framesLoadedRef.current) {
        framesLoadedRef.current = true;
        const imgs = new Array(TOTAL_FRAMES);
        for (let i = 0; i < TOTAL_FRAMES; i++) {
          const img = new Image();
          img.src = getUrl(i + 1);
          img.onload = () => {
            if (i === 0) drawFrame(0);
          };
          imgs[i] = img;
        }
        framesRef.current = imgs;
      }

      const maxScroll = endRef?.current
        ? endRef.current.getBoundingClientRect().top + container.scrollTop
        : container.clientHeight * 3;

      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      const frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));

      const inner = innerRef.current;
      if (inner) {
        const xT = Math.min(1, Math.max(0, (progress - 0.05) / 0.75));
        inner.style.transform = `translateX(${8 * xT}vw)`;
      }

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(frameIndex));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame, isSmall, endRef, scrollContainerRef]);

  // ── Render ─────────────────────────────────────────────────────────────────
  //
  // Mobile (isSmall): sem vídeo, sem canvas — fundo sólido do SiteShell.
  // Desktop: vídeo (opacity-[0.38]) → canvas (opacity-[0.38]) no crossfade.
  //
  const videoOpacity = isScrolled ? "opacity-0" : "opacity-[0.35]";
  const canvasOpacity = isScrolled ? "opacity-[0.35]" : "opacity-0";

  // Mobile: imagem estática + vídeo em loop por cima (150KB).
  if (isSmall) {
    return (
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <img
          src="/bg-mobile-ravenn-hero.webp"
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.55,
          }}
        />
        <video
          src="/raven-loop-video.webm"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.08,
            mixBlendMode: "screen",
          }}
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Camada base estática — fica parada enquanto o scroll-sequence se move */}
      <img
        src="/bg-hero-desktop.webp"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.42,
        }}
      />

      <div
        ref={innerRef}
        style={{ position: "absolute", inset: 0, willChange: "transform" }}
      >
        {/* Vídeo hero (desktop) — preload=none: só carrega ao dar play */}
        <video
          ref={videoRef}
          src="/raven-loop-video.webm"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className={`${MEDIA_CLASSES} transition-opacity duration-300 ${videoOpacity}`}
          style={{ mixBlendMode: "screen" }}
        >
          <track kind="captions" />
        </video>

        {/* Canvas de frames WebP (desktop) */}
        <canvas
          ref={canvasRef}
          className={`${MEDIA_CLASSES} transition-opacity duration-300 ${canvasOpacity}`}
          style={{ mixBlendMode: "screen", display: "block" }}
        />
      </div>
    </div>
  );
}
