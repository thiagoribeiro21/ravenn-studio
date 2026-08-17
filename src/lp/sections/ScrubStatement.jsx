import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import Glyph from '../primitives/Glyph';
import {
  EASE_LUXE_FN as EASE_LUXE,
  GX,
  SCRUB_SPRING,
  prefersReducedMotion,
  slot,
  useTrackProgress,
} from '../config/_base';

/* ══════════════════════════════════════════════════════════════════════════
   Ato 2 — v8. Reescrito de GSAP ScrollTrigger para Framer Motion (v7),
   refinado contra a referência "Superconscious" (v8: clearance de navbar,
   inércia de mola, tipografia da âncora/parágrafo, geometria de destino).

   Quatro estágios, todos amarrados ao progresso do scroll (nada é baseado em
   tempo — parar de rolar congela a cena exatamente onde está):

   1. CENTRO      as palavras acendem em sequência, glifos como pontuação.
   2. DISSOLVE    tudo sobe (y), desfoca (blur) e apaga — profundidade de
                  campo cinematográfica, não um fade seco.
   3. ÂNCORA      a última palavra NÃO dissolve: voa da posição inline até
                  travar na direita, centrada verticalmente.
   4. REVELAÇÃO   com a palavra travada, o parágrafo acende pela esquerda.

   ── Decisão 1: sticky em vez de pin do GSAP ───────────────────────────────
   A seção é um trilho de 400vh com um palco `sticky top-0 h-[100dvh]`. Some
   o `pin-spacer` que o ScrollTrigger injetava no DOM fora do controle do React
   — era ele o suspeito na nota do LPShell sobre refresh duplo e refs de
   Context lendo `null`. Sticky é layout nativo do browser: nada é inserido,
   nada precisa de refresh, e o Lenis continua funcionando porque roda sobre
   scroll nativo (só suaviza o delta da roda até o `scrollTop`).

   400vh (era 300vh) só estica o trilho — a coreografia inteira continua
   expressa em frações 0→1 do `STAGE`, então nada de proporção muda, só o
   quanto de scroll físico cabe em cada fração (mais distância por estágio =
   a cena "respira" mais antes de trocar de fase).

   ── Decisão 2: FLIP invertido para a âncora da direita ────────────────────
   O requisito é precisão absoluta no alinhamento — por isso o JS nunca
   calcula o destino: a palavra já NASCE no lugar final, posicionado por CSS
   puro (ver `ANCHOR_INSET` abaixo). O que se mede é a ORIGEM — um "ghost"
   invisível ocupando o lugar dela no fluxo da headline — e aplica-se a
   transformação INVERSA, que decai até a identidade.

   Em progresso 1, o transform é exatamente `translate(0,0) scale(1)`: a
   palavra está onde o layout do browser a colocou, com erro zero. Qualquer
   imprecisão de medição fica na origem, ou seja, no meio do voo — onde é
   invisível. O contrário (calcular o destino em JS, ex.: interpolar `x` de
   "0vw" a "25vw" num valor chutado) empilha erro justamente onde o olho
   descansa — e foi exatamente esse tipo de erro que cortou "amador" ao meio
   na v3 (ver histórico do arquivo). Trocar o CSS de destino (`ANCHOR_INSET`)
   continua seguro porque o FLIP mede o retângulo real, não um número fixo.

   ── Decisão 3: por que não `useScroll` ────────────────────────────────────
   Esta rota não rola a `window`: o LPShell rola um container próprio
   (`[data-lp-scroller]`, `overflow-y:auto`). O `useScroll` do Framer aceita
   `container`, mas exige um RefObject já populado no momento em que o hook
   monta — e este componente só descobre o scroller via `getScrollerEl()`
   (querySelector) depois do commit. `useTrackProgress` (agora em
   `config/_base.js` — PillarsShaped.jsx passou a precisar da mesma coisa,
   virou utilitário compartilhado) alimenta uma MotionValue diretamente, que
   passa por um `useSpring` antes de qualquer `useTransform` consumir — daí
   pra baixo é Framer Motion idiomático: `useTransform`, interpolação de
   cor, composição de transform.
   ══════════════════════════════════════════════════════════════════════════ */

