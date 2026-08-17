import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import { motion, useInView, useMotionValueEvent, useSpring, useTransform, useVelocity } from 'framer-motion';
import PillarsMorphIcon from '../primitives/PillarsMorphIcon';
import {
  EASE_LUXE,
  GX,
  SCRUB_SPRING,
  TYPE,
  hasWebGL,
  isSlowConnection,
  prefersReducedMotion,
  slot,
  useIsDesktop,
  useTrackProgress,
} from '../config/_base';

/* Ícone — v5, voltou a ser Three.js (era Canvas2D puro na v4). Pedido
   explícito: os MESMOS ícones/morphing da home, mantendo PageSpeed alto —
   a prova de que os dois não são contraditórios É a própria home, que já
   roda Three.js com nota alta porque nunca deixa o chunk entrar no
   caminho crítico. A estratégia aqui é idêntica, ver `PillarsCanvas.jsx`
   pro raciocínio completo (reaproveita a física de `ParticleMorpher` de
   `ThreeServicesCanvas.jsx`, não duplica).

   `lazy()` — o import só dispara quando o componente de fato monta, que já
   é condicional a `canvasInView` + `useFallback` abaixo: navegador sem
   WebGL, conexão lenta, ou mobile/reduced-motion (ver `pinned` em
   `CanvasSlot`) nunca chegam a baixar o chunk. */
const PillarsCanvas = lazy(() => import('../../components/PillarsCanvas'));

/* ══════════════════════════════════════════════════════════════════════════
   Ato 4 — v9. Duas mudanças, uma de física (troca "um pilar por vez" por
   "timeline visível, os 4 sempre montados") e uma de responsividade (mobile
   deixa de ser uma versão apertada do desktop e vira um layout DIFERENTE,
   não pinado).

   ── Física: de "slide único" pra "timeline" ────────────────────────────────
   v8 trocava QUAL pilar estava montado (`AnimatePresence` + `key=
   {activeIndex}`). Agora os 4 ficam montados o tempo todo, num
   `flex flex-col` normal — o "ativo" é só um estado de opacidade/cor/x por
   item (`PillarRow`), não mais uma troca de quem existe no DOM. Menos
   dramático que um crossfade, mas é literalmente o pedido: "ALL 4 pillars
   visible simultaneously."

   ── Responsividade: por que NÃO é "o mesmo layout, só com paddings maiores"
   ──────────────────────────────────────────────────────────────────────────
   O bug relatado (canvas empurra o texto pro rodapé, colide com o
   WhatsAppButton fixo) tem uma causa estrutural: o palco pinado
   (`h-[100dvh] overflow-hidden`) assume que headline + canvas + lista de 4
   pilares CABEM numa tela inteira. Em telas curtas (iPhone SE, 375×667) não
   cabem, nem enxugando fonte/canvas/gap ao máximo — e como o palco corta
   overflow, o que não cabe simplesmente FICA INVISÍVEL, escondendo pilares
   em vez de só apertar o layout. Paddings generosos (`pb-32`) tratam o
   sintoma (empurram o que sobra pra longe do botão) mas não resolvem telas
   onde ainda assim não cabe tudo.

   A correção estrutural: abaixo do breakpoint `md` (768px, o mesmo do
   Tailwind), a seção deixa de ser pinada e vira uma seção normal — fluxo
   comum, os 4 pilares sempre visíveis, sem scroll-jacking. O "scrollytelling
   cinematográfico" é um dispositivo de desktop por natureza (pressupõe
   altura de sobra pra uma cena caber inteira na tela); forçar a mesma
   mecânica numa viewport que não tem essa folga é empurrar o problema, não
   resolver — e `overflow-hidden` faria isso silenciosamente (conteúdo
   cortado, não só espremido). `useIsDesktop()` decide isso via
   `matchMedia`, não CSS: as duas versões NUNCA montam ao mesmo tempo — um
   `md:hidden` / `hidden md:block` alternando visibilidade por CSS deixaria
   as DUAS árvores montadas, e uma delas contém um `<canvas>` de WebGL. Um
   contexto WebGL invisível ainda é um contexto WebGL alocado — gasto de
   GPU/bateria à toa, e em dispositivos com limite baixo de contextos
   simultâneos, risco de um dos dois nem renderizar.

   `prefers-reduced-motion` cai no MESMO layout estático que o mobile usa
   (`StaticPillars`) — reaproveitado, não duplicado: os dois casos querem a
   mesma coisa (tudo visível, sem depender de gesto de scroll pra revelar
   conteúdo), só motion ligado/desligado dentro dele.
   ══════════════════════════════════════════════════════════════════════════ */

