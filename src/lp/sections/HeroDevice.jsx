import { motion } from 'framer-motion';
import Aurora from '../primitives/Aurora';
import ParticleField from '../primitives/ParticleField';
import { EASE_LUXE, GX, TYPE, RADIUS, prefersReducedMotion } from '../config/_base';

function Fade({ children, delay = 0, y = 24, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: EASE_LUXE }}
    >
      {children}
    </motion.div>
  );
}

function Headline({ lines }) {
  return (
    <h1 className={`font-grotesk font-light leading-[1.05] tracking-[-0.02em] text-rv-titanium ${TYPE.h1}`}>
      {lines.map((line, i) => {
        const accent = line.startsWith('_') && line.endsWith('_');
        const clean = accent ? line.slice(1, -1) : line;
        return (
          <span key={i} className={`block ${accent ? 'text-rv-purple-400' : ''}`}>
            {clean}
          </span>
        );
      })}
    </h1>
  );
}

/*
  Float contínuo e sutil no device do hero — só translateY em loop, sem
  opacity/scale de entrada. Diferente do `Fade`, não atrasa o primeiro
  paint: como não há `initial`, o `animate` começa direto do keyframe 0
  (y:0), idêntico à posição estática, então o LCP-scanner/paint não é
  empurrado (mesma razão pela qual o Fade foi removido daqui na rodada
  anterior). `prefers-reduced-motion` congela no y:0 estático.
*/
function FloatWrap({ children, className }) {
  const reduce = prefersReducedMotion();
  return (
    <motion.div
      className={className}
      animate={reduce ? {} : { y: [0, -16, 0] }}
      transition={reduce ? {} : { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

/*
  Item 1 do refinamento v4 — mockups fotorrealistas prontos (transparentes
  de verdade). srcset troca a versão mobile pela desktop.
*/
function DeviceShot() {
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet="/lp-institucional/hero-device.webp" />
      <img
        src="/lp-institucional/hero-device-mobile.webp"
        alt=""
        aria-hidden
        fetchpriority="high"
        width={1426}
        height={1201}
        className="mx-auto w-full max-w-[440px] md:max-w-[820px]"
        style={{ filter: 'drop-shadow(0 60px 120px rgba(0,0,0,0.7))' }}
      />
    </picture>
  );
}

export default function HeroDevice({ data }) {
  return (
    <section id="hero" className={`relative flex min-h-[100dvh] flex-col overflow-hidden pt-32 pb-10 ${GX}`}>
      <Aurora variant="hero" />
      <ParticleField className="pointer-events-none absolute inset-0 z-0" scale={1.3} opacity={0.4} offsetY={-40} />

      {/* item 1 — hero em coluna centralizada, não lado a lado com o device */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
        <Fade y={16}>
          <p className={`flex items-center justify-center gap-3 font-satoshi font-medium uppercase tracking-widest2 text-rv-faint ${TYPE.eyebrow}`}>
            <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
            {data.eyebrow}
            <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
          </p>
        </Fade>

        <Fade delay={0.1} className="mt-6">
          <Headline lines={data.headlineLines} />
        </Fade>

        <Fade delay={0.3} className="mx-auto mt-7 max-w-xl">
          <p className={`font-satoshi text-rv-slate ${TYPE.body}`}>{data.subheadline}</p>
        </Fade>

        <Fade delay={0.45} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={data.ctaPrimary.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full bg-rv-purple px-7 py-3.5 font-satoshi font-medium tracking-wide text-white shadow-[0_0_40px_rgba(124,58,237,0.35)] transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(124,58,237,0.55)] ${TYPE.button}`}
          >
            {data.ctaPrimary.label}
          </a>
          <a
            href={data.ctaSecondary.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full border border-white/20 px-7 py-3.5 font-satoshi font-medium tracking-wide text-rv-titanium transition-colors duration-300 hover:border-rv-purple/60 ${TYPE.button}`}
          >
            {data.ctaSecondary.label}
          </a>
        </Fade>
      </div>

      {/* device grande, abaixo, centralizado — nunca ao lado do texto.
          Sem Fade aqui: é o elemento de LCP da página (maior bloco visível
          no viewport inicial) — atrasar sua opacidade com fade-in empurra
          o LCP medido pra ~1.3s depois do necessário (delay 0.4s + duration
          0.9s do Fade), mesmo a imagem já estando carregada e pronta. Some
          elementos acima dele (headline, CTAs) continuam animando; este
          pinta imediatamente — só ganha o float contínuo do FloatWrap
          (transform puro, não atrasa paint). */}
      <FloatWrap className="relative z-10 mt-6 flex justify-center">
        <DeviceShot />
      </FloatWrap>

      <Fade
        delay={0.7}
        className="relative z-10 mx-auto mt-10 flex w-full max-w-6xl flex-col items-stretch justify-between gap-6 border-t border-white/[0.06] pt-6 md:flex-row md:items-end"
      >
        <div className="flex flex-wrap justify-center gap-8 md:justify-start">
          {data.stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className={`font-grotesk font-light text-rv-titanium ${TYPE.statNum}`}>{s.big}</p>
              {/* item 3 — piso explícito de 16px pros labels de stat, prova social precisa ser lida */}
              <p className="mt-1 max-w-[11rem] font-satoshi text-[15px] leading-[1.5] text-rv-slate md:text-[16px]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* item 2 — badge refeito: texto à esquerda, botão coeso à direita */}
        <div
          className="mx-auto flex w-full max-w-md items-center justify-between gap-5 p-5 md:mx-0"
          style={{
            borderRadius: RADIUS.md,
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(13,10,24,0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="text-left">
            <p className="font-grotesk text-lg font-light text-rv-titanium">{data.scarcity.line1}</p>
            <p className={`mt-0.5 font-satoshi text-rv-slate ${TYPE.cardDesc}`}>{data.scarcity.line2}</p>
          </div>
          <a
            href={data.scarcity.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-center gap-2 rounded-full px-5 py-3 font-satoshi text-[14px] font-medium text-white transition-shadow duration-300"
            style={{ background: '#25D366', boxShadow: '0 0 24px rgba(37,211,102,0.3)' }}
          >
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {data.scarcity.cta.label}
          </a>
        </div>
      </Fade>
    </section>
  );
}