/* Coreografia — janelas de progresso [início, fim] no trilho de 400vh.
   Estágios 2 e 3 começam juntos de propósito: a palavra final decola no mesmo
   instante em que as outras se desfazem, então o olho é entregue de uma para
   a outra sem intervalo morto. */
const STAGE = {
  reveal: [0.0, 0.46],
  dissolve: [0.46, 0.64],
  flight: [0.46, 0.75],
  paragraph: [0.7, 0.93],
};

const MAX_BLUR = 11;

const COLOR = {
  faint: '#5B6472',
  titanium: '#F8F9FA',
  slate: '#94A3B8',
  purple: '#A78BFA',
};

/* Headline — teto reduzido (era 7.5rem) e agora híbrido vw+dvh: 6.6vw sozinho
   crescia sem limite em telas largas e baixas (laptop em paisagem, janela
   maximizada 21:9) até colidir com a navbar fixa do LPShell, porque `vw` não
   sabe nada sobre altura disponível. Somar uma fração de `dvh` faz o mesmo
   texto encolher em viewports baixas mesmo que largas. */
const HEADLINE_SIZE = 'clamp(2.4rem, 4.4vw + 1.6dvh, 6.25rem)';
/* v9 — âncora maior (era `clamp(2.1rem, 5vw, 4.25rem)`): mais perto da
   escala da própria headline, pra pousar como uma segunda declaração, não
   como legenda do que acabou de sumir. O `Glyph` ao lado dela é 100% `em`
   (ver Glyph.jsx) — cresce na mesma proporção sem precisar mexer em mais
   nada.

   v10 — duas fórmulas, não uma: o pouso mudou de destino por breakpoint
   (ver a `<motion.span>` do Estágio 3 mais abaixo — mobile centraliza no
   meio da tela, desktop continua ancorado à direita), e cada destino pede
   uma escala diferente. Preso à direita, ao lado do parágrafo, a palavra
   precisa ficar comedida — grande demais ali brigaria com o texto vizinho.
   Centralizada sozinha no meio da tela, ela é a ÚNICA coisa na cena
   naquele instante — pode (e deve) ser maior sem brigar com nada. Testado
   contra o pior caso real (375px, "amador." + glifo): mesmo no teto de
   4.75rem cabe com folga numa linha só (`whitespace-nowrap` já garante que
   nunca quebra).

   Os dois valores vivem só como classes Tailwind (`text-[...] md:text-[...]`
   na própria `<motion.span>`), não como constantes aqui — o compilador JIT
   do Tailwind precisa ver a string LITERAL no código-fonte pra gerar o CSS;
   uma classe montada em runtime a partir de uma constante JS (`` `text-[${X}]` ``)
   não é encontrada por ele, e a fonte silenciosamente nunca aplicaria.
   Manter os dois valores só num lugar evita também a segunda forma de
   silenciosamente dessincronizar: uma constante aqui e uma classe lá que
   alguém edita e esquece de espelhar na outra. */
/* Estatura equivalente a um h3 grande — precisa ler como "declaração", não
   como legenda de rodapé de número. font-grotesk (mesma família da
   headline) em vez de satoshi: cria uma segunda voz, mais parruda, mas
   ainda parente da primeira — coerência tipográfica com a cena que ela
   fecha. */
/* Teto em 2.5rem, não os ~3.5rem que um `text-5xl` sugeriria — o parágrafo
   real desta LP tem ~35 palavras (4 frases curtas + 1 longa); numa coluna
   estreita e fonte maior que isso, o texto vira uma torre de 12+ linhas e
   perde exatamente o impacto de "declaração" que o tamanho deveria dar.
   Testado contra o texto real de `sites-institucionais.js`, não a média
   genérica de um hero de uma palavra. */
const PARAGRAPH_SIZE = 'clamp(1.375rem, 0.85rem + 2.1vw, 2.5rem)';

/* Reserva de topo abaixo da navbar pílula do LPShell (~64-86px conforme o
   estado scrolled) — mesma lógica de clamp vh+rem que a navbar já usa pra si
   mesma, aplicada aqui como padding-top do bloco que centraliza a headline.
   Como o wrapper é `inset-0` com `flex items-center`, padding-top tira
   espaço só do lado de cima da conta de centralização — o efeito líquido é
   empurrar o centro visual pra baixo, para longe da navbar, sem mexer no
   posicionamento de mais nada na cena. */
