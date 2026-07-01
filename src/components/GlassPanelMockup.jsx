import { useRef, useEffect, useState, useCallback } from 'react';

// Resolução de referência dos mockups de site (design fluido em vw/vh) — o
// iframe sempre renderiza nesse tamanho fixo e é só ENCOLHIDO visualmente via
// transform: scale(). Isso evita que o layout quebre em telas pequenas (os
// clamp() de fonte do HTML original têm um piso em px pensado pra 1920×1080;
// se o iframe fosse redimensionado de verdade, o texto bateria nesse piso e
// ficaria desproporcional/cortado no card pequeno).
const SITE_REF_WIDTH  = 1920;
const SITE_REF_HEIGHT = 1080;

export default function GlassPanelMockup({
  // Modo vídeo (screen-recording)
  src,
  poster,
  playing = true,
  cycleKey = 0,
  onDuration,
  // Modo site (hero real do cliente, isolado num iframe local)
  siteSrc,
  siteAspect = '16 / 9',
  // Comum aos dois modos
  opacity = 1,
  fadeMs = 900,
}) {
  const containerRef = useRef(null);
  const cardRef       = useRef(null);
  const videoRef      = useRef(null);
  const previewRef    = useRef(null);
  const startedRef    = useRef(false);
  const [inView, setInView] = useState(false);
  const [siteStarted, setSiteStarted] = useState(false);
  const [scale, setScale]   = useState(0);
  const [siteLoaded, setSiteLoaded] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width)  * 2 - 1;
    const y = ((e.clientY - r.top)  / r.height) * 2 - 1;
    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 80ms linear';
      card.style.transform  = `perspective(1200px) rotateY(${x * 8}deg) rotateX(${y * -6}deg) translateY(-6px)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform  = '';
    }
  }, []);

  // ── Modo vídeo ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || siteSrc) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && !startedRef.current) {
          video.src = src;
          video.load();
          startedRef.current = true;
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src, siteSrc]);

  // Reinício sincronizado — todos os vídeos do grupo voltam pro frame 0 juntos.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || siteSrc || !startedRef.current) return;
    video.currentTime = 0;
  }, [cycleKey, siteSrc]);

  // Play/pause: só toca quando o ciclo global manda tocar E o card está em tela.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || siteSrc || !startedRef.current) return;
    if (playing && inView) video.play().catch(() => {});
    else video.pause();
  }, [playing, inView, siteSrc]);

  // Reporta a duração pro relógio compartilhado (só o vídeo "mestre" passa `onDuration`).
  useEffect(() => {
    const video = videoRef.current;
    if (!video || siteSrc || !onDuration) return;
    const report = () => { if (video.duration) onDuration(video.duration); };
    video.addEventListener('loadedmetadata', report);
    return () => video.removeEventListener('loadedmetadata', report);
  }, [onDuration, siteSrc]);

  // ── Modo site ────────────────────────────────────────────────────────────────
  // Carrega o iframe (lazy) só na primeira vez que o card entra na viewport, e
  // recalcula a escala sempre que o card muda de tamanho (resize, breakpoint).
  useEffect(() => {
    const el = previewRef.current;
    if (!el || !siteSrc) return;

    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / SITE_REF_WIDTH);
    });
    ro.observe(el);

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setSiteStarted(true); },
      { threshold: 0.15 },
    );
    io.observe(el);

    return () => { ro.disconnect(); io.disconnect(); };
  }, [siteSrc]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }}
    >
      {/* Glow ambiente */}
      <div aria-hidden style={{
        position:      'absolute',
        inset:         '-14%',
        background:    'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(124,58,237,0.30) 0%, transparent 70%)',
        filter:        'blur(44px)',
        pointerEvents: 'none',
        zIndex:        0,
      }} />

      {/* Painel de vidro — borda em gradiente simulando espessura */}
      <div
        ref={cardRef}
        style={{
          position:       'relative',
          zIndex:         1,
          transformStyle: 'preserve-3d',
          borderRadius:   20,
          padding:        1,
          background:     'linear-gradient(160deg, rgba(255,255,255,0.18), rgba(124,58,237,0.14) 45%, rgba(255,255,255,0.03))',
          boxShadow: [
            '0 44px 110px -26px rgba(0,0,0,0.78)',
            '0 0 0 1px rgba(0,0,0,0.35)',
          ].join(', '),
        }}
      >
        <div
          ref={previewRef}
          style={{
            position:     'relative',
            borderRadius: 19,
            overflow:     'hidden',
            background:   '#050109',
            aspectRatio:  siteSrc ? siteAspect : '16 / 10',
          }}
        >
          {siteSrc ? (
            <iframe
              key={cycleKey}
              title="Prévia do site"
              src={siteStarted ? siteSrc : undefined}
              onLoad={() => setSiteLoaded(true)}
              style={{
                position:        'absolute',
                top:             0,
                left:            0,
                width:           SITE_REF_WIDTH,
                height:          SITE_REF_HEIGHT,
                border:          'none',
                transformOrigin: 'top left',
                transform:       `scale(${scale || 0.001})`,
                opacity:         siteLoaded ? opacity : 0,
                transition:      `opacity ${fadeMs}ms ease`,
                background:      '#000',
                pointerEvents:   'none',
              }}
            />
          ) : (
            <video
              ref={videoRef}
              poster={poster}
              muted
              playsInline
              preload="none"
              style={{
                display:    'block',
                width:      '100%',
                height:     '100%',
                objectFit:  'cover',
                background: '#000',
                opacity,
                transition: `opacity ${fadeMs}ms ease`,
              }}
            >
              <track kind="captions" />
            </video>
          )}

          {/* Sheen diagonal sutil */}
          <div aria-hidden style={{
            position:      'absolute',
            inset:         0,
            background:    'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, transparent 38%)',
            pointerEvents: 'none',
          }} />

          {/* Vinheta interna — profundidade */}
          <div aria-hidden style={{
            position:      'absolute',
            inset:         0,
            boxShadow:     'inset 0 0 70px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Linha de luz no topo do vidro */}
        <div aria-hidden style={{
          position:     'absolute',
          top:          0,
          left:         '14%',
          right:        '14%',
          height:       1,
          background:   'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
          borderRadius: 1,
        }} />
      </div>
    </div>
  );
}
