import { useRef, useEffect, useCallback } from 'react';

export default function LaptopMockup({ src, poster }) {
  const containerRef = useRef(null);
  const cardRef      = useRef(null);
  const videoRef     = useRef(null);
  const startedRef   = useRef(false);

  const handleMouseMove = useCallback((e) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width)  * 2 - 1;
    const y = ((e.clientY - r.top)  / r.height) * 2 - 1;
    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 80ms linear';
      card.style.transform  = `perspective(1100px) rotateY(${x * 14}deg) rotateX(${y * -9}deg) translateY(-10px)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform  = '';
    }
  }, []);

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
          video.play().catch(() => {});
        } else if (startedRef.current) {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={cardRef} style={{ transformStyle: 'preserve-3d' }}>

        {/* ── Chassi / Tampa (screen) ─────────────────────────────────── */}
        <div
          style={{
            background:   'linear-gradient(160deg, #2e2e30 0%, #1e1e20 55%, #141416 100%)',
            borderRadius: '14px 14px 4px 4px',
            padding:      '10px 10px 0',
            border:       '1px solid rgba(255,255,255,0.11)',
            position:     'relative',
            boxShadow: [
              'inset 0 1px 0 rgba(255,255,255,0.08)',
              'inset 0 -1px 0 rgba(0,0,0,0.7)',
              '0 50px 100px -20px rgba(0,0,0,0.85)',
              '0 0 60px -8px rgba(124,58,237,0.22)',
              '0 0 0 0.5px rgba(0,0,0,0.9)',
            ].join(', '),
          }}
        >
          {/* Highlight metálico */}
          <div aria-hidden style={{
            position:     'absolute',
            top:          0,
            left:         '12%',
            right:        '12%',
            height:       1,
            background:   'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
            borderRadius: 1,
          }} />

          {/* Câmera */}
          <div aria-hidden style={{
            width:        7,
            height:       7,
            borderRadius: '50%',
            background:   'radial-gradient(circle at 38% 32%, #3a3a3d, #0f0f11)',
            border:       '1px solid rgba(255,255,255,0.06)',
            boxShadow:    'inset 0 1px 2px rgba(0,0,0,0.95), 0 0 0 1.5px rgba(0,0,0,0.5)',
            margin:       '2px auto 8px',
          }} />

          {/* Tela 16:9 */}
          <div style={{
            borderRadius: '6px 6px 0 0',
            overflow:     'hidden',
            background:   '#000',
            aspectRatio:  '16 / 9',
            position:     'relative',
          }}>
            <video
              ref={videoRef}
              poster={poster}
              loop
              muted
              playsInline
              preload="none"
              style={{
                display:    'block',
                width:      '100%',
                height:     '100%',
                objectFit:  'contain',
                background: '#000',
              }}
            >
              <track kind="captions" />
            </video>
            <div aria-hidden style={{
              position:      'absolute',
              inset:         0,
              background:    'linear-gradient(140deg, rgba(255,255,255,0.055) 0%, transparent 42%)',
              pointerEvents: 'none',
            }} />
          </div>
        </div>

        {/* ── Dobradiça ──────────────────────────────────────────────── */}
        <div aria-hidden style={{
          height:     3,
          background: 'linear-gradient(90deg, #080808 0%, #2a2a2c 40%, #1a1a1c 60%, #080808 100%)',
          margin:     '0 6px',
        }} />

        {/* ── Base (teclado) ─────────────────────────────────────────── */}
        <div style={{
          background:   'linear-gradient(180deg, #232326 0%, #17171a 100%)',
          borderRadius: '0 0 12px 12px',
          height:       32,
          border:       '1px solid rgba(255,255,255,0.07)',
          borderTop:    'none',
          position:     'relative',
          overflow:     'hidden',
        }}>
          <div aria-hidden style={{
            position:     'absolute',
            top:          4,
            left:         '8%',
            right:        '8%',
            height:       10,
            background:   'rgba(0,0,0,0.28)',
            borderRadius: 2,
          }} />
          <div aria-hidden style={{
            position:     'absolute',
            bottom:       5,
            left:         '50%',
            transform:    'translateX(-50%)',
            width:        '22%',
            height:       11,
            background:   'rgba(255,255,255,0.025)',
            border:       '1px solid rgba(255,255,255,0.055)',
            borderRadius: 4,
          }} />
        </div>

        {/* ── Reflexo de mesa ────────────────────────────────────────── */}
        <div aria-hidden style={{
          height:     16,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.045), transparent)',
          transform:  'scaleY(-1)',
          opacity:    0.22,
          filter:     'blur(4px)',
        }} />

      </div>
    </div>
  );
}
