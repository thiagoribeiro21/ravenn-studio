import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue } from 'framer-motion';
import gsap from 'gsap';
import { EASE_LUXE, GX, SECTION_PAD, TYPE, prefersReducedMotion } from '../config/_base';

/* ══════════════════════════════════════════════════════════════════════════
   Ato 5 — v7. Redesign focado em DEMONSTRAR o portfólio.

   ── O bug de enquadramento que motivou a mudança de layout ─────────────────
   Os três vídeos são gravações de tela de sites inteiros — 16:9, cada um com
   sua própria navbar, logo e headline embutidos no vídeo (conferido abrindo
   os posters: "Lumini Estética" com nav A Clínica/Tratamentos/Ciência, e
   "AURUM & TORRES" com nav PRÁTICA/RESULTADOS/PUBLICAÇÕES).

   A v6 colocava esse 16:9 numa coluna de ~7/12 de largura por `86dvh` de
   altura — uma caixa de proporção ~1.1:1 — com `object-cover`. Cobrir
   1.1:1 com material 1.78:1 corta cerca de 40% da LARGURA: sumia justamente
   o logo (canto esquerdo) e o CTA/nav (canto direito), que são exatamente as
   partes que provam "isto é um site de verdade que nós desenhamos". A seção
   inteira existe pra demonstrar portfólio e o enquadramento estava jogando
   fora a prova.

   Por isso o layout deixou de ser duas colunas lado a lado e virou empilhado:
   cabeçalho, showcase 16:9 em largura quase total, controles embaixo. Com
   `aspect-[16/9]` o vídeo aparece INTEIRO, sem corte nenhum, e ainda ganha
   muito mais presença física na tela do que tinha espremido em 7/12.

   ── Moldura de janela, sem URL ────────────────────────────────────────────
   A moldura (três pontos + rótulo) faz o vídeo ler como "um site", não como
   um vídeo institucional qualquer. Deliberadamente SEM barra de endereço com
   domínio: o próprio config diz que estes são conceitos autorais, não
   clientes ("Não são clientes — são o padrão exato de design e conversão que
   aplicamos"). Inventar um domínio faria parecer um site no ar de um cliente
   real — seria vender como caso o que é conceito. O rótulo mostra o nicho.

   ── Autoplay com barra de progresso ───────────────────────────────────────
   Mesmo motor de `TargetAudienceCarousel.jsx`: um rAF só (não `setInterval`
   por slide), o que dá pausa/retomada de verdade — passar o mouse pausa (a
   pessoa está lendo, não faz sentido puxar o conteúdo dela) e continua de
   onde parou em vez de reiniciar.
   ══════════════════════════════════════════════════════════════════════════ */

const AUTOPLAY_MS = 7000;
/* Curva deliberadamente mais lenta e "gorda no fim" que EASE_LUXE (a curva
   padrão da marca, calibrada pra UI que responde rápido) — aqui o pedido é
   cinematográfico: quase toda a aceleração no início, cauda longa. */
const MEDIA_EASE = [0.16, 1, 0.2, 1];
const MEDIA_DURATION = 0.9;