const NAV_CLEARANCE = 'clamp(6rem, 8rem + 4dvh, 10.5rem)';

/* Destino da âncora — inset extra ALÉM do gutter `GX` (6vw) da seção, pra
   não ficar "colada" na borda do próprio gutter. `CONTENT_MAX_W` trava o
   conteúdo numa coluna central em monitores ultrawide, senão right:0 dentro
   de uma seção full-bleed manda a palavra pro canto físico da tela, que é
   exatamente a leitura de "descontrolado" que se queria evitar — não porque
   o valor em si fosse impreciso (o FLIP mede o rect real, sempre exato),
   mas porque o alvo escolhido era mesmo o pior lugar visualmente. */
const ANCHOR_INSET = 'clamp(0.5rem, 3vw, 3rem)';
const CONTENT_MAX_W = '1560px';

/* ── Palavra cinética ─────────────────────────────────────────────────────
   Acende dentro da sua fatia e, se receber `dissolve`, sobe + desfoca + apaga.
   O filtro vira literalmente `none` quando o blur é desprezível: manter
   `blur(0px)` obrigaria o compositor a sustentar uma camada de filtro sobre
   tipografia gigante durante todo o Estágio 1, que é o trecho mais longo da
   cena. Só se paga o custo no instante em que ele aparece na tela. */
function KineticWord({ progress, reveal, dissolve, accent = false, className = '', children }) {
  const opacity = useTransform(
    progress,
    dissolve ? [reveal[0], reveal[1], dissolve[0], dissolve[1]] : reveal,
    dissolve ? [0, 1, 1, 0] : [0, 1],
  );

  const color = useTransform(progress, reveal, [COLOR.faint, accent ? COLOR.purple : COLOR.titanium]);

  const y = useTransform(progress, dissolve || [0, 1], dissolve ? [0, -90] : [0, 0], {
    ease: dissolve ? EASE_LUXE : undefined,
  });

  const blur = useTransform(progress, dissolve || [0, 1], dissolve ? [0, MAX_BLUR] : [0, 0]);
  const filter = useTransform(blur, (v) => (v < 0.06 ? 'none' : `blur(${v.toFixed(2)}px)`));

  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{ opacity, color, y, filter, willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.span>
  );
}

/* Glifo que participa da mesma coreografia das palavras (pontuação, não UI).
   `pulseDelay` só desincroniza a respiração (`rv-glyph-pulse`, ver Glyph.jsx)
   — variação barata pra não ler como um único elemento clonado 3x. */
function KineticGlyph({ progress, reveal, dissolve, name, pulseDelay = 0 }) {
  const opacity = useTransform(progress, [reveal[0], reveal[1], dissolve[0], dissolve[1]], [0, 1, 1, 0]);
  const y = useTransform(progress, dissolve, [0, -90], { ease: EASE_LUXE });
  const blur = useTransform(progress, dissolve, [0, MAX_BLUR]);
  const filter = useTransform(blur, (v) => (v < 0.06 ? 'none' : `blur(${v.toFixed(2)}px)`));

  return (
    <motion.span
      aria-hidden
      className="mx-[0.18em] inline-block align-middle"
      style={{ opacity, y, filter, willChange: 'transform, opacity, filter' }}
    >
      <Glyph name={name} spin glow pulseDelay={pulseDelay} />
    </motion.span>
  );
}

/* ── Parágrafo da esquerda (Estágio 4) ────────────────────────────────────
   Acende palavra a palavra amarrado ao scroll. `_palavra_` marca destaque em
   roxo — mesma convenção do resto da marca. Tipografia deliberadamente mais
   pesada que `TYPE.body` (a legenda padrão da marca): esta é a segunda
   metade de uma declaração de duas partes com a palavra travada à direita
   ("...amador." / "O paciente [...] julgam sua credibilidade..."), não uma
   legenda de apoio — precisa ler como a mesma ordem de grandeza. */
