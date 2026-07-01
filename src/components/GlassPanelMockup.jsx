import { useRef, useEffect, useCallback } from 'react';

// ── Freeze Frame com Delay ───────────────────────────────────────────────────
// Substitui o loop nativo do <video> (que corta seco de volta pro frame 0)
// por um ciclo manual: termina → segura FREEZE_MS parado → funde pra fora →
// reseta currentTime → funde de volta tocando do zero. FADE_MS é a duração
// da transição de opacidade (CSS), FREEZE_MS é quanto tempo o último frame
// fica parado na tela antes de começar o fade-out.
const FREEZE_MS = 5000;
const FADE_MS   = 900;

export default function GlassPanelMockup({ src, poster }) {
  const containerRef    = useRef(null);
  const cardRef         = useRef(null);
  const videoRef        = useRef(null);
  const startedRef      = useRef(false);
  const freezeTimerRef  = useRef(null);
  const fadeTimerRef    = useRef(null);

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

  const clearCycleTimers = useCallback(() => {
    if (freezeTimerRef.current) { clearTimeout(freezeTimerRef.current); freezeTimerRef.current = null; }
    if (fadeTimerRef.current)   { clearTimeout(fadeTimerRef.current);   fadeTimerRef.current   = null; }
  }, []);

  // ── Ciclo freeze → fade-out → reset → fade-in ──────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      clearCycleTimers();
      freezeTimerRef.current = setTimeout(() => {
        video.style.opacity = '0';
        fadeTimerRef.current = setTimeout(() => {
          video.currentTime = 0;
          video.play().catch(() => {});
          video.style.opacity = '1';
        }, FADE_MS);
      }, FREEZE_MS);
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
      clearCycleTimers();
    };
  }, [clearCycleTimers]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!startedRef.current) {
            video.src = src;
            video.load();
            startedRef.current = true;
          }
          // Garante estado limpo ao (re)entrar na viewport — se o vídeo saiu
          // de tela no meio do freeze/fade, sem isso ele voltaria pausado
          // e/ou com opacity:0 (invisível) até o próximo ciclo completar.
          clearCycleTimers();
          video.style.opacity = '1';
          video.play().catch(() => {});
        } else if (startedRef.current) {
          video.pause();
          clearCycleTimers();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src, clearCycleTimers]);

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
        <div style={{
          position:     'relative',
          borderRadius: 19,
          overflow:     'hidden',
          background:   '#050109',
          aspectRatio:  '16 / 10',
        }}>
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
              transition: `opacity ${FADE_MS}ms ease`,
            }}
          >
            <track kind="captions" />
          </video>

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
