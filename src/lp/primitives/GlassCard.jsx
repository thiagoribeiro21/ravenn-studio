import { motion, AnimatePresence } from 'framer-motion';
import { EASE_LUXE, TYPE, RADIUS, SHADOW } from '../config/_base';

/*
  Card de vidro navegável — glassmorphism com contador `// 0N · 0T`,
  glifo de círculos concêntricos em line-art e duas setas circulares
  (anterior/próximo). Reusado pelo ConsequenceCarousel nos Atos 3 e 7.
*/
function ConcentricGlyph() {
  return (
    <svg aria-hidden width="56" height="56" viewBox="0 0 56 56" fill="none" className="opacity-40">
      <circle cx="28" cy="28" r="26" stroke="#A78BFA" strokeWidth="1" />
      <circle cx="28" cy="28" r="17" stroke="#A78BFA" strokeWidth="1" />
      <circle cx="28" cy="28" r="8" stroke="#7C3AED" strokeWidth="1.4" />
    </svg>
  );
}

export default function GlassCard({ index, total, title, body, tag, onPrev, onNext, progress }) {
  return (
    <div
      className="relative w-full max-w-xl overflow-hidden border border-white/10 p-8 md:p-10"
      style={{ borderRadius: RADIUS.lg, background: 'rgba(255,255,255,0.035)', backdropFilter: 'blur(24px) saturate(1.3)', WebkitBackdropFilter: 'blur(24px) saturate(1.3)', boxShadow: SHADOW.soft }}
    >
      <div className="flex items-center justify-between">
        <span className={`font-satoshi font-medium uppercase tracking-widest2 text-rv-faint ${TYPE.eyebrow}`}>
          // {String(index + 1).padStart(2, '0')} · {String(total).padStart(2, '0')}
        </span>
        <ConcentricGlyph />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.5, ease: EASE_LUXE }}
          className="mt-6 min-h-[9rem]"
        >
          {tag && (
            <span className={`mb-3 inline-block font-satoshi font-medium uppercase tracking-widest2 text-rv-purple-400 ${TYPE.eyebrow}`}>
              {tag}
            </span>
          )}
          <h3 className="font-grotesk text-2xl font-light leading-[1.18] text-rv-titanium md:text-3xl">{title}</h3>
          <p className={`mt-4 font-satoshi leading-relaxed text-rv-slate ${TYPE.body}`}>{body}</p>
        </motion.div>
      </AnimatePresence>

      {/* item 9 do refinamento v4 — barra de progresso do auto-avanço,
          zerada a cada troca de card (manual ou automática). */}
      {progress !== undefined && (
        <div className="mt-8 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-rv-purple-400"
            style={{ width: `${progress}%`, transition: progress === 0 ? 'none' : 'width 100ms linear' }}
          />
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-rv-titanium transition-colors duration-300 hover:border-rv-purple/60 hover:text-rv-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rv-purple/60"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Próximo"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-rv-titanium transition-colors duration-300 hover:border-rv-purple/60 hover:text-rv-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rv-purple/60"
        >
          →
        </button>
      </div>
    </div>
  );
}