const COLOR = { titanium: '#F8F9FA', slate: '#94A3B8', faint: '#5B6472', purple: '#A78BFA' };

/* Headline termina de acender na primeira fatia do percurso (0→38%) — o
   resto do scroll fica livre pra história dos pilares. Só usada na versão
   PINADA (desktop) — a estática (mobile/reduced) usa um `whileInView`
   simples, ver nota em `StaticPillars`. */
const HEADLINE_RANGE = [0, 0.38];

/* Tamanho próprio pros títulos dos pilares — registro tipográfico à parte
   desta cena (como ANCHOR_SIZE/PARAGRAPH_SIZE em ScrubStatement.jsx). Piso
   baixado pra ~text-3xl (era ~text-5xl) — o brief pede tipografia menor no
   mobile, e agora os 4 pilares ficam empilhados e VISÍVEIS ao mesmo tempo
   (antes só um por vez ocupava a tela) — 4× o tamanho antigo empilhado não
   caberia em lugar nenhum, muito menos numa tela curta. */
const PILLAR_SIZE = 'clamp(1.875rem, 1rem + 3.4vw, 4.5rem)';

function HeadlineWord({ progress, reveal, restColor, children }) {
  const opacity = useTransform(progress, reveal, [0.14, 1]);
  return (
    <motion.span className="mr-[0.26em] inline-block" style={{ opacity, color: restColor, willChange: 'opacity' }}>
      {children}
    </motion.span>
  );
}

/* Versão PINADA (desktop) — texto acende palavra a palavra, amarrado ao
   scroll do trilho de 400dvh. */
function ScrubHeadline({ progress, lines }) {
  const tokens = useMemo(() => {
    const out = [];
    lines.forEach((line, li) => {
      line.text.split(' ').forEach((text) => out.push({ text, tone: line.tone }));
      if (li < lines.length - 1) out.push({ br: true });
    });
    return out;
  }, [lines]);

  const animatable = useMemo(() => tokens.filter((t) => !t.br), [tokens]);
  let wordIndex = -1;

  return (
    <h2 className={`font-grotesk font-light leading-[1.18] tracking-[-0.015em] ${TYPE.h2}`}>
      {tokens.map((token, i) => {
        if (token.br) return <br key={i} />;
        wordIndex += 1;
        const reveal = slot(HEADLINE_RANGE, wordIndex, animatable.length, 0.6);
        const restColor = token.tone === 'bright' ? COLOR.titanium : COLOR.slate;
        return (
          <HeadlineWord key={i} progress={progress} reveal={reveal} restColor={restColor}>
            {token.text}
          </HeadlineWord>
        );
      })}
    </h2>
  );
}

/* Versão ESTÁTICA (mobile + reduced-motion) — sem MotionValue de scroll
   nenhuma: `useTrackProgress` mede a altura do trilho contra a viewport
   (`travel = trackHeight - viewportHeight`); numa seção de fluxo normal
   (curta, não pinada) esse `travel` fica ≤0 e a função trava `progress` em
   0 pra sempre — um scrub amarrado a isso nunca terminaria de acender.
   `whileInView` é o mecanismo certo aqui, não uma versão "quebrada" do
   scrub. */