function ScrubParagraph({ progress, text, range }) {
  const words = useMemo(() => text.split(' '), [text]);

  return (
    <p
      className="text-left font-grotesk font-medium leading-[1.16] tracking-[-0.01em]"
      style={{ fontSize: PARAGRAPH_SIZE }}
    >
      {words.map((raw, i) => {
        const accent = raw.startsWith('_') && raw.endsWith('_');
        const clean = accent ? raw.slice(1, -1) : raw;
        const reveal = slot(range, i, words.length, 0.35);
        return (
          <ParagraphWord key={i} progress={progress} reveal={reveal} accent={accent}>
            {clean}
          </ParagraphWord>
        );
      })}
    </p>
  );
}

function ParagraphWord({ progress, reveal, accent, children }) {
  const opacity = useTransform(progress, reveal, [0, 1]);
  const color = useTransform(progress, reveal, [COLOR.faint, accent ? COLOR.purple : COLOR.titanium]);
  const y = useTransform(progress, reveal, [16, 0], { ease: EASE_LUXE });
  const blur = useTransform(progress, reveal, [4, 0]);
  const filter = useTransform(blur, (v) => (v < 0.06 ? 'none' : `blur(${v.toFixed(2)}px)`));

  return (
    <motion.span
      className="mr-[0.26em] inline-block"
      style={{ opacity, color, y, filter, willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.span>
  );
}

/* Brilhos violeta ambientes — altamente difusos, dentro da regra dos 5%. */
function AmbientGlow({ progress }) {
  const scale = useTransform(progress, [0, 1], [1, 1.85]);
  const opacity = useTransform(progress, [0, 0.5, 1], [0.42, 0.6, 0.32]);
  const drift = useTransform(progress, [0.4, 1], ['0%', '18%'], { ease: EASE_LUXE });

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[75vh] origin-bottom"
        style={{
          scale,
          opacity,
          background: 'radial-gradient(ellipse at 50% 118%, rgba(124,58,237,0.5), transparent 64%)',
          willChange: 'transform, opacity',
        }}
      />
      {/* O deslocamento vertical vem do próprio Framer (`y: '-50%'`), não de
          `-translate-y-1/2`: o Framer escreve a propriedade `transform`
          inteira, e a classe do Tailwind seria sobrescrita sem aviso. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-[10vw] top-1/2 h-[70vh] w-[55vw]"
        style={{
          x: drift,
          y: '-50%',
          background: 'radial-gradient(circle at 60% 50%, rgba(124,58,237,0.28), transparent 66%)',
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
      />
    </>
  );
}

export default function ScrubStatement({ data }) {
  const trackRef = useRef(null);
  const ghostRef = useRef(null);
  const anchorRef = useRef(null);

  const reduced = useMemo(() => prefersReducedMotion(), []);
  const rawProgress = useTrackProgress(trackRef, reduced);
  // Amortece o scrub — a cena persegue o progresso real em vez de segui-lo
  // 1:1, dando inércia de "câmera pesada" em vez de rigidez pixel-a-pixel.
  // Overdamped (ver SCRUB_SPRING em config/_base.js) por construção: nunca
  // ultrapassa o alvo, então tudo que consome `progress` abaixo
  // (opacity/blur/scale) continua garantido dentro de [0,1] mesmo com a
  // mola por cima. Sempre chamado (não só quando `!reduced`) porque hooks
  // não podem ser condicionais — com `rawProgress` já parado em 1 no modo
  // reduzido, a mola nasce no alvo e não anima nada.
  const progress = useSpring(rawProgress, SCRUB_SPRING);

  const tokens = useMemo(
    () => data.headlineTokens.map((t) => (typeof t === 'string' ? { text: t } : t)),
    [data.headlineTokens],
  );
  const persistToken = useMemo(() => tokens.find((t) => t.persist), [tokens]);

  // Índice de coreografia: só conta o que anima (quebras de linha ficam de fora).
  const animatable = useMemo(() => tokens.filter((t) => !t.br), [tokens]);
  const indexOf = useCallback((token) => animatable.indexOf(token), [animatable]);

  /* FLIP: mede a ORIGEM (ghost inline) contra o DESTINO (posição real de CSS).
     `transform-origin: right center` faz a borda direita e o centro vertical
     serem invariantes ao scale — por isso o delta é simplesmente a diferença
     entre as bordas direitas e entre os centros verticais, sem correção. */
  const [flip, setFlip] = useState(null);

  useLayoutEffect(() => {
    if (!persistToken) return undefined;

    const measure = () => {
      const ghost = ghostRef.current;
      const anchor = anchorRef.current;
      if (!ghost || !anchor) return;

      /* A âncora vive PERMANENTEMENTE sob o transform do voo — o Framer
         reescreve `style.transform` dela a cada frame (x/y/scale/rotate).
         `getBoundingClientRect()` devolve a caixa JÁ TRANSFORMADA, então
         medir sem neutralizar grava um flip calculado contra a posição
         momentânea da palavra em vez da posição de layout dela.

         Isso não é hipotético e não depende de o scroll estar parado no
         lugar errado: `flightY` e `flightRotate` NÃO dependem de `flip`
         (são [0,-46,0] e [0,-4,0] literais), então já valem -46px e -4°
         no meio do voo mesmo na primeiríssima medição. Qualquer measure()
         disparado nesse instante nasce errado — medido em 1440x900: 39px
         de erro vertical e 5px de largura, o bastante pra palavra decolar
         visivelmente fora do título.

         E o disparo tardio é justamente o que separa visita nova de
         visita com cache. As fontes carregam com `display=optional` (ver
         landing-pages.html): na primeira visita elas perdem a janela de
         ~100ms e o navegador trava o fallback pelo resto da sessão — nada
         refluxa depois, nenhum re-measure tardio acontece. Na visita
         seguinte a fonte já está em cache, entra assim que o `<link>`
         vira `media="all"`, o texto refluxa e o ResizeObserver abaixo
         redispara measure() — se a pessoa já começou a rolar, isso cai
         exatamente dentro da janela de voo. Era este o bug de "só quebra
         quando não é a primeira visita".

         Neutralizar é escrita → leitura → restauração no MESMO task,
         antes de qualquer paint: não há flash, e o Framer reescreve o
         valor dele no frame seguinte de qualquer forma. */
      const prevTransform = anchor.style.transform;
      anchor.style.transform = 'none';
      const a = anchor.getBoundingClientRect();
      const g = ghost.getBoundingClientRect();
      anchor.style.transform = prevTransform;

      if (!a.width || !g.width) return;

      const next = {
        x: g.right - a.right,
        y: g.top + g.height / 2 - (a.top + a.height / 2),
        scale: g.width / a.width,
      };

      /* Só re-renderiza se a medida mudou de verdade. O ResizeObserver
         dispara em qualquer reflow da vizinhança e, sem esta comparação,
         cada disparo recriaria as MotionValues do voo à toa. */
      setFlip((prev) =>
        prev &&
        Math.abs(prev.x - next.x) < 0.5 &&
        Math.abs(prev.y - next.y) < 0.5 &&
        Math.abs(prev.scale - next.scale) < 0.001
          ? prev
          : next,
      );
    };

    // useLayoutEffect roda antes do paint e o setState aqui é aplicado de forma
    // síncrona no mesmo commit — a palavra nunca aparece um frame no destino
    // antes de recuar para a origem.
    measure();

    const ro = new ResizeObserver(measure);
    if (ghostRef.current) ro.observe(ghostRef.current);
    if (anchorRef.current) ro.observe(anchorRef.current);
    window.addEventListener('resize', measure);

    // Reforço contra a corrida de fonte: o `<link>` da ClashGrotesk/Satoshi
    // carrega de forma NÃO-bloqueante (`media="print" onload="this.media='all'"`
    // — decisão deliberada pra não travar o LCP na fonte), então a medida
    // síncrona acima pode rodar com métricas da fonte de fallback.
    //
    // `fonts.ready` sozinho NÃO cobre isso: enquanto o `<link>` ainda está
    // em `media="print"`, as regras `@font-face` nem foram registradas, não
    // há nenhum download pendente e a promise resolve NA HORA — feliz e
    // inútil, porque a fonte real ainda vai entrar depois. `loadingdone`
    // fecha essa brecha: dispara quando o conjunto de fontes efetivamente
    // termina de carregar, inclusive nas que só foram descobertas quando o
    // stylesheet virou `media="all"`. Os dois juntos + o ResizeObserver
    // cobrem as três ordens possíveis de chegada.
    //
    // `document.fonts` pode não existir (Safari antigo, browsers exóticos) —
    // daí o optional chaining; sem a API, o ResizeObserver continua sendo a
    // rede de segurança.
    document.fonts?.ready?.then(measure);
    document.fonts?.addEventListener?.('loadingdone', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      document.fonts?.removeEventListener?.('loadingdone', measure);
    };
  }, [persistToken]);

  // Enquanto não há medida, a âncora fica com opacidade 0 (ver `anchorOpacity`
  // mais abaixo) em vez de usar a transformação identidade como fallback
  // visível — "nunca aparecer" é um fallback seguro; "aparecer já no
  // destino, sem ter voado" É o próprio bug que motivou este ajuste, então
  // não faz sentido continuar sendo o comportamento de rede de segurança.
  const flightX = useTransform(progress, STAGE.flight, [flip?.x ?? 0, 0], { ease: EASE_LUXE });

  /* v9 — arco em vez de linha reta: `flightY` ganha um terceiro ponto no
     meio do voo, deslocado pra cima além da posição final (`ARC_LIFT`), e
     só desce pro pouso no último trecho — a mesma trajetória de algo
     arremessado, não empurrado em linha reta. Precisa de 3 valores tanto no
     domínio (progresso) quanto na imagem (posição) — 2 pontos só dão uma
     reta. `flightMid` é o ponto médio do estágio, não um número solto. */
  const flightMid = (STAGE.flight[0] + STAGE.flight[1]) / 2;
  const ARC_LIFT = 46;
  const flightY = useTransform(
    progress,
    [STAGE.flight[0], flightMid, STAGE.flight[1]],
    [flip?.y ?? 0, (flip?.y ?? 0) * 0.5 - ARC_LIFT, 0],
    { ease: EASE_LUXE },
  );
  const flightScale = useTransform(progress, STAGE.flight, [flip?.scale ?? 1, 1], { ease: EASE_LUXE });

  /* Rotação só existe DURANTE o voo — 3 pontos (0 → -4 → 0), não 2 (-4 → 0).
     Bug real da v9 anterior: `useTransform` com um range de 2 pontos clampa
     no PRIMEIRO valor pra qualquer progresso ANTES do range começar — como
     esse primeiro valor era `-4`, a palavra ficava girada -4° o tempo TODO
     em que deveria estar quieta, fundida no título (Estágio 1 inteiro,
     antes do voo sequer começar). É exactly o tipo de coisa que faz "amador"
     não ler como parte do título: pra quem está olhando, ela nunca esteve
     alinhada com as palavras ao lado. Com 0 como primeiro valor, o clamp
     pré-voo agora é 0° — idêntico ao resto do título — e a rotação só entra
     como um floreio DURANTE a viagem, desarmando de novo no pouso. Pivota
     no mesmo `transformOrigin: right center` do resto da âncora. */
  const flightRotate = useTransform(progress, [STAGE.flight[0], flightMid, STAGE.flight[1]], [0, -4, 0], {
    ease: EASE_LUXE,
  });

  /* Blur de "chicote" — sobe no meio do voo (mais rápido = mais borrado) e
     zera nas duas pontas, igual ao dissolve das outras palavras, mas usado
     aqui pra dar peso ao movimento em vez de fazer a palavra sumir. Mesmo
     truque de "vira `none` quando desprezível" das outras animações — não
     paga o custo de uma camada de filtro fora da janela em que ela importa. */
  const flightBlurRaw = useTransform(progress, [STAGE.flight[0], flightMid, STAGE.flight[1]], [0, 5.5, 0]);
  const flightFilter = useTransform(flightBlurRaw, (v) => (v < 0.06 ? 'none' : `blur(${v.toFixed(2)}px)`));

  /* Flash de pouso — halo de texto que acende bem no fim do voo e apaga em
     seguida, pra puxar o olho no exato instante em que a palavra assenta
     (o "mais chamativo" pedido). Não é contínuo — um pulso só, sincronizado
     ao MESMO `progress` de tudo o mais, então também congela se o scroll
     parar no meio dele. */
  const landingAt = STAGE.flight[1] - 0.025;
  const landingGlowRaw = useTransform(progress, [landingAt - 0.05, landingAt, landingAt + 0.1], [0, 1, 0]);
  const landingGlow = useTransform(landingGlowRaw, (v) =>
    v < 0.03 ? 'none' : `0 0 ${(20 * v).toFixed(1)}px rgba(167,139,250,${(0.85 * v).toFixed(2)})`,
  );

  const anchorReveal = persistToken ? slot(STAGE.reveal, indexOf(persistToken), animatable.length) : STAGE.reveal;
  // `flip ? 1 : 0` como alvo final — enquanto a medida não chegou, o range
  // inteiro vai de 0 a 0 (invisível em qualquer progresso), em vez de 0→1.
  // Assim que `flip` resolve, o próximo render já recria esta MotionValue
  // mirando 0→1 de verdade, e ela nasce direto no valor correto pro
  // progresso atual — nunca existe um frame pintado na posição errada.
  const anchorOpacity = useTransform(progress, anchorReveal, [0, flip ? 1 : 0]);
  const anchorColor = useTransform(progress, anchorReveal, [COLOR.faint, COLOR.purple]);

  return (
    <section
      ref={trackRef}
      aria-labelledby="scrub-statement-title"
      className="relative h-[400dvh] bg-rv-void"
    >
      {/* Palco: uma viewport de altura, colado no topo enquanto o trilho passa.
          `dvh` e não `vh`: o container de scroll do LPShell tem `100dvh`, e no
          mobile `100vh` é maior que isso (conta a barra do navegador que se
          recolhe) — o palco ficaria alguns pixels mais alto que a viewport e
          deslizaria de leve em vez de ficar perfeitamente travado. */}
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <AmbientGlow progress={progress} />

        {/* `CONTENT_MAX_W` + `mx-auto`: trava a cena numa coluna central em
            monitores ultrawide. Sem isso, `right:0`/`left:0` dos filhos
            absolutos abaixo alinhariam contra o edge físico da viewport
            inteira — a âncora e o parágrafo ficariam grudados nas bordas
            reais da tela em vez de dentro de uma moldura editorial. */}
        <div className={`relative z-10 mx-auto h-full ${GX}`} style={{ maxWidth: CONTENT_MAX_W }}>
          {/* ── Estágios 1 e 2 ─────────────────────────────────────────── */}
          {/* `paddingTop: NAV_CLEARANCE` empurra o centro visual pra baixo,
              longe da navbar pílula fixa do LPShell — como o wrapper é
              `inset-0` + `items-center`, padding-top só consome espaço do
              lado de cima da conta de centralização (ver nota da constante,
              no topo do arquivo). */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: NAV_CLEARANCE }}>
            <h2
              id="scrub-statement-title"
              className="mx-auto max-w-5xl text-center font-grotesk font-light leading-[1.18] tracking-[-0.025em]"
              style={{ fontSize: HEADLINE_SIZE }}
            >
              {tokens.map((token, i) => {
                if (token.br) return <br key={i} />;

                const idx = indexOf(token);
                const reveal = slot(STAGE.reveal, idx, animatable.length);
                const dissolve = slot(STAGE.dissolve, idx, animatable.length, 0.45);

                if (token.persist) {
                  /* Ghost: reserva no fluxo o espaço exato da palavra final e
                     serve de alvo de medição. Precisa continuar ocupando
                     layout (mantém a quebra de linha idêntica e dá um rect
                     mensurável), então nada de `display:none`.

                     `opacity-0` e não `invisible`: `visibility:hidden` tiraria
                     o nó da árvore de acessibilidade e a frase chegaria
                     truncada no leitor de tela ("...quem parece" sem
                     "amador."). Com opacity o ghost segue lido aqui, no lugar
                     certo da sentença, e é a cópia visível da direita que
                     leva `aria-hidden`. */
                  return (
                    <span
                      key={i}
                      ref={ghostRef}
                      className="pointer-events-none mx-[0.18em] inline-flex select-none items-center gap-[0.3em] align-middle opacity-0"
                    >
                      {/* `nudge={false}`: este glifo vive num `inline-flex
                          items-center`, não em fluxo de texto normal — ver
                          nota do BASELINE_NUDGE em Glyph.jsx. */}
                      <Glyph name={token.glyph} nudge={false} />
                      <span>{token.text}</span>
                    </span>
                  );
                }

                if (token.glyph) {
                  return (
                    <KineticGlyph
                      key={i}
                      progress={progress}
                      reveal={reveal}
                      dissolve={dissolve}
                      name={token.glyph}
                      pulseDelay={idx * 0.35}
                    />
                  );
                }

                return (
                  <KineticWord
                    key={i}
                    progress={progress}
                    reveal={reveal}
                    dissolve={dissolve}
                    accent={token.accent}
                    className="mr-[0.26em]"
                  >
                    {token.text}
                  </KineticWord>
                );
              })}
            </h2>
          </div>

          {/* ── Estágio 3: a âncora ─────────────────────────────────────────
              O wrapper faz LAYOUT; o filho faz MOVIMENTO (transform).
              Separar os dois garante que, em repouso, o alinhamento não
              depende de nenhuma conta em JS.

              v10 — destino por breakpoint, não só tamanho por breakpoint:
                MOBILE   `inset-0 flex items-center justify-center` — a
                         palavra pousa centralizada na tela inteira. Era
                         `right: ANCHOR_INSET` + `items-start pt-[16vh]` (o
                         mesmo destino ancorado à direita do desktop, só que
                         empurrado pro topo) — nesse layout ela pousava
                         espremida no canto superior direito, perto da
                         navbar, longe do parágrafo que vem embaixo: lia
                         como fora do lugar, não como uma segunda declaração.
                DESKTOP  continua igual — `inset-y-0` + `right: ANCHOR_INSET`,
                         centralizada verticalmente, ancorada à direita, ao
                         lado do parágrafo à esquerda.
              O FLIP (`flip.x/y/scale`, calculado contra o retângulo REAL do
              `anchorRef`) não precisa saber de nada disso — ele mede
              qualquer que seja a posição final renderizada, então o voo
              continua correto nos dois destinos sem lógica condicional
              própria. */}
          {persistToken && (
            <div
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center md:inset-x-auto md:right-[var(--anchor-inset)]"
              style={{ '--anchor-inset': ANCHOR_INSET }}
            >
              <motion.span
                ref={anchorRef}
                aria-hidden
                className="inline-flex origin-center items-center gap-[0.3em] whitespace-nowrap text-[clamp(3.5rem,15vw,4.75rem)] font-grotesk font-light tracking-[-0.025em] md:origin-right md:text-[clamp(2.75rem,6.4vw,5.75rem)]"
                style={{
                  x: flightX,
                  y: flightY,
                  scale: flightScale,
                  rotate: flightRotate,
                  filter: flightFilter,
                  opacity: anchorOpacity,
                  color: anchorColor,
                  textShadow: landingGlow,
                  willChange: 'transform, opacity, filter',
                }}
              >
                {/* `nudge={false}`: mesmo `inline-flex items-center` do
                    ghost acima — ver nota do BASELINE_NUDGE em Glyph.jsx. */}
                <Glyph name={persistToken.glyph} spin glow nudge={false} />
                {persistToken.text}
              </motion.span>
            </div>
          )}

          {/* ── Estágio 4: revelação pela esquerda ──────────────────────────
              Mesmo `ANCHOR_INSET` do lado direito — moldura simétrica com a
              palavra travada, em vez de dois valores arbitrários diferentes
              que por acaso ficam parecidos. Largura sobe em relação à v7
              (era `26rem`/`lg` no teto) pra acomodar `PARAGRAPH_SIZE` maior
              sem virar uma coluna de 12+ linhas — ver nota da constante. */}
          <div
            className="pointer-events-none absolute inset-y-0 z-10 flex max-w-[min(90vw,28rem)] items-end pb-[14vh] sm:max-w-md md:max-w-xl md:items-center md:pb-0 lg:max-w-2xl"
            style={{ left: ANCHOR_INSET }}
          >
            <ScrubParagraph progress={progress} text={data.paragraph} range={STAGE.paragraph} />
          </div>
        </div>
      </div>
    </section>
  );
}