/* ── Showcase: a janela e o vídeo dentro dela ────────────────────────────── */
function ShowcaseMedia({ item, reduce, inView }) {
  const videoRef = useRef(null);
  const clipRef = useRef(null);

  /* Pausa quando a seção sai da viewport (bateria/CPU) — mas o START de cada
     vídeo vem do atributo `autoPlay`, não daqui. Motivo: este efeito depende
     só de `inView`; a cada troca de conceito o `<video>` é um nó NOVO (a
     `key` do AnimatePresence remonta), e trocar de conceito sem sair da
     viewport não muda `inView` — o efeito não rodaria de novo pra dar
     `.play()` no vídeo recém-montado, e ele ficaria congelado no poster.
     `autoPlay` (válido porque `muted` está presente) cobre esse caso. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;
    if (inView) v.play().catch(() => {});
    else v.pause();
    return () => v.pause();
  }, [inView]);

  /* Abertura cinematográfica — mesmo padrão usado no hero real em
     public/portfolio-heroes/pele.html: wipe vertical via clip-path +
     zoom-out do próprio vídeo, disparado uma vez a cada troca de conceito
     (o nó é remontado via `key` no AnimatePresence do ShowcaseFrame). Depois
     que a timeline termina, é só o `loop` nativo do <video> que assume —
     nenhum JS controla o ciclo daí em diante, dá a sensação de "site de
     verdade rodando", igual à home. */
  useEffect(() => {
    if (reduce) return undefined;
    const clip = clipRef.current;
    const video = videoRef.current;
    if (!clip || !video) return undefined;

    gsap.set(clip, { clipPath: 'inset(50% 0% 50% 0%)' });
    gsap.set(video, { scale: 1.15 });
    const tl = gsap.timeline();
    tl.to(clip, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power4.inOut' }, 0);
    tl.to(video, { scale: 1, duration: 2, ease: 'power4.out' }, 0);

    return () => tl.kill();
  }, [reduce]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 1.07, clipPath: 'inset(7% 3% 7% 3%)' }}
      animate={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
      exit={reduce ? undefined : { opacity: 0, scale: 1.02 }}
      transition={{ duration: MEDIA_DURATION, ease: MEDIA_EASE }}
      className="absolute inset-0"
      style={{ willChange: 'transform, opacity' }}
    >
      <div ref={clipRef} className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          src={item.src}
          poster={item.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          className="h-full w-full object-cover"
        />
      </div>
    </motion.div>
  );
}

/* Janela — estática (não remonta a cada troca), então a moldura fica firme
   enquanto só o conteúdo dentro dela troca. É o que dá a leitura de "mesma
   tela, outro projeto" em vez de "outro componente apareceu". */
function ShowcaseFrame({ item, reduce, frameRef, inView }) {
  return (
    <div
      ref={frameRef}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-rv-void/60 backdrop-blur-xl md:rounded-[20px]"
      style={{ boxShadow: '0 60px 120px -40px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)' }}
    >
      {/* barra da janela */}
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3 md:px-5">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={item.nicho}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: EASE_LUXE }}
            className="mx-auto truncate rounded-md bg-white/[0.04] px-3 py-1 font-satoshi text-[12px] text-rv-slate md:text-[13px]"
          >
            {item.nicho}
          </motion.span>
        </AnimatePresence>
        <span aria-hidden className="w-[42px]" />
      </div>

      {/* palco 16:9 — `aspect-video` garante que o site apareça INTEIRO,
          nunca cortado (ver nota do enquadramento no topo do arquivo). */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <AnimatePresence initial={false}>
          <ShowcaseMedia key={item.nicho} item={item} reduce={reduce} inView={inView} />
        </AnimatePresence>
        {/* vinheta mínima só pra assentar o vídeo na moldura */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: 'inset 0 0 90px 10px rgba(3,0,10,0.55)' }}
        />
      </div>
    </div>
  );
}

/* ── Abas com barra de progresso do autoplay ─────────────────────────────── */
function ConceptTab({ item, index, isActive, progress, onSelect, reduce }) {
  const [head, tail] = item.nicho.split('·').map((s) => s.trim());

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-current={isActive}
      className="group relative flex-1 pt-4 text-left focus-visible:outline-none"
    >
      {/* trilho + preenchimento: o trilho é o hairline que separa a aba do
          showcase; o preenchimento é o MESMO `progress` do motor de autoplay
          (não um clone do tempo), então pausar congela onde está. */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/[0.09]" />
      {isActive && (
        <motion.span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px origin-left bg-rv-purple-400"
          style={reduce ? { scaleX: 1 } : { scaleX: progress }}
        />
      )}

      <span className={`block font-satoshi text-[12px] tabular-nums transition-colors duration-300 ${isActive ? 'text-rv-purple-400' : 'text-rv-faint'}`}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span
        className={`mt-1.5 block font-grotesk text-lg font-light tracking-[-0.01em] transition-colors duration-300 md:text-xl ${
          isActive ? 'text-rv-titanium' : 'text-rv-faint group-hover:text-rv-slate'
        }`}
      >
        {head}
      </span>
      {tail && (
        <span className={`mt-0.5 hidden font-satoshi text-[13px] transition-colors duration-300 sm:block ${isActive ? 'text-rv-slate' : 'text-rv-faint/70'}`}>
          {tail}
        </span>
      )}
    </button>
  );
}

/* ── Texto + CTA do conceito ativo ───────────────────────────────────────── */
function ConceptInfo({ item }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={item.nicho}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.45, ease: EASE_LUXE }}
        className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between md:gap-12"
      >
        <p className={`max-w-2xl font-satoshi ${TYPE.body}`}>
          <span className="text-rv-titanium">{item.pain}</span>{' '}
          <span className="text-rv-slate">{item.solution}</span>
        </p>

        <a
          href={item.wa}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative inline-flex shrink-0 items-center gap-2.5 self-start overflow-hidden rounded-full border border-rv-purple/40 px-7 py-3.5 font-satoshi font-medium text-rv-titanium transition-[border-color,box-shadow] duration-500 hover:border-rv-purple hover:shadow-[0_0_44px_rgba(124,58,237,0.42)] md:self-auto ${TYPE.button}`}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />
          <span className="relative z-10">Quero este padrão no meu negócio</span>
          <span aria-hidden className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ConceptStack({ data }) {
  const total = data.items.length;
  const reduce = useRef(prefersReducedMotion()).current;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeItem = data.items[active];

  const progress = useMotionValue(0);
  const activeRef = useRef(0);
  const pausedRef = useRef(false);
  activeRef.current = active;
  pausedRef.current = paused;

  const stageRef = useRef(null);
  const inView = useInView(stageRef, { amount: 0.35 });
  const inViewRef = useRef(false);
  inViewRef.current = inView;

  const goTo = (i) => {
    progress.set(0);
    setActive(((i % total) + total) % total);
  };

  /* Motor de autoplay — um rAF só. Só avança quando a seção está VISÍVEL:
     sem isso, alguém que abrisse a página e fosse ler o rodapé voltaria e
     encontraria o carrossel já no último conceito, tendo "perdido" os
     outros sem nunca ter visto nenhum. */
  useEffect(() => {
    if (reduce) return undefined;
    let raf;
    let last = performance.now();

    const tick = (now) => {
      const dt = now - last;
      last = now;
      if (!pausedRef.current && inViewRef.current) {
        const next = progress.get() + dt / AUTOPLAY_MS;
        if (next >= 1) {
          progress.set(0);
          setActive((prev) => (prev + 1) % total);
        } else {
          progress.set(next);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, total, progress]);

  return (
    <section id="conceitos" className={`relative overflow-hidden border-t border-white/[0.06] bg-rv-void ${SECTION_PAD} ${GX}`}>
      <span
        aria-hidden
        className="lp-outline-text pointer-events-none absolute inset-x-0 bottom-0 select-none whitespace-nowrap text-center font-grotesk text-[13vw] font-semibold leading-none"
      >
        CONCEITO
      </span>

      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: EASE_LUXE }}
          className={`flex items-center gap-3 font-satoshi font-medium uppercase tracking-widest2 text-rv-slate ${TYPE.eyebrow}`}
        >
          <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
          O padrão aplicado
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXE }}
          className={`mt-6 max-w-3xl font-grotesk font-light leading-[1.12] tracking-[-0.015em] text-rv-titanium ${TYPE.h2}`}
        >
          É assim que o seu mercado deveria ver você.
        </motion.h2>

        {/* Showcase — entra com um leve rise + scale, tratado como o "objeto"
            principal da seção (é ele que carrega a prova). */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: MEDIA_EASE }}
          className="mt-12 md:mt-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <ShowcaseFrame item={activeItem} reduce={reduce} frameRef={stageRef} inView={inView} />

          <nav aria-label="Selecionar conceito" className="mt-8 flex gap-6 md:gap-10">
            {data.items.map((item, i) => (
              <ConceptTab
                key={item.nicho}
                item={item}
                index={i}
                isActive={i === active}
                progress={progress}
                onSelect={goTo}
                reduce={reduce}
              />
            ))}
          </nav>
        </motion.div>

        <div className="mt-10 md:mt-12">
          <ConceptInfo item={activeItem} />
        </div>
      </div>
    </section>
  );
}
