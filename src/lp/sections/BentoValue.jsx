import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Aurora from '../primitives/Aurora';
import { EASE_LUXE, GX, TYPE, RADIUS, SHADOW, SECTION_PAD, prefersReducedMotion } from '../config/_base';

/* ── Mockups HTML — pequenos, só existem aqui, um por célula do bento ─────
   Item 6 do refinamento v4: os 4 mockups tocavam uma vez só (onViewportEnter)
   e ficavam parados no estado final — agora cada um reinicia seu próprio
   ciclo indefinidamente enquanto a célula está montada (loop contínuo, não
   "one-shot"). prefers-reduced-motion continua travando direto no estado
   final estático, sem o loop. */

function PageSpeedMockup({ play }) {
  const [value, setValue] = useState(0);
  const [chip, setChip] = useState(-1);
  useEffect(() => {
    if (!play) return;
    if (prefersReducedMotion()) { setValue(98); setChip(2); return; }
    let cancelled = false;
    let raf;
    const timers = [];
    const dur = 1400;
    const pauseAtEnd = 1600;

    const animateOnce = () => {
      setValue(0);
      setChip(-1);
      const start = performance.now();
      const tick = (ts) => {
        if (cancelled) return;
        const p = Math.min(1, (ts - start) / dur);
        setValue(Math.round(p * 98));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      timers.push(setTimeout(() => setChip(0), 500));
      timers.push(setTimeout(() => setChip(1), 900));
      timers.push(setTimeout(() => setChip(2), 1300));
      timers.push(setTimeout(animateOnce, dur + pauseAtEnd));
    };
    animateOnce();

    return () => { cancelled = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
  }, [play]);

  const pct = value / 100;
  const r = 34;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-5">
      <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0 -rotate-90">
        <circle cx="44" cy="44" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
        <circle
          cx="44" cy="44" r={r} stroke="#A78BFA" strokeWidth="6" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
        <text x="44" y="44" transform="rotate(90 44 44)" textAnchor="middle" dominantBaseline="central" fill="#F8F9FA" fontSize="22" fontFamily="ClashGrotesk-Variable, sans-serif" fontWeight="300">
          {value}
        </text>
      </svg>
      {/* micro-UI fac-símile (chips de métrica) — exceção documentada à
          Regra 1: forçar 15px aqui quebraria a leitura de "captura pequena". */}
      <div className="flex flex-col gap-1.5">
        {['LCP', 'CLS', 'INP'].map((label, i) => (
          <span
            key={label}
            className="rounded-full border px-2.5 py-1 font-satoshi text-[10px] font-medium uppercase tracking-widest2 transition-all duration-300"
            style={{
              opacity: chip >= i ? 1 : 0.15,
              borderColor: chip >= i ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)',
              color: chip >= i ? '#A78BFA' : '#5B6472',
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function WireframeMockup({ play }) {
  return (
    <div className="relative w-full max-w-[15rem] rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="h-2 w-1/3 rounded bg-white/10" />
      <div className="mt-3 h-8 rounded bg-white/[0.04]" />
      <div className="mt-2 h-8 rounded bg-white/[0.04]" />
      <div className="mt-3 flex justify-end">
        <div className="h-4 w-16 rounded-full bg-rv-purple/40" />
      </div>
      {play && (
        <motion.span
          aria-hidden
          className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-rv-purple-400 shadow-[0_0_12px_2px_rgba(167,139,250,0.8)]"
          initial={{ top: '6%', opacity: 0 }}
          animate={prefersReducedMotion() ? { top: '88%', opacity: 1 } : { top: ['6%', '88%'], opacity: [0, 1, 1, 0] }}
          transition={prefersReducedMotion() ? {} : { duration: 2.6, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}

function AuthorityMockup({ play }) {
  const [stars, setStars] = useState(0);
  useEffect(() => {
    if (!play) return;
    if (prefersReducedMotion()) { setStars(5); return; }
    let cancelled = false;
    const timers = [];
    const fillOnce = () => {
      setStars(0);
      for (let i = 0; i < 5; i++) {
        timers.push(setTimeout(() => { if (!cancelled) setStars(i + 1); }, 250 + i * 180));
      }
      timers.push(setTimeout(fillOnce, 250 + 4 * 180 + 1800));
    };
    fillOnce();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [play]);

  return (
    <div className="w-full max-w-[15rem] rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-sm" style={{ color: i < stars ? '#A78BFA' : 'rgba(255,255,255,0.15)' }}>★</span>
        ))}
      </div>
      <p className="mt-2 font-satoshi text-xs leading-relaxed text-rv-slate">
        "Site rápido e transmite muita confiança logo na primeira visita."
      </p>
      <p className="mt-1.5 font-satoshi text-[10px] uppercase tracking-widest2 text-rv-faint">Avaliação ilustrativa</p>
    </div>
  );
}

function WhatsappMockup({ play }) {
  const [stage, setStage] = useState(0); // 0 nada, 1 pergunta, 2 digitando, 3 resposta
  useEffect(() => {
    if (!play) return;
    if (prefersReducedMotion()) { setStage(3); return; }
    const timers = [];
    const runOnce = () => {
      setStage(0);
      timers.push(setTimeout(() => setStage(1), 200));
      timers.push(setTimeout(() => setStage(2), 1000));
      timers.push(setTimeout(() => setStage(3), 2400));
      timers.push(setTimeout(runOnce, 2400 + 1800));
    };
    runOnce();
    return () => timers.forEach(clearTimeout);
  }, [play]);

  return (
    <div className="w-full max-w-[15rem] space-y-2">
      {stage >= 1 && (
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-white/10 px-3 py-2 font-satoshi text-xs text-rv-titanium">
          Oi, vocês fazem site pra clínica?
        </div>
      )}
      {stage === 2 && (
        <div className="w-fit rounded-2xl rounded-tl-sm bg-[#25D366]/15 px-3 py-2 font-satoshi text-xs text-[#25D366]">
          digitando…
        </div>
      )}
      {stage >= 3 && (
        <div className="flex items-end gap-2">
          <div className="w-fit rounded-2xl rounded-tl-sm bg-[#25D366]/20 px-3 py-2 font-satoshi text-xs text-rv-titanium">
            Fazemos sim! Posso te mostrar alguns conceitos agora mesmo.
          </div>
          <span className="shrink-0 rounded-full border border-white/15 px-1.5 py-0.5 font-satoshi text-[9px] text-rv-faint">02:47</span>
        </div>
      )}
    </div>
  );
}

const MOCKUPS = { pagespeed: PageSpeedMockup, wireframe: WireframeMockup, authority: AuthorityMockup, whatsapp: WhatsappMockup };

/* ícone pequeno em quadrado arredondado lilás claro — abstrato, não de UI */
const ICON_PATHS = {
  pagespeed: <path d="M4 15a8 8 0 0 1 16 0M12 15V9M9 12l3-3 3 3" />,
  wireframe: <path d="M4 5h16v4H4zM4 12h9v7H4zM16 12h4v7h-4z" />,
  authority: <path d="M12 4l2.2 5.6 6 .5-4.6 3.9 1.4 5.9L12 16.8 6.9 19.9l1.4-5.9L3.8 10l6-.5z" />,
  whatsapp: <path d="M7 10h10M7 14h6M4 20l1.6-4.2A8 8 0 1 1 9 19.5z" />,
};
function CellIcon({ name }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-[10px]" style={{ background: 'rgba(167,139,250,.12)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        {ICON_PATHS[name]}
      </svg>
    </span>
  );
}

function BentoCell({ cell, delay, isLastMobile, isLastRowDesktop, borderRight }) {
  const ref = useRef(null);
  const [play, setPlay] = useState(false);
  const Mockup = MOCKUPS[cell.mockup];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      onViewportEnter={() => setPlay(true)}
      transition={{ duration: 0.8, delay, ease: EASE_LUXE }}
      className={`flex flex-col gap-8 p-8 md:p-12 ${isLastMobile ? '' : 'border-b border-white/[0.08]'} ${isLastRowDesktop ? 'md:border-b-0' : 'md:border-b'} ${borderRight ? 'md:border-r md:border-white/[0.08]' : ''}`}
    >
      {/* mockup flutuante — sombra difusa, sem caixa/borda ao redor */}
      <div className="relative flex min-h-[9rem] items-center justify-center py-4">
        <div
          className="flex items-center justify-center bg-rv-surface-2 p-6"
          style={{ borderRadius: RADIUS.md, boxShadow: SHADOW.deep }}
        >
          <Mockup play={play} />
        </div>
        {cell.pill && (
          <span
            className={`absolute right-2 top-0 rounded-full border border-white/15 px-3 py-1.5 font-satoshi font-medium text-rv-titanium ${TYPE.statLabel}`}
            style={{ background: 'rgba(13,10,24,.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            {cell.pill}
          </span>
        )}
      </div>

      <div>
        <CellIcon name={cell.mockup} />
        <h3 className="mt-4 font-grotesk text-xl font-medium text-rv-titanium md:text-2xl">{cell.title}</h3>
        <p className={`mt-2 max-w-xs font-satoshi text-rv-slate ${TYPE.cardDesc}`}>{cell.body}</p>
      </div>
    </motion.div>
  );
}

/* item 6 — mistura de SVG/gradiente no fundo da seção, sutil o bastante pra
   não competir com os mockups: aurora violeta suave + um hairline moiré
   diagonal (mesmo vocabulário visual do CornerMoire em ScrubStatement.jsx). */
function BentoBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
      <Aurora variant="subtle" />
      <div
        className="absolute -right-[10vw] -top-[10vw] h-[40vw] w-[40vw] opacity-30"
        style={{
          backgroundImage: 'repeating-linear-gradient(115deg, rgba(124,58,237,0.3) 0px, rgba(124,58,237,0.3) 1px, transparent 1px, transparent 16px)',
          filter: 'blur(14px)',
          maskImage: 'radial-gradient(closest-side, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(closest-side, black, transparent 70%)',
        }}
      />
    </div>
  );
}

export default function BentoValue({ data }) {
  return (
    <section id="bento" className={`relative overflow-hidden border-t border-white/[0.06] ${SECTION_PAD} ${GX}`}>
      <BentoBackdrop />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: EASE_LUXE }}
        className="relative z-10 mb-14 max-w-2xl"
      >
        <p className={`flex items-center gap-3 font-satoshi font-medium uppercase tracking-widest2 text-rv-slate ${TYPE.eyebrow}`}>
          <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
          O que você recebe
        </p>
        <h2 className={`mt-6 font-grotesk font-light leading-[1.1] tracking-[-0.015em] text-rv-titanium ${TYPE.h2}`}>
          Não é só um site bonito.
        </h2>
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 border-t border-white/[0.08] md:grid-cols-2">
        {data.cells.map((cell, i) => (
          <BentoCell
            key={cell.key}
            cell={cell}
            delay={i * 0.1}
            borderRight={i % 2 === 0}
            isLastMobile={i === data.cells.length - 1}
            isLastRowDesktop={i >= data.cells.length - 2}
          />
        ))}
      </div>
    </section>
  );
}
