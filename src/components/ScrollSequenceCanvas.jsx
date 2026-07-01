import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useMenu } from "../context/MenuContext";

// ─── Constantes ───────────────────────────────────────────────────────────────
const VIDEO_SRC = "/raven-loop-fly.webm"; // usado só no overlay leve do mobile
const TOTAL_FRAMES = 121;

const pad = (n) => String(n).padStart(3, "0");
const getUrl = (n) => `/raven-novos-frames/frame_${pad(n)}.webp`;

// Classe do canvas — posicionamento extremo desktop.
// mix-blend-screen fecha o fundo preto de cada frame contra o fundo escuro do
// site (screen com preto = transparente); contrast/brightness compensam o
// "quase preto" residual da compressão do codec, e a máscara radial (ver
// MASK_STYLE) esconde a borda quadrada do bounding box com um fade suave.
const CANVAS_CLASSES =
  "absolute top-0 w-full h-full object-cover mix-blend-screen contrast-125 brightness-110 " +
  "lg:object-contain lg:left-[38vw] lg:w-[50vw]";

// Escala base do canvas no desktop. Vive aqui (não numa classe Tailwind
// scale-[...]) porque o framer-motion escreve `transform` direto no atributo
// style do elemento — isso sobrescreve por completo qualquer scale vindo de
// classe CSS (inline style sempre ganha de classe). Então o valor base tem
// que entrar nos próprios keyframes do `animate` abaixo, senão o "respirar"
// da flutuação reseta o scale para 1.
const BASE_SCALE = 1.85;

// Fade radial nas bordas do canvas — mata o limite quadrado que sobra mesmo
// com mix-blend-screen. Duas pegadinhas aqui:
//   1. "closest-side" mede a caixa CSS do elemento (50vw x 100vh), não a área
//      real ocupada pelo vídeo dentro dela — object-contain faz letterbox, então
//      o conteúdo visível é bem menor que a caixa.
//   2. mask-image é aplicado NO MESMO elemento que tem o scale: os raios em
//      vw/vh do gradiente são calculados no espaço local (pré-transform) e depois
//      AMPLIADOS pela mesma escala do elemento na tela — por isso os valores
//      abaixo já vêm proporcionais ao conteúdo (25vw ≈ metade da largura da
//      caixa pré-escala, 21vh ≈ 93% da metade da altura do conteúdo), não a um
//      scale fixo: a razão se mantém válida mesmo se o scale mudar (validado
//      pixel a pixel via screenshot, não só por cálculo).
const MASK_STYLE = {
  WebkitMaskImage:
    "radial-gradient(ellipse 25vw 21vh at center, black 45%, transparent 88%)",
  maskImage:
    "radial-gradient(ellipse 25vw 21vh at center, black 45%, transparent 88%)",
};

// ─── Componente ───────────────────────────────────────────────────────────────
//
//  O scroll do site vive dentro do scrollContainerRef do SiteShell (Lenis) —
//  não no window. Por isso o listener é adicionado nesse container, e por
//  isso a solução usa RAF customizado em vez de GSAP ScrollTrigger: GSAP
//  precisaria de um scrollerProxy manual pra rastrear esse container interno,
//  enquanto o listener nativo já resolve isso de graça. Sem dependência nova
//  também evita inflar ainda mais os chunks do bundle (Three.js já é grande).
//
//  Sem vídeo e sem loop no desktop (teste): o frame_001 é pintado uma única
//  vez assim que termina de carregar e fica parado (com um float/glow sutil
//  via framer-motion) até o usuário começar a rolar. A partir daí o scroll
//  assume o controle do índice do frame (lógica já existente).
//
//  Preload: as 151 imagens (~3MB no total) começam a baixar assim que o
//  componente monta, mas fora do caminho crítico de renderização — agendado
//  via requestIdleCallback (cai pra setTimeout em navegadores sem suporte,
//  ex. Safari) pra não competir com LCP/hero.
//
export default function ScrollSequenceCanvas({ endRef }) {
  const { scrollContainerRef } = useMenu();

  // Canvas só no desktop real (≥ 1024px)
  const isSmallRef = useRef(
    typeof window !== "undefined" && window.innerWidth < 1024,
  );
  const isSmall = isSmallRef.current;

  const [isScrolled, setIsScrolled] = useState(false);
  const [ready, setReady] = useState(false); // frame 1 carregado e pintado

  const innerRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const sizedRef = useRef(false);
  const rafRef = useRef(null);

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

  // ── Preload dos 151 frames — dispara no mount, fora do caminho crítico ────
  useEffect(() => {
    if (isSmall) return;
    let cancelled = false;

    const startPreload = () => {
      if (cancelled) return;
      const imgs = new Array(TOTAL_FRAMES);
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        img.decoding = "async";
        if (i === 0) {
          img.onload = () => {
            drawFrame(0);
            setReady(true);
          };
        }
        img.src = getUrl(i + 1);
        imgs[i] = img;
      }
      framesRef.current = imgs;
    };

    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    const cic = window.cancelIdleCallback || clearTimeout;
    const handle = ric(startPreload);

    return () => {
      cancelled = true;
      cic(handle);
    };
  }, [isSmall, drawFrame]);

  // ── Listener de scroll no container do SiteShell ──────────────────────────
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isSmall) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const nowScrolled = scrollTop > 0;

      setIsScrolled((prev) => (prev === nowScrolled ? prev : nowScrolled));

      if (!nowScrolled) return;

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
  // Mobile (isSmall): sem canvas — fundo sólido do SiteShell + vídeo leve.
  // Desktop: só o canvas, sempre visível — loop ping-pong parado, scroll
  // durante a rolagem. Fade-in único quando o frame 1 termina de carregar.
  //
  const canvasOpacity = ready ? "opacity-[1]" : "opacity-0";

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
          src="/bg-teste-ravenn.webp"
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
          src={VIDEO_SRC}
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
        src="/hero-raven-bg/hero-desktop.webp"
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
        {/* Frame único parado — float/glow sutil enquanto não rola, scroll assume o controle depois */}
        <motion.canvas
          ref={canvasRef}
          className={`${CANVAS_CLASSES} transition-opacity duration-300 ${canvasOpacity}`}
          style={{ display: "block", ...MASK_STYLE }}
          animate={
            !isScrolled && ready
              ? {
                  y: [0, -14, 0],
                  scale: [BASE_SCALE, BASE_SCALE * 1.015, BASE_SCALE],
                }
              : { y: 0, scale: BASE_SCALE }
          }
          transition={
            !isScrolled && ready
              ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.4, ease: "easeOut" }
          }
        />
      </div>
    </div>
  );
}
