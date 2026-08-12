import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { EASE_LUXE, GX, SECTION_PAD, TYPE, prefersReducedMotion } from '../config/_base';

/* ══════════════════════════════════════════════════════════════════════════
   Ato "Para quem é" — carrossel de cartões horizontais, réplica adaptada do
   "Get the Highlights" da Apple. Mecânica: uma FILA flexível (`flex`) com
   largura fixa por cartão, transladada por UM `x` (MotionValue) — arrastar
   manipula esse `x` diretamente (Framer escreve nele durante o gesto de
   `drag`), soltar decide o índice mais próximo e anima o mesmo `x` até o
   alvo com uma mola. Escala/opacidade de CADA cartão vêm de `useTransform`
   sobre esse `x` compartilhado — contínuas durante o arrasto (não pulam de
   estado em estado só ao soltar), é isso que dá o "buttery 60fps" pedido.

   Sangria até a borda real do viewport: a fileira de cartões vive fora do
   `${GX}` da seção (mesmo truque de `ConceptStack.jsx`) — só o cabeçalho de
   texto respeita o gutter da página. `cardWidth` é medido do
   `window.innerWidth`, não adivinhado em `vw`: o cálculo de arrasto/snap
   precisa de um número real em px, e é mais barato medir uma vez (+ resize)
   que recalcular a cada frame.
   ══════════════════════════════════════════════════════════════════════════ */

const GAP = 24;
const AUTOPLAY_MS = 8000;
const CARD_RADIUS = 40; // rounded-[2.5rem] do brief — maior que RADIUS.lg (28) do resto do site, registro próprio desta cena
const CARD_HEIGHT = 'clamp(26rem, 62vh, 40rem)';
const CARD_TITLE_SIZE = 'clamp(1.75rem, 1.1rem + 2.6vw, 3rem)';
const TRACK_SPRING = { type: 'spring', stiffness: 300, damping: 32, mass: 0.6 };

/* v2 — as 3 tintas viraram os 3 roxos JÁ estabelecidos da marca (rv-purple,
   rv-purple-500, rv-purple-400 — tailwind.config.js), do mais denso ao mais
   claro, em vez de uma paleta emprestada (violeta/azul/esmeralda) que não
   existe em nenhum outro lugar do site. Autoridade fica com o roxo mais
   forte (é literalmente a cor da marca), Conversão com o meio-tom,
   Visionário com o mais claro/etéreo — uma escala, não três acidentes.
   `rgba(...)` explícito em vez de `violet-900`/etc.: são os HEXs exatos da
   marca, não o roxo genérico do Tailwind (que não bate 1:1 com nenhum
   token). */
const CARD_TINTS = ['124,58,237', '139,92,246', '167,139,250'];

/* Lado do texto por slide — direção de arte, olhando a foto de verdade
   (não um chute): nas fotos 1 e 3, o rosto/sujeito principal fica no lado
   ESQUERDO do enquadramento (autoridade_profissional: mulher centro-
   esquerda; visionario_maquina_vendas: homem centro-esquerda, tela do
   notebook ocupa o centro) — texto também à esquerda cai literalmente em
   cima do rosto. Na foto 2 (conversao_lead) é o oposto: o rosto/mão fica à
   direita, e a esquerda é só luz de fundo desfocada — texto à esquerda já
   funcionava. Índice bate com `data.slides` (config/sites-institucionais.js
   → `audience.slides`). */
const TEXT_SIDE = ['right', 'left', 'right'];

function PlayGlyph() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
      <path d="M1 0.6 L9 5 L1 9.4 Z" />
    </svg>
  );
}
function PauseGlyph() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
      <rect x="1" y="0.5" width="2.6" height="9" />
      <rect x="6.4" y="0.5" width="2.6" height="9" />
    </svg>
  );
}

