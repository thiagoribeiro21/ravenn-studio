import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue } from 'framer-motion';
import gsap from 'gsap';
import { EASE_LUXE, GX, SECTION_PAD, TYPE, prefersReducedMotion } from '../config/_base';

/* ══════════════════════════════════════════════════════════════════════════
   Ato 5 — v8. Redesign "página de produto": a seção deixa de ser um bloco
   editorial alinhado à esquerda e vira uma vitrine centrada, com o showcase
   tratado como o produto em cima do palco.

   ── O que mudou da v7 e por quê ───────────────────────────────────────────
   1. FUNDO — era `bg-rv-void` chapado (só o outline "CONCEITO" no rodapé).
      Agora há um palco de luz: um spotlight radial atrás do showcase que
      TROCA DE TOM conforme o conceito ativo, mais um wash superior que
      costura com a seção anterior. É o pedido literal de "gradientes de
      fundo que chamem atenção", e de quebra o tom por conceito reforça
      "três mercados diferentes" sem precisar de mais texto.
   2. CABEÇALHO CENTRADO — o resto da LP é alinhado à esquerda (editorial);
      aqui, deliberadamente centrado. É o registro de página de produto
      (o objeto no meio, texto simétrico em volta) e marca esta seção como
      O momento de vitrine da página, não mais um bloco de leitura.
   3. `intro` DEIXOU DE SER CÓDIGO MORTO — `data.label` e `data.intro`
      existiam no config e NUNCA eram renderizados (o componente hardcodava
      eyebrow e headline). O texto perdido era justamente o que estabelece
      honestidade — "Não são clientes — são o padrão exato de design e
      conversão que aplicamos". Some a dúvida de "isso é case real ou
      conceito?" logo no começo, que é exatamente o tipo de atrito que
      derruba conversão. Agora vem do config, como todo o resto.
   4. ABAS ACIMA DO SHOWCASE, em segmented control — antes eram texto solto
      embaixo, lidas depois do vídeo. Acima e em pílula, funcionam como
      seletor ("escolha o seu mercado") ANTES de olhar, que é a ordem certa
      de leitura numa vitrine. A pílula ativa desliza com `layoutId`.
   5. HIERARQUIA DO TEXTO — `pain` e `solution` eram um parágrafo corrido
      só, mesmo peso. Agora a dor é uma declaração grande (é o gancho
      emocional) e a solução vem como corpo abaixo dela.

   ── Enquadramento 16:9 (mantido da v7, não mexer) ─────────────────────────
   Os três vídeos são gravações de tela de sites inteiros, cada um com sua
   navbar/logo/headline embutidos. `aspect-video` garante que o site apareça
   INTEIRO: cobrir uma caixa mais quadrada com material 1.78:1 cortaria ~40%
   da largura, comendo justamente logo e CTA — as partes que provam "isto é
   um site de verdade". A seção existe pra demonstrar portfólio; o
   enquadramento não pode jogar a prova fora.

   ── Moldura de janela, sem URL (mantido) ──────────────────────────────────
   A moldura faz o vídeo ler como "um site", não como vídeo institucional.
   Deliberadamente SEM barra de endereço: são conceitos autorais, não
   clientes — inventar um domínio venderia como case o que é conceito.

   ── Autoplay (mantido) ────────────────────────────────────────────────────
   Um rAF só (não `setInterval` por slide), com pausa/retomada de verdade:
   hover pausa e continua de onde parou. Só avança com a seção VISÍVEL.
   ══════════════════════════════════════════════════════════════════════════ */

const AUTOPLAY_MS = 7000;
/* Curva mais lenta e "gorda no fim" que EASE_LUXE (a curva padrão da marca,
   calibrada pra UI que responde rápido) — aqui o pedido é cinematográfico:
   quase toda a aceleração no início, cauda longa. */
const MEDIA_EASE = [0.16, 1, 0.2, 1];
const MEDIA_DURATION = 0.9;