function StaticHeadline({ lines, playEntrance }) {
  return (
    <motion.h2
      initial={playEntrance ? { opacity: 0, y: 20 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: EASE_LUXE }}
      className={`font-grotesk font-light leading-[1.18] tracking-[-0.015em] ${TYPE.h2}`}
    >
      {lines.map((line, i) => (
        <span key={i} className={line.tone === 'bright' ? 'text-rv-titanium' : 'text-rv-slate'}>
          {line.text}{' '}
        </span>
      ))}
    </motion.h2>
  );
}

function PillarNumber({ index, color }) {
  return (
    <span className="font-satoshi text-[15px] tabular-nums" style={color ? { color } : undefined}>
      {String(index + 1).padStart(2, '0')}
    </span>
  );
}

/* Uma linha da timeline — todas as 4 ficam montadas o tempo todo; só o alvo
   do `animate` muda com `isActive`. Duas propriedades por elemento (opacity
   no wrapper, color+textShadow no `<h3>`), cada uma no seu próprio nó —
   sem risco do bug de "duas animations disputando a mesma propriedade" que
   apareceu no Ato 2 (rotate+pulse), porque aqui é uma SÓ animation por
   propriedade, não duas concorrendo pela mesma. */
function PillarRow({ index, label, activeIndex }) {
  const isActive = index === activeIndex;

  return (
    <motion.div
      className="flex items-baseline gap-4"
      animate={{ opacity: isActive ? 1 : 0.4, x: isActive ? 10 : 0 }}
      transition={{ duration: 0.5, ease: EASE_LUXE }}
      style={{ willChange: 'transform, opacity' }}
    >
      <PillarNumber index={index} color={isActive ? COLOR.purple : COLOR.faint} />
      <motion.h3
        className="font-grotesk font-medium leading-[1.04] tracking-tight"
        animate={{
          color: isActive ? COLOR.titanium : 'rgba(248,249,250,0.35)',
          textShadow: isActive ? '0 6px 32px rgba(124,58,237,0.35)' : '0 0 0 rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.5, ease: EASE_LUXE }}
        style={{ fontSize: PILLAR_SIZE }}
      >
        {label}
      </motion.h3>
    </motion.div>
  );
}

/* `pinned`: só a versão PINADA (desktop) tenta Three.js — mobile/reduced
   sempre usa o Canvas2D direto, sem nem cogitar o import do chunk. Não é só
   economia: `StaticPillars` nunca tem um "pilar ativo" de verdade (os 4
   ficam sempre visíveis, não existe scroll pra amarrar um `activeIndex`
   variável), então uma única forma estática já é toda a informação que
   existe pra mostrar ali — gastar 219KB gzip de WebGL numa forma que nunca
   muda, no dispositivo tipicamente mais restrito (mobile) e mais provável
   de estar numa webview de anúncio sem WebGL de verdade, seria o pior
   lugar possível pra pagar esse custo. No desktop pinado o `activeIndex`
   REALMENTE muda com o scroll — é ali que o morphing ganha o cliente. */
function CanvasSlot({ canvasInView, wrapRef, velocityRef, reduced, activeIndex = 0, pinned = false, useFallback = false, onContextLost }) {
  const tryThree = pinned && !useFallback;

  return (
    <div ref={wrapRef} className="mt-8 flex justify-center md:mt-10 md:justify-start">
      {/* Mobile: teto de altura explícito (~30vh / 220px) — o pedido do
          brief é literal aqui: sem isso o canvas (que antes era um
          `h-64 w-64` fixo, 256px, igual em toda tela) competia por espaço
          vertical numa viewport que já não tinha sobra nenhuma. */}
      <div className="h-[30vh] max-h-[220px] w-[30vh] max-w-[220px] md:h-80 md:w-80">
        {!canvasInView ? (
          <div className="h-full w-full" />
        ) : tryThree ? (
          /* Suspense cobre a janela entre "decidiu montar" e "o chunk de
             Three.js terminou de chegar" — mostra o MESMO ícone em
             Canvas2D nesse intervalo (não um spinner solto), então a troca
             pro morphing 3D real, quando chega, lê como um upgrade suave
             em vez de um elemento novo aparecendo do nada. */
          <Suspense fallback={<PillarsMorphIcon activeIndex={activeIndex} reduceMotion={false} velocityRef={velocityRef} className="h-full w-full" />}>
            <PillarsCanvas activeIndex={activeIndex} onContextLost={onContextLost} />
          </Suspense>
        ) : (
          <PillarsMorphIcon activeIndex={activeIndex} reduceMotion={reduced} velocityRef={velocityRef} className="h-full w-full" />
        )}
      </div>
    </div>
  );
}

/* Layout compartilhado por MOBILE e REDUCED-MOTION — os dois querem a mesma
   coisa (tudo visível, nada atrás de um gesto de scroll pra revelar), só
   motion ligado/desligado. `pb-32` só pega em mobile (`md:pb-[120px]`
   assume o normal a partir daí) — é a folga de segurança pro
   WhatsAppButton fixo (56px + 24px de margem = ~80px de rodapé ocupado;
   128px de padding cobre isso com folga real, não uma estimativa). */
function StaticPillars({ data, canvasInView, canvasWrapRef, velocityRef, reduced }) {
  const playEntrance = !reduced;

  return (
    <section id="padrao" className={`relative border-t border-white/[0.06] bg-rv-void pb-32 pt-16 md:pb-[120px] md:pt-[120px] ${GX}`}>
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-6">
          <StaticHeadline lines={data.declarationLines} playEntrance={playEntrance} />
          <CanvasSlot canvasInView={canvasInView} wrapRef={canvasWrapRef} velocityRef={velocityRef} reduced={reduced} />
        </div>

        <div className="relative pl-6 md:col-span-6 md:pl-10">
          <div className="absolute bottom-0 left-0 top-0 w-px bg-white/[0.08]">
            <div className="h-full w-px bg-rv-purple-400" style={{ boxShadow: '0 0 12px rgba(167,139,250,0.65)' }} />
          </div>
          <div className="flex flex-col gap-7 md:gap-9">
            {data.labels.map((label, i) => (
              <motion.div
                key={label}
                initial={playEntrance ? { opacity: 0, y: 16 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_LUXE }}
                className="flex items-baseline gap-4"
              >
                <PillarNumber index={i} color={COLOR.purple} />
                <h3
                  className="font-grotesk font-medium leading-[1.04] tracking-tight text-rv-titanium"
                  style={{ fontSize: PILLAR_SIZE }}
                >
                  {label}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Layout PINADO — só monta em desktop (`isDesktop`) com motion ligado. */
function PinnedTimeline({ data, trackRef, progress, lineScale, activeIndex, canvasInView, canvasWrapRef, velocityRef, useFallback, onContextLost }) {
  return (
    <section id="padrao" ref={trackRef} className="relative h-[400dvh] bg-rv-void">
      {/* Palco: uma viewport de altura, colado no topo enquanto o trilho de
          400dvh passa. `dvh` (não `vh`): o container de scroll do LPShell é
          `100dvh`, e `100vh` cru em mobile é maior (conta a barra do
          navegador que se recolhe) — deixaria o palco mais alto que a
          viewport, deslizando de leve em vez de travar de verdade. (Esta
          seção não roda em mobile de qualquer forma, mas a constante segue
          o mesmo padrão do resto do arquivo por consistência.) */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden border-t border-white/[0.06]">
        <div className={`relative z-10 grid h-full items-center gap-16 md:grid-cols-12 ${GX}`}>
          <div className="md:col-span-6">
            <ScrubHeadline progress={progress} lines={data.declarationLines} />
            <CanvasSlot
              canvasInView={canvasInView}
              wrapRef={canvasWrapRef}
              velocityRef={velocityRef}
              reduced={false}
              activeIndex={activeIndex}
              pinned
              useFallback={useFallback}
              onContextLost={onContextLost}
            />
          </div>

          <div className="relative pl-10 md:col-span-6">
            {/* trilho + preenchimento — `scrollYProgress` (0→1) do trilho
                inteiro, direto, sem depender de qual pilar está "por trás"
                de nada (a timeline inteira já está sempre visível). */}
            <div className="absolute bottom-0 left-0 top-0 w-px bg-white/[0.08]">
              <motion.div
                className="w-px bg-rv-purple-400"
                style={{
                  height: '100%',
                  scaleY: lineScale,
                  transformOrigin: 'top',
                  boxShadow: '0 0 12px rgba(167,139,250,0.65)',
                  willChange: 'transform',
                }}
              />
            </div>

            <div className="flex flex-col gap-8">
              {data.labels.map((label, i) => (
                <PillarRow key={label} index={i} label={label} activeIndex={activeIndex} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


export default function PillarsShaped({ data }) {
  const trackRef = useRef(null);
  const canvasWrapRef = useRef(null);

  const reduced = useMemo(() => prefersReducedMotion(), []);
  const isDesktop = useIsDesktop();
  const total = data.labels.length;

  // Três motivos independentes pra cair no fallback em Canvas2D: rede lenta
  // (`isSlowConnection` — não baixar 219KB gzip a mais numa 3G não é
  // negociável, mesmo no desktop pinado), navegador/webview sem WebGL de
  // verdade (`hasWebGL` — o caso mais provável de "o ícone não aparece" num
  // aparelho real, ver a função em config/_base.js) e perda de contexto
  // DEPOIS de já ter montado (`contextLost`, avisado pelo próprio
  // `<PillarsCanvas>` via `onContextLost`). Os dois primeiros são checados
  // uma vez só (não mudam durante a sessão); o terceiro é estado porque
  // pode acontecer a qualquer momento, inclusive depois de renderizar com
  // sucesso.
  const noWebGL = useMemo(() => !hasWebGL(), []);
  const slow = useMemo(() => isSlowConnection(), []);
  const [contextLost, setContextLost] = useState(false);
  const useFallback = noWebGL || slow || contextLost;

  // Só a versão pinada usa isto de verdade — mas os hooks precisam rodar
  // incondicionalmente (Regras dos Hooks), então ficam aqui em cima
  // independente de qual layout vai renderizar embaixo.
  const rawProgress = useTrackProgress(trackRef, !isDesktop || reduced);
  const progress = useSpring(rawProgress, SCRUB_SPRING);

  const rawVelocity = useVelocity(rawProgress);
  const velocityRef = useRef(0);
  useMotionValueEvent(rawVelocity, 'change', (v) => {
    velocityRef.current = v;
  });

  const lineScale = useTransform(progress, [0, 1], [0, 1]);
  const canvasInView = useInView(canvasWrapRef, { margin: '240px 0px', once: false });

  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(progress, 'change', (v) => {
    const i = Math.min(total - 1, Math.max(0, Math.floor(v * total)));
    setActiveIndex((prev) => (prev === i ? prev : i));
  });

  if (reduced || !isDesktop) {
    return (
      <StaticPillars
        data={data}
        canvasInView={canvasInView}
        canvasWrapRef={canvasWrapRef}
        velocityRef={velocityRef}
        reduced={reduced}
      />
    );
  }

  return (
    <PinnedTimeline
      data={data}
      trackRef={trackRef}
      progress={progress}
      lineScale={lineScale}
      activeIndex={activeIndex}
      canvasInView={canvasInView}
      canvasWrapRef={canvasWrapRef}
      velocityRef={velocityRef}
      useFallback={useFallback}
      onContextLost={() => setContextLost(true)}
    />
  );
}