/*
  Cartão — a imagem tem DUAS animações no MESMO elemento (`scale` de Ken
  Burns + `filter` de grayscale→cor), mas em propriedades CSS diferentes
  (`transform` × `filter`), então não é o bug de "duas animations disputando
  a mesma propriedade" que apareceu no Ato 2 — aqui cada uma escreve na sua
  própria propriedade, o `transition` por-chave (`{ scale: {...}, filter:
  {...} }`) já diferencia a física de cada uma sem precisar de dois nós.
*/
function Card({ slide, index, activeIndex, trackX, step, cardWidth, reduced }) {
  const distance = useTransform(trackX, (x) => x + index * step);
  const scale = useTransform(distance, [-step, 0, step], [0.95, 1, 0.95]);
  const opacity = useTransform(distance, [-step, 0, step], [0.5, 1, 0.5]);
  const isActive = index === activeIndex;

  return (
    <motion.div
      className="relative shrink-0 select-none overflow-hidden border border-white/5"
      style={{
        width: cardWidth,
        height: CARD_HEIGHT,
        scale,
        opacity,
        borderRadius: CARD_RADIUS,
        willChange: 'transform, opacity',
      }}
    >
      <motion.img
        src={slide.image}
        alt=""
        draggable={false}
        loading={index === 0 ? 'eager' : 'lazy'}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        animate={{
          scale: isActive && !reduced ? [1, 1.05] : 1,
          filter: isActive ? 'grayscale(0%)' : 'grayscale(55%)',
        }}
        transition={{
          scale: {
            duration: 20,
            ease: 'linear',
            repeat: isActive && !reduced ? Infinity : 0,
            repeatType: 'mirror',
          },
          filter: { duration: 1, ease: 'easeOut' },
        }}
        style={{ willChange: 'transform, filter' }}
      />

      {/* v3 — camada mais forte que a v2: topo subiu de 0.15 pra 0.42 de
          preto (era claro demais em cima de fotos claras — a foto sozinha
          já dava conta de "legível" só quando o fundo por trás do texto
          calhava de ser escuro, e nem sempre calha). Ainda uma única camada
          `radial + linear` (não duas empilhadas — ver raciocínio da v2:
          alpha composto é imprevisível e "confuso" é o oposto do pedido),
          só recalibrada mais escura. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            `radial-gradient(130% 65% at 50% 0%, rgba(${CARD_TINTS[index % CARD_TINTS.length]},0.42) 0%, rgba(3,0,10,0.55) 50%, transparent 78%)`,
            'linear-gradient(to bottom, rgba(3,0,10,0.42) 0%, rgba(3,0,10,0.22) 40%, rgba(3,0,10,0.7) 78%, #03000A 100%)',
          ].join(', '),
        }}
      />

      {/* Reforço SÓ no mobile (`md:hidden`) — medido ao vivo: a camada acima
          (pensada pro card lado a lado do desktop, onde o texto ocupa
          metade da largura da foto) some com folga na parte de baixo do
          parágrafo no mobile, onde o corpo de texto é mais alto E cobre a
          largura inteira do card — cai bem em cima de partes claras da foto
          (rosto, ombro) na maioria dos 3 slides. Uma segunda camada linear,
          mais escura e progressiva, resolve sem mexer no gradiente do
          desktop (que já está calibrado e funciona lá). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 md:hidden"
        style={{
          background: 'linear-gradient(to bottom, rgba(3,0,10,0.1) 0%, rgba(3,0,10,0.55) 28%, rgba(3,0,10,0.88) 58%, rgba(3,0,10,0.96) 100%)',
        }}
      />

      {/* Lado do texto por slide (`TEXT_SIDE`) — nas fotos 1 e 3 o rosto
          fica à esquerda do quadro; texto também à esquerda cairia em cima
          da pessoa. `flex` + `justify-end/start` no wrapper decide o LADO;
          `text-right/left` no bloco decide como o texto se alinha dentro
          dele — sem os dois, um título de 2 linhas ficaria no lado certo
          mas com a segunda linha alinhada errada. No mobile a diferença
          quase não aparece (o cartão já é ~85vw, o texto ocupa a largura
          inteira de qualquer forma) — as duas camadas escuras acima é que
          fazem o trabalho pesado de legibilidade lá. */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 flex p-8 md:p-12 ${
          TEXT_SIDE[index % TEXT_SIDE.length] === 'right' ? 'justify-end' : 'justify-start'
        }`}
      >
        <div className={`max-w-md ${TEXT_SIDE[index % TEXT_SIDE.length] === 'right' ? 'text-right' : 'text-left'}`}>
          <h3
            className="font-grotesk font-medium leading-[1.1] text-rv-titanium"
            style={{ fontSize: CARD_TITLE_SIZE, textShadow: '0 4px 28px rgba(0,0,0,0.75), 0 1px 3px rgba(0,0,0,0.9)' }}
          >
            {slide.title}
          </h3>
          <p
            className={`mt-4 font-satoshi text-rv-titanium/90 ${TYPE.body}`}
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.85)' }}
          >
            {slide.body}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* Bolinha vira pílula quando ativa, com um preenchimento interno que segue
   o MESMO `progress` (0→1) do motor de autoplay — não um clone/duplicata do
   tempo, a mesma MotionValue, então parar o autoplay literalmente congela
   o preenchimento onde está (não reinicia do zero ao retomar). */
function DotButton({ index, active, progress, onSelect, reduced }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`Ir para o slide ${index + 1}`}
      aria-current={active}
      className="flex h-4 items-center px-0.5"
    >
      <span
        className="block overflow-hidden rounded-full bg-white/20 transition-[width] duration-300 ease-out"
        style={{ width: active ? 30 : 6, height: 6 }}
      >
        {active && !reduced && (
          <motion.span
            className="block h-full bg-rv-titanium"
            style={{ scaleX: progress, transformOrigin: 'left', width: '100%' }}
          />
        )}
        {active && reduced && <span className="block h-full w-full bg-rv-titanium" />}
      </span>
    </button>
  );
}

function ControlBar({ total, index, progress, playing, reduced, onSelect, onTogglePlay }) {
  return (
    <div className="mt-8 flex justify-center md:mt-10">
      <div
        className="flex items-center gap-3 rounded-full border border-white/10 px-5 py-3"
        style={{ background: 'rgba(13,10,24,0.7)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }}
      >
        <div className="flex items-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <DotButton key={i} index={i} active={i === index} progress={progress} onSelect={onSelect} reduced={reduced} />
          ))}
        </div>
        {!reduced && (
          <>
            <span aria-hidden className="mx-0.5 h-4 w-px bg-white/15" />
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={playing ? 'Pausar carrossel' : 'Reproduzir carrossel'}
              className="flex h-6 w-6 items-center justify-center text-rv-titanium/75 transition-colors duration-300 hover:text-rv-titanium"
            >
              {playing ? <PauseGlyph /> : <PlayGlyph />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function TargetAudienceCarousel({ data }) {
  const total = data.slides.length;
  const reduced = useRef(prefersReducedMotion()).current;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [cardWidth, setCardWidth] = useState(() => Math.min(window.innerWidth * 0.85, 1024));

  const trackX = useMotionValue(0);
  const progress = useMotionValue(0);

  // Seção precisa estar VISÍVEL pro autoplay avançar — sem isso o `tick()`
  // (useEffect abaixo) começa a rodar assim que o componente MONTA, não
  // quando a pessoa efetivamente chega na seção. Como o LPShell monta todas
  // as seções de uma vez (sem lazy-mount), alguém que demora 20-30s lendo
  // seções anteriores já encontraria o carrossel adiantado alguns slides ao
  // chegar aqui — o mesmo bug explica tanto "não começa sempre no slide 1"
  // quanto "o timer roda fora da tela". Mesmo padrão de `ConsequenceCarousel
  // .jsx` (`IntersectionObserver`, `threshold: 0.4`).
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  // Mesma fórmula usada pro `paddingLeft` do trilho de cartões — a borda
  // esquerda do primeiro cartão nasce exatamente aqui. Calculada UMA vez e
  // usada nos dois lugares (cabeçalho + trilho) em vez de duplicar a string:
  // se um dia o `max(6vw, ...)` mudar, os dois precisam mudar junto, e uma
  // string repetida é exatamente onde esse tipo de coisa dessincroniza.
  const edgeInset = `max(6vw, calc((100vw - ${cardWidth}px) / 2))`;

  const indexRef = useRef(0);
  const playingRef = useRef(true);
  const draggingRef = useRef(false);
  const inViewRef = useRef(false);
  indexRef.current = index;
  playingRef.current = playing;
  inViewRef.current = inView;

  const step = cardWidth + GAP;

  const goTo = (i, { animated = true } = {}) => {
    const clamped = ((i % total) + total) % total;
    setIndex(clamped);
    progress.set(0);
    const target = -(clamped * step);
    if (animated && !reduced) {
      animate(trackX, target, TRACK_SPRING);
    } else {
      trackX.set(target);
    }
  };

  // Recalcula a largura do cartão em px de verdade (85vw travado em 1024px)
  // e realinha a fileira pro índice atual sem animação — um resize não é
  // "navegação", não deveria disparar a mola de snap.
  useLayoutEffect(() => {
    const measure = () => {
      const w = Math.min(window.innerWidth * 0.85, 1024);
      setCardWidth(w);
      trackX.set(-(indexRef.current * (w + GAP)));
    };
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Visibilidade da seção — gate do autoplay, ver nota acima de `inViewRef`.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Motor de autoplay — um rAF só, não um setInterval por slide: dá pausa/
  // retomada de verdade (retoma de onde parou, não reinicia o slide) porque
  // `progress` só é lido/escrito aqui, nunca resetado por um timer solto.
  // `last = performance.now()` é reatribuído a cada tick mesmo quando pausado
  // (fora de vista) — sem isso, o primeiro `dt` calculado ao voltar pra tela
  // seria "agora menos o instante em que saiu de vista", um salto gigante que
  // pularia direto pro próximo slide em vez de continuar de onde parou.
  useEffect(() => {
    if (reduced) return undefined;
    let raf;
    let last = performance.now();

    const tick = (now) => {
      const dt = now - last;
      last = now;
      if (playingRef.current && !draggingRef.current && inViewRef.current) {
        const next = progress.get() + dt / AUTOPLAY_MS;
        if (next >= 1) {
          goTo(indexRef.current + 1);
        } else {
          progress.set(next);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, step]);

  function handleDragStart() {
    draggingRef.current = true;
  }

  function handleDragEnd(_, info) {
    draggingRef.current = false;
    const FLICK_VELOCITY = 500;
    let target = Math.round(-trackX.get() / step);
    if (Math.abs(info.velocity.x) > FLICK_VELOCITY) {
      target = indexRef.current + (info.velocity.x < 0 ? 1 : -1);
    }
    goTo(target);
  }

  // `z-20` na seção (era z-10) — a seção logo abaixo (`CurtainReveal` +
  // "Como Funciona") pina de verdade agora (`position: sticky`, não só um
  // efeito visual amarrado a progresso), então o empilhamento explícito
  // deixou de ser "rede de segurança pra 1px de subpixel" e passou a ser
  // ESTRUTURAL: sem z-index maior aqui, a ordem de pintura seguiria só
  // ordem de DOM, e durante a janela em que esta seção ainda está rolando
  // por cima da seção pinada (que já está sticky-presa por baixo, esperando
  // ser revelada), ela vazaria por cima em vez de cobrir. Continua rolando
  // embora em fluxo NORMAL — nenhum sticky nem transform aplicado aqui, só
  // a garantia de empilhamento. `bg-rv-void` (#03000A) já presente é o que
  // faz essa cobertura ser opaca de verdade, não só por ordem de pintura.
  return (
    <section ref={sectionRef} className={`relative z-20 overflow-hidden border-t border-white/[0.06] bg-rv-void ${SECTION_PAD}`}>
      {/* v2 — de volta a alinhado à esquerda (não centralizado), mas com o
          `paddingLeft` do CARTÃO (`edgeInset`), não o gutter padrão da
          página (`${GX}`, 6vw simétrico). Os dois só coincidem quando
          `cardWidth` bate exatamente com `100vw - 12vw` — em qualquer outra
          largura (a maioria), `edgeInset` é MAIOR que 6vw, então usar `${GX}`
          aqui deixava o título nascendo mais à esquerda que o próprio
          cartão. `max-w-6xl` (era `max-w-3xl`) é folga suficiente pra "Para
          quem é o Padrão Ravenn." não quebrar linha em nenhuma largura de
          desktop razoável — é um teto de segurança pra monitor ultrawide,
          não uma restrição real no tamanho normal. */}
      <div className={GX} style={{ paddingLeft: edgeInset }}>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: EASE_LUXE }}
          className={`flex items-center gap-3 font-satoshi font-medium uppercase tracking-widest2 text-rv-slate ${TYPE.eyebrow}`}
        >
          <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
          {data.eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXE }}
          className={`mt-6 max-w-6xl whitespace-normal font-grotesk font-light leading-[1.1] tracking-[-0.015em] text-rv-titanium md:whitespace-nowrap ${TYPE.h2}`}
        >
          {data.heading}
        </motion.h2>
      </div>

      {/* sangria até a borda real do viewport — mesmo truque de
          ConceptStack.jsx (w-screen + recentraliza via translate -50%),
          porque `left-1/2` sozinho mediria a partir da borda deste elemento,
          não do centro real da tela. */}
      <div className="relative left-1/2 mt-12 w-screen -translate-x-1/2 md:mt-16">
        <div style={{ paddingLeft: edgeInset }}>
          <motion.div
            className="flex"
            style={{ x: trackX, gap: GAP, cursor: reduced ? 'default' : 'grab' }}
            drag={reduced ? false : 'x'}
            dragElastic={0.08}
            dragMomentum={false}
            dragConstraints={{ left: -((total - 1) * step), right: 0 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {data.slides.map((slide, i) => (
              <Card
                key={slide.title}
                slide={slide}
                index={i}
                activeIndex={index}
                trackX={trackX}
                step={step}
                cardWidth={cardWidth}
                reduced={reduced}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <ControlBar
        total={total}
        index={index}
        progress={progress}
        playing={playing}
        reduced={reduced}
        onSelect={(i) => goTo(i)}
        onTogglePlay={() => setPlaying((p) => !p)}
      />
    </section>
  );
}