/* Os três violetas JÁ estabelecidos da marca (tailwind.config.js), do mais
   claro ao mais denso — mesma escolha que TargetAudienceCarousel.jsx faz
   pelos seus 3 cards. Uma paleta emprestada (azul/verde/âmbar) daria mais
   contraste entre conceitos, mas quebraria a identidade justamente na
   seção que existe pra provar padrão de marca. `rgba()` cru porque os
   gradientes abaixo precisam de alpha variável — token do Tailwind não
   serve dentro de `radial-gradient`. */
const CONCEPT_TINTS = ['167,139,250', '139,92,246', '124,58,237'];

/* ── Palco de luz ──────────────────────────────────────────────────────────
   Três camadas, todas `pointer-events-none`, nenhuma reagindo a scroll (o
   custo é zero por frame — só uma transição de cor de 1.2s quando o
   conceito troca):
     1. aurora do topo, atmosfera + dissolve a borda com a seção anterior;
     2. luz de palco centrada no showcase — a fonte principal;
     3. respiro sutil de intensidade, pra cena não morrer parada;
     4. fades de topo/base, costurando com as seções vizinhas.
   Somado a isso, o `floor glow` (no JSX, junto do showcase) assenta o
   objeto numa superfície. O `animate` de cor é o que faz a troca de
   conceito repintar a seção inteira num tom levemente diferente. */
