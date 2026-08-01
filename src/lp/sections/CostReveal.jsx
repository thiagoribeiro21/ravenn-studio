import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrubWords from '../primitives/ScrubWords';
import { GX, TYPE, getScrollerEl, prefersReducedMotion } from '../config/_base';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 97;
const FRAME_PATH = (n) => `/lp-institucional/cost-sequence/frame_${String(n).padStart(3, '0')}.webp`;

/*
  Ato 3, refinamento v4 (item 5) — "Você paga pelo clique" reconstruído.
  Substitui ThreeTabs.jsx aqui. O brief pede a versão abstrata: "escolha a
  alternativa abstrata se não houver um número de CPL/desperdício real e
  defensável... número inventado numa página que vende confiança é o mesmo
  erro do '4 projetos por mês'" — não há esse número, então a cena é uma
  frase que se completa palavra a palavra sobre um fundo de partículas
  subindo e se dissipando (extraídas de public/video-frame-voce-paga-clique.mp4,
  97 frames WebP em public/lp-institucional/cost-sequence/), mais um traço
  de luz horizontal atravessando em sincronia com o scroll. Nenhum número,
  nenhum contador.

  Fundo é um único <canvas> desenhando o frame mais próximo do progresso do
  scroll — não 97 <img> na DOM. Carregamento em duas passadas (1 a cada 8
  frames primeiro, resto depois em segundo plano) só dispara quando a seção
  entra a ~300px do viewport via IntersectionObserver: 97 frames a ~9KB
  médio (876KB no total) é pesado demais pra baixar de uma vez sem gatilho.

  Mesmo cuidado de layout do antigo ThreeTabs.jsx (`waitForStableLayout`
  via rAF, comparando getBoundingClientRect().top entre frames) antes de
  criar o ScrollTrigger pinado — necessário porque esta seção vem depois de
  outra seção pinada (ScrubStatement) no mesmo commit, e o pin-spacer dela
  só existe depois que aquele useLayoutEffect roda.
*/
function useFrameLoader(sectionRef) {
  const framesRef = useRef([]);
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;
    let cancelled = false;
    const frames = framesRef.current;

    const loadFrame = (n) =>
      new Promise((resolve) => {
        if (frames[n]) return resolve();
        const img = new Image();
        img.onload = () => {
          frames[n] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = FRAME_PATH(n);
      });

    const loadAll = async () => {
      for (let n = 1; n <= FRAME_COUNT; n += 8) {
        if (cancelled) return;
        await loadFrame(n);
      }
      if (!cancelled) forceTick((t) => t + 1);
      for (let n = 1; n <= FRAME_COUNT; n++) {
        if (cancelled) return;
        await loadFrame(n);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadAll();
          io.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(sectionRef.current);

    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [sectionRef]);

  return framesRef;
}

function FrameCanvas({ sectionRef, progressRef }) {
  const canvasRef = useRef(null);
  const framesRef = useFrameLoader(sectionRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const frames = framesRef.current;
      const target = Math.min(FRAME_COUNT, Math.max(1, Math.round(progressRef.current * (FRAME_COUNT - 1)) + 1));
      let n = target;
      while (n > 1 && !frames[n]) n--;
      const img = frames[n];
      if (img && canvas.width && canvas.height) {
        const cw = canvas.width;
        const ch = canvas.height;
        const scale = Math.max(cw / img.width, ch / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      }
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [framesRef, progressRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full opacity-70"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

export default function CostReveal({ data }) {
  const sectionRef = useRef(null);
  const streakRef = useRef(null);
  const progressRef = useRef(0);
  const [bodyWords, setBodyWords] = useState(null);

  useLayoutEffect(() => {
    if (!bodyWords || !sectionRef.current) return;
    const reduce = prefersReducedMotion();

    if (reduce) {
      gsap.set(bodyWords, { opacity: 1, color: '#F8F9FA' });
      progressRef.current = 1;
      return;
    }

    let ctx;
    let rafId;
    let cancelled = false;
    let lastTop = null;
    let stableFrames = 0;
    let attempts = 0;

    const waitForStableLayout = () => {
      if (cancelled) return;
      const top = sectionRef.current.getBoundingClientRect().top;
      attempts++;
      if (top === lastTop) {
        stableFrames++;
      } else {
        stableFrames = 0;
        lastTop = top;
      }
      if (stableFrames >= 2 || attempts >= 90) {
        createTrigger();
        return;
      }
      rafId = requestAnimationFrame(waitForStableLayout);
    };

    const createTrigger = () => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            scroller: getScrollerEl(),
            start: 'top top',
            end: '+=180%',
            scrub: 0.6,
            pin: true,
            onUpdate: (self) => {
              progressRef.current = self.progress;
            },
          },
        });

        tl.to(streakRef.current, { xPercent: 220, duration: 1, ease: 'none' }, 0);
        bodyWords.forEach((w, i) => {
          tl.to(
            w,
            { opacity: 1, color: w.dataset.accent === '1' ? '#A78BFA' : '#F8F9FA', duration: 0.1, ease: 'none' },
            (i / bodyWords.length) * 0.8,
          );
        });
      }, sectionRef);
    };

    rafId = requestAnimationFrame(waitForStableLayout);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ctx?.revert();
    };
  }, [bodyWords]);

  return (
    <section id="consequencia" ref={sectionRef} className="relative h-screen overflow-hidden bg-rv-void">
      <FrameCanvas sectionRef={sectionRef} progressRef={progressRef} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(3,0,10,0.78), transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to top, #03000A, transparent 30%, transparent 70%, #03000A)' }}
      />

      <div
        ref={streakRef}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[-40%] w-[30%]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.35), transparent)', filter: 'blur(20px)' }}
      />

      <div className={`relative z-10 flex h-full flex-col items-center justify-center ${GX}`}>
        <ScrubWords
          lines={[data.punchline]}
          onWords={setBodyWords}
          className="mx-auto max-w-4xl text-center"
          lineClassName={`font-grotesk font-light leading-[1.2] ${TYPE.h1}`}
        />
      </div>
    </section>
  );
}