function AmbientStage({ tint, reduce }) {
  return (
    <>
      {/* 1. AURORA DO TOPO — véu amplo ancorado na borda superior, caindo
             suave. Dá atmosfera à seção sem competir com o produto.

             Técnica: cor sólida animável + `maskImage` com a FORMA. Duas
             razões pra não animar a string do gradiente direto (como fazia a
             v8): (a) o Framer interpola cor com precisão, mas interpolar uma
             string inteira de `radial-gradient` com várias paradas é frágil e
             degrada pra corte seco quando as estruturas não batem; (b) a
             máscara aceita muito mais paradas sem custo, e é justamente o
             número de paradas que mata o BANDING — gradiente suave sobre
             fundo quase preto em 8 bits degrau visivelmente, e degraus de
             roxo sobre preto foram boa parte do aspecto "estranho". */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        animate={{ backgroundColor: `rgba(${tint},0.22)` }}
        transition={{ duration: 1.2, ease: EASE_LUXE }}
        style={{
          maskImage:
            'radial-gradient(ellipse 85% 100% at 50% 0%, #000 0%, rgba(0,0,0,0.62) 26%, rgba(0,0,0,0.3) 48%, rgba(0,0,0,0.1) 68%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 100% at 50% 0%, #000 0%, rgba(0,0,0,0.62) 26%, rgba(0,0,0,0.3) 48%, rgba(0,0,0,0.1) 68%, transparent 85%)',
        }}
      />

      {/* 2. LUZ DE PALCO — elipse larga e BAIXA, centrada na altura em que o
             showcase vive. É a fonte principal, e é ela que faz o conceito
             ler como objeto iluminado por trás em vez de "tem uma névoa roxa
             na seção".

             A v8 tinha uma terceira fonte deslocada pra esquerda (`-left-10%`)
             tentando dar volume assimétrico. Removida: com três radiais em
             posições e tamanhos diferentes, nenhuma dominava — o resultado
             não tinha direção de luz identificável, que é exatamente o que
             faz um fundo parecer acidental em vez de projetado. Uma fonte
             clara e centrada no produto é mais limpa E mais forte. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[16%] h-[62%]"
        animate={{ backgroundColor: `rgba(${tint},0.30)` }}
        transition={{ duration: 1.2, ease: EASE_LUXE }}
        style={{
          maskImage:
            'radial-gradient(ellipse 62% 58% at 50% 46%, #000 0%, rgba(0,0,0,0.7) 22%, rgba(0,0,0,0.34) 44%, rgba(0,0,0,0.12) 64%, transparent 82%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 62% 58% at 50% 46%, #000 0%, rgba(0,0,0,0.7) 22%, rgba(0,0,0,0.34) 44%, rgba(0,0,0,0.12) 64%, transparent 82%)',
        }}
      />

      {/* 3. Respiro lento e independente do scroll — impede que o palco leia
             como imagem estática se a pessoa parar de rolar. Amplitude bem
             menor que a v8 (era scale 1→1.12 e opacity 0.5→1, forte o
             bastante pra ser percebido como "a mancha está mexendo"): agora
             é só uma variação de intensidade que se sente sem se ver. */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[16%] h-[62%]"
          style={{
            backgroundColor: `rgba(${tint},0.1)`,
            maskImage: 'radial-gradient(ellipse 50% 46% at 50% 46%, #000 0%, rgba(0,0,0,0.4) 40%, transparent 74%)',
            WebkitMaskImage: 'radial-gradient(ellipse 50% 46% at 50% 46%, #000 0%, rgba(0,0,0,0.4) 40%, transparent 74%)',
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* 4. Washes de topo e base — dissolvem as bordas da seção nas
             vizinhas. Sem eles, os gradientes acima (agora bem mais fortes)
             criariam uma linha de corte visível contra o `bg-rv-void`
             chapado das seções de cima e de baixo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[20vh]"
        style={{ background: 'linear-gradient(to bottom, #03000A, transparent)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[25vh]"
        style={{ background: 'linear-gradient(to top, #03000A, transparent)' }}
      />
    </>
  );
}

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

  /* Abertura cinematográfica — mesmo padrão do hero real em
     public/portfolio-heroes/pele.html: wipe vertical via clip-path +
     zoom-out do vídeo, disparado uma vez a cada troca de conceito. Depois
     que a timeline termina é só o `loop` nativo do <video> que assume —
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
   tela, outro projeto" em vez de "outro componente apareceu".

   `p-px` + gradiente de fundo = borda com ESPESSURA simulada (a luz não bate
   igual em todas as arestas de um objeto real). Mesma técnica que
   GlassPanelMockup.jsx já usa no portfólio da home — não é invenção nova
   aqui, é o padrão de vidro já estabelecido no projeto. */
function ShowcaseFrame({ item, reduce, frameRef, inView }) {
  return (
    <div
      ref={frameRef}
      className="relative rounded-[22px] p-px"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.2), rgba(124,58,237,0.16) 45%, rgba(255,255,255,0.03))',
        boxShadow: '0 70px 140px -45px rgba(0,0,0,0.95), 0 0 0 1px rgba(0,0,0,0.4)',
      }}
    >
      {/* Sem barra de janela (os três pontinhos estilo macOS saíram na v9, a
          pedido). O que sobra é o vídeo puro numa moldura de vidro — mais
          limpo, e o próprio conceito já traz a navbar/logo dele embutidos na
          gravação, então a moldura extra estava empilhando duas "chromes" de
          navegador, uma dentro da outra. A identificação do nicho continua
          nas abas logo acima, que é onde a pessoa acabou de clicar. */}
      <div className="overflow-hidden rounded-[21px] bg-rv-void/70 backdrop-blur-xl">
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
    </div>
  );
}

/* ── Seletor de conceito — segmented control ──────────────────────────────
   A pílula ativa é UM elemento que desliza entre as abas (`layoutId`), não
   três fundos aparecendo/sumindo — é o que dá a física de segmented control
   nativo em vez de "troquei a cor de fundo". Com `reduce`, o `layoutId` sai
   de cena (a pílula só troca de lugar, sem interpolar posição). */
function ConceptTabs({ items, active, progress, onSelect, reduce }) {
  return (
    <div className="mt-10 flex justify-center md:mt-12">
      <div
        role="tablist"
        aria-label="Selecionar conceito"
        className="flex w-full max-w-xl gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-xl"
      >
        {items.map((item, i) => {
          const isActive = i === active;
          const [head] = item.nicho.split('·').map((s) => s.trim());

          return (
            <button
              key={item.nicho}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(i)}
              className="group relative flex-1 rounded-full px-2 py-2.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rv-purple/60 md:px-4"
            >
              {isActive && !reduce && (
                <motion.span
                  layoutId="concept-tab-pill"
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.07]"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                />
              )}
              {isActive && reduce && (
                <span aria-hidden className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.07]" />
              )}

              <span
                className={`relative z-10 block truncate font-satoshi text-[13px] font-medium transition-colors duration-300 md:text-[15px] ${
                  isActive ? 'text-rv-titanium' : 'text-rv-faint group-hover:text-rv-slate'
                }`}
              >
                {head}
              </span>

              {/* Preenchimento do autoplay — o MESMO `progress` do motor (não
                  um clone do tempo), então pausar no hover congela onde está
                  em vez de reiniciar. */}
              {isActive && !reduce && (
                <motion.span
                  aria-hidden
                  className="absolute inset-x-3 bottom-1 h-px origin-left rounded-full bg-rv-purple-400"
                  style={{ scaleX: progress }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Texto + CTA do conceito ativo ────────────────────────────────────────
   `pain` em escala de headline e `solution` em corpo: a dor é o gancho
   emocional (precisa parar o olho), a solução é a explicação (precisa ser
   lida com conforto). Na v7 os dois tinham o mesmo peso num parágrafo
   corrido e a dor se perdia no meio. */
function ConceptInfo({ item }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={item.nicho}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.45, ease: EASE_LUXE }}
        className="mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <p className="font-grotesk text-[clamp(1.4rem,2.6vw,2.1rem)] font-light leading-[1.24] tracking-[-0.015em] text-rv-titanium">
          {item.pain}
        </p>
        <p className={`mt-5 max-w-2xl font-satoshi text-rv-slate ${TYPE.body}`}>{item.solution}</p>

        <a
          href={item.wa}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative mt-9 inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-rv-purple px-8 py-4 font-satoshi font-medium text-white shadow-[0_0_44px_-8px_rgba(124,58,237,0.7)] transition-shadow duration-500 hover:shadow-[0_0_70px_-6px_rgba(124,58,237,0.95)] ${TYPE.button}`}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />
          <span className="relative z-10">Quero este padrão no meu negócio</span>
          <span aria-hidden className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
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
  const tint = CONCEPT_TINTS[active % CONCEPT_TINTS.length];

  const progress = useMotionValue(0);
  const pausedRef = useRef(false);
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
      <AmbientStage tint={tint} reduce={reduce} />

      <span
        aria-hidden
        className="lp-outline-text pointer-events-none absolute inset-x-0 bottom-0 select-none whitespace-nowrap text-center font-grotesk text-[13vw] font-semibold leading-none"
      >
        CONCEITO
      </span>

      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        {/* ── Cabeçalho centrado (registro de página de produto) ────────── */}
        <header className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: EASE_LUXE }}
            className={`flex items-center justify-center gap-3 font-satoshi font-medium uppercase tracking-widest2 text-rv-slate ${TYPE.eyebrow}`}
          >
            <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
            {data.eyebrow}
            <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXE }}
            className={`mt-6 font-grotesk font-light leading-[1.1] tracking-[-0.02em] text-rv-titanium ${TYPE.h2}`}
          >
            {data.heading}
          </motion.h2>

          {/* Antes era código morto no config (ver nota 3 no topo do arquivo).
              É o texto que remove a dúvida "isso é case real ou conceito?" —
              atrito clássico de conversão, respondido antes de ser feito. */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE_LUXE }}
            className={`mx-auto mt-6 max-w-2xl font-satoshi text-rv-slate ${TYPE.body}`}
          >
            {data.intro}
          </motion.p>
        </header>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: MEDIA_EASE }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <ConceptTabs items={data.items} active={active} progress={progress} onSelect={goTo} reduce={reduce} />

          <div className="relative mt-8 md:mt-10">
            <ShowcaseFrame item={activeItem} reduce={reduce} frameRef={stageRef} inView={inView} />

            {/* Brilho de piso — a luz que o objeto derrama na superfície
                embaixo dele. É o detalhe que faz o showcase ler como objeto
                POUSADO num palco em vez de recortado e colado sobre o fundo. */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-[8%] -bottom-10 h-28"
              animate={{ background: `radial-gradient(ellipse 55% 100% at 50% 0%, rgba(${tint},0.4), transparent 72%)` }}
              transition={{ duration: 1.2, ease: EASE_LUXE }}
              style={{ filter: 'blur(34px)' }}
            />
          </div>
        </motion.div>

        <div className="mt-14 md:mt-16">
          <ConceptInfo item={activeItem} />
        </div>
      </div>
    </section>
  );
}
