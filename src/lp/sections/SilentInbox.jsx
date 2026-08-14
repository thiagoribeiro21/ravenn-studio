import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cubicBezier, motion, useSpring, useTransform } from 'framer-motion';
import {
  EASE_LUXE_FN as EASE_LUXE,
  GX,
  SCRUB_SPRING,
  TYPE,
  prefersReducedMotion,
  slot,
  useTrackProgress,
} from '../config/_base';

/* ══════════════════════════════════════════════════════════════════════════
   Ato 3 — "O WhatsApp que não toca". Substituiu CostReveal.jsx.

   ── Por que a cena anterior saiu ──────────────────────────────────────────
   CostReveal fazia texto-acendendo-palavra-a-palavra sobre partículas. O Ato
   2 (ScrubStatement) faz exatamente isso logo antes — dois atos seguidos com
   o mesmo truque diluem o impacto justo no beat que deveria doer mais (é
   aqui que a dor vira urgência, antes de o Bento apresentar a solução). Além
   disso a cena era 100% metáfora abstrata: nenhum mecanismo, nenhuma prova.

   ── Por que ESTA cena ─────────────────────────────────────────────────────
   A LP inteira converte por um caminho só: WhatsApp. Encenar a dor DENTRO
   do WhatsApp faz a dor e a solução falarem a mesma língua visual — quando
   o CTA aparece, o leitor já viu a tela que ele quer ter. Duas metades:

     PERDA   leads tentam chegar e evaporam antes de virar conversa;
             a lista fica em "Nenhuma mensagem nova".
     GANHO   a mesma tela recebendo conversa de verdade, uma atrás da outra.

   ── Por que DOM/SVG e não canvas de frames ────────────────────────────────
   O conteúdo é interface (moldura, bolha, texto), não material fotográfico.
   Em DOM: nítido em qualquer densidade de tela, texto editável direto no
   config (trocar a copy por nicho é edição de string, não re-exportar 97
   webp como a cena antiga exigia) e alguns KB em vez de ~900KB. Como esta LP
   é MOLDE pra outros serviços, "clonar sem produzir mídia nova" é requisito.

   ── Movimento ─────────────────────────────────────────────────────────────
   Trilho `sticky` + `useTrackProgress` (padrão do Ato 2, sem pin do GSAP —
   ver Decisão 1 em ScrubStatement.jsx: some o pin-spacer injetado fora do
   controle do React). Duas camadas de movimento que NUNCA se misturam no
   mesmo elemento, porque o Framer escreve a propriedade `transform` inteira
   e uma sobrescreveria a outra sem aviso:
     • amarrado ao scroll  → wrapper externo (entrada, giro, profundidade)
     • vida própria em loop → wrapper interno (flutuação, respiro do glow,
       digitação) — é o que impede a cena de "morrer" se o scroll parar.
   ══════════════════════════════════════════════════════════════════════════ */

/* Janelas de progresso no trilho. `gain` começa ANTES de `turn` acabar: as
   conversas reais já estão subindo enquanto a tela antiga termina de sair —
   sem esse cruzamento existe um vão de alguns frames com a tela vazia, que
   lê como bug de carregamento em vez de transição. */
const STAGE = {
  enter: [0.0, 0.22],
  loss: [0.18, 0.5],
  turn: [0.5, 0.66],
  gain: [0.6, 0.86],
};

/* Curva da entrada — deliberadamente diferente de `EASE_LUXE` (a curva padrão
   da marca, calibrada pra UI que responde rápido): aqui o pedido é cena de
   abertura de filme, quase toda a aceleração early e uma cauda de chegada
   bem mais longa que EASE_LUXE entrega. Mesma família usada no showcase de
   vídeo do ConceptStack (Ato 5), reaproveitada aqui pelo mesmo motivo.

   `cubicBezier(...)` e não a tupla crua `[0.16, 1, 0.22, 1]`: `useTransform`
   espera uma EasingFunction de verdade — passar a tupla direto é lida como
   um ARRAY DE EASINGS POR SEGMENTO (uma por par de pontos do range), e com
   um range de 2 pontos (1 segmento só) os elementos 3 e 4 da tupla viram
   "easings" que não são função nenhuma → quebra em runtime ("a is not a
   function"). Mesma pegadinha já documentada em `EASE_LUXE_FN`, config/_base.js. */
const CINEMATIC_EASE = cubicBezier(0.16, 1, 0.22, 1);

const WA_GREEN = '#25D366';
/* Fundo real do WhatsApp em modo escuro — não um cinza genérico. O
   reconhecimento instantâneo é justamente o que faz a cena funcionar. */
const WA_BG = '#0B141A';

const blurFilter = (v) => (v < 0.06 ? 'none' : `blur(${v.toFixed(2)}px)`);

/* ── Pose 3D do aparelho ──────────────────────────────────────────────────
   Ele nunca fica de frente: nasce muito torto (quase de perfil), assenta numa
   inclinação de vitrine e só se APROXIMA da frente no instante da virada —
   girar em direção ao leitor exatamente quando a boa notícia aparece é a
   própria narrativa em movimento, e de quebra deixa a tela de ganho mais
   legível que a de perda, que é a hierarquia que se quer.

   Voltar a -12° depois (em vez de ficar em -5°) mantém o objeto lido como
   volume tridimensional até o fim; parado de frente ele viraria um retângulo
   chapado e perderia toda a presença física. */
const TILT = { born: -52, rest: -19, turned: -5, settled: -12 };

/* ── Moldura do aparelho ──────────────────────────────────────────────────
   O realismo mora no trilho metálico: um gradiente de 7 paradas alternando
   claro/escuro simula luz batendo em ângulos diferentes ao redor do alumínio
   — um gradiente de 2 paradas lê como plástico chapado. A dupla borda
   (moldura → bisel preto → tela) é o que dá espessura física; sem o bisel
   intermediário a tela parece adesivada por cima do aparelho. */
const FRAME_RAIL =
  'linear-gradient(152deg, #9a9aa8 0%, #2b2b34 13%, #15151b 32%, #62626e 50%, #17171d 66%, #3a3a45 84%, #8b8b99 100%)';

const FRAME_SHADOW = [
  '0 2px 6px rgba(0,0,0,0.5)',
  '0 40px 80px -14px rgba(0,0,0,0.85)',
  '0 80px 150px -32px rgba(0,0,0,0.92)',
  '0 0 0 1px rgba(255,255,255,0.06)',
].join(', ');

/* Paleta dos avatares — variar a cor por contato é o que faz a lista ler como
   gente de verdade em vez de linhas clonadas. Verde fora de propósito: ali
   ele é reservado ao sinal de "mensagem nova", e diluí-lo em avatar mataria
   o único acento cromático que a cena guarda pro clímax. */
const AVATAR_TONES = [
  'linear-gradient(145deg, #3d6d8f, #1d3243)',
  'linear-gradient(145deg, #7a5a8f, #33243f)',
  'linear-gradient(145deg, #8f6a4a, #3f2e20)',
];

function SideButtons() {
  const rail = 'absolute rounded-[2px] bg-gradient-to-b from-[#6c6c7a] via-[#26262e] to-[#55555f]';
  return (
    <span aria-hidden>
      <span className={`${rail} left-[-2px] top-[13%] h-[3.2%] w-[2.5px]`} />
      <span className={`${rail} left-[-2px] top-[19%] h-[6%] w-[2.5px]`} />
      <span className={`${rail} left-[-2px] top-[27%] h-[6%] w-[2.5px]`} />
      <span className={`${rail} right-[-2px] top-[22%] h-[9%] w-[2.5px]`} />
    </span>
  );
}

function StatusBar() {
  return (
    <div className="flex shrink-0 items-center justify-between px-[1.05em] pb-[0.2em] pt-[0.75em]">
      <span className="font-satoshi text-[0.58em] font-semibold tracking-tight text-white/95">21:47</span>
      <span aria-hidden className="flex items-center gap-[0.16em]">
        {[0.22, 0.32, 0.42, 0.52].map((h) => (
          <span key={h} className="w-[0.1em] rounded-full bg-white/85" style={{ height: `${h}em` }} />
        ))}
        <span className="ml-[0.28em] flex h-[0.5em] w-[0.95em] items-center rounded-[0.14em] border border-white/55 p-[0.07em]">
          <span className="h-full w-[72%] rounded-[0.06em] bg-white/90" />
        </span>
      </span>
    </div>
  );
}

/* Cabeçalho do app — fica FIXO nas duas metades de propósito. É a moldura que
   prova que é a mesma caixa de entrada, o mesmo aparelho, a mesma pessoa —
   só o resultado é que mudou. Trocar o cabeçalho junto leria como "outro
   app", e a comparação inteira perderia o pé. */
function AppHeader() {
  return (
    <div className="shrink-0 px-[0.85em] pb-[0.5em] pt-[0.3em]">
      <div className="flex items-center justify-between">
        <span className="font-satoshi text-[0.82em] font-bold tracking-tight text-white">WhatsApp</span>
        <span aria-hidden className="flex items-center gap-[0.5em] text-white/60">
          <svg width="0.62em" height="0.62em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <svg width="0.62em" height="0.62em" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="12" cy="19" r="1.8" />
          </svg>
        </span>
      </div>

      {/* barra de busca — detalhe que "assina" o app sem pedir atenção */}
      <div
        className="mt-[0.5em] flex items-center gap-[0.4em] rounded-full px-[0.6em] py-[0.34em]"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <svg width="0.5em" height="0.5em" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.6">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span className="font-satoshi text-[0.58em] text-white/30">Pesquisar</span>
      </div>
    </div>
  );
}

/* ── Lead que evapora ─────────────────────────────────────────────────────
   Entra por baixo do cabeçalho, desce em direção à lista e se desfaz ANTES
   de pousar: some no meio do caminho, nunca chega a virar linha da conversa.
   O gesto inteiro é a frase "ele veio, mas não chegou até você" — por isso o
   desfoque e o encolhimento crescem no fim, em vez de um fade seco (fade
   seco lê como elemento sumindo; desfoque + queda lê como algo se perdendo). */
function GhostLead({ progress, window: win, text }) {
  const [from, to] = win;
  const mid = from + (to - from) * 0.45;

  const opacity = useTransform(progress, [from, mid, to], [0, 0.95, 0]);
  const y = useTransform(progress, [from, to], ['-0.2em', '4.6em'], { ease: EASE_LUXE });
  const scale = useTransform(progress, [from, mid, to], [0.96, 1, 0.88]);
  const blur = useTransform(progress, [from, mid, to], [3, 0, 9]);
  const filter = useTransform(blur, blurFilter);

  return (
    <motion.div
      className="absolute inset-x-[0.6em] flex items-center gap-[0.5em] rounded-[0.7em] border border-white/[0.12] px-[0.6em] py-[0.5em]"
      style={{
        opacity,
        y,
        scale,
        filter,
        background: 'linear-gradient(180deg, rgba(42,56,68,0.97), rgba(20,28,35,0.92))',
        boxShadow: '0 0.7em 1.6em -0.5em rgba(0,0,0,0.85)',
        willChange: 'transform, opacity, filter',
      }}
    >
      <span
        aria-hidden
        className="relative flex h-[1.6em] w-[1.6em] shrink-0 items-center justify-center rounded-full"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <svg width="0.75em" height="0.75em" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="2">
          <circle cx="12" cy="8" r="3.6" />
          <path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-satoshi text-[0.64em] font-medium text-white/50">{text}</span>
        <span aria-hidden className="mt-[0.3em] block h-[0.16em] w-[62%] rounded-full bg-white/[0.1]" />
      </span>
    </motion.div>
  );
}

/* Estado vazio — o ponto mais silencioso da cena. Respira devagar (loop
   próprio, independente do scroll) pra não virar um print morto se a pessoa
   parar de rolar exatamente aqui. */
function EmptyState({ label, reduce }) {
  return (
    <div className="absolute inset-x-0 bottom-[12%] flex flex-col items-center gap-[0.55em]">
      <motion.span
        aria-hidden
        className="flex h-[2.6em] w-[2.6em] items-center justify-center rounded-full border border-white/[0.08]"
        style={{ background: 'rgba(255,255,255,0.03)' }}
        animate={reduce ? {} : { opacity: [0.4, 0.85, 0.4], scale: [1, 1.06, 1] }}
        transition={reduce ? {} : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="1.15em" height="1.15em" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.7">
          <path
            d="M21 11.5a8.4 8.4 0 01-9 8.4 9 9 0 01-4-.9L3 21l1.9-4.6A8.4 8.4 0 013 11.5a8.4 8.4 0 019-8.4 8.4 8.4 0 019 8.4z"
            strokeLinejoin="round"
          />
        </svg>
      </motion.span>
      <span className="font-satoshi text-[0.64em] font-medium tracking-wide text-white/28">{label}</span>
    </div>
  );
}

/* ── Conversa que chega e FICA ────────────────────────────────────────────
   Oposto exato do GhostLead: sobe, ganha nitidez e para. O badge verde entra
   DEPOIS da linha, com mola — é o micro-momento de recompensa da cena, e
   chegar junto com a linha desperdiçaria o segundo tempo. */
function ChatRow({ progress, window: win, chat, tone, reduce }) {
  const [from, to] = win;
  const opacity = useTransform(progress, [from, to], [0, 1]);
  const y = useTransform(progress, [from, to], ['1.4em', '0em'], { ease: EASE_LUXE });
  const blur = useTransform(progress, [from, to], [5, 0]);
  const filter = useTransform(blur, blurFilter);
  const badge = useTransform(progress, [from + (to - from) * 0.55, to], [0, 1]);

  return (
    <motion.div
      className="flex items-center gap-[0.55em] px-[0.85em] py-[0.42em]"
      style={{ opacity, y, filter, willChange: 'transform, opacity, filter' }}
    >
      <span className="relative shrink-0">
        <span
          aria-hidden
          className="flex h-[2.1em] w-[2.1em] items-center justify-center rounded-full font-satoshi text-[0.66em] font-bold text-white/90"
          style={{ background: tone }}
        >
          {chat.name.charAt(0)}
        </span>
        {/* ponto de presença — o sinal de que há alguém do outro lado */}
        <motion.span
          aria-hidden
          className="absolute -bottom-[0.02em] -right-[0.02em] h-[0.55em] w-[0.55em] rounded-full"
          style={{ background: WA_GREEN, boxShadow: `0 0 0 0.14em ${WA_BG}`, opacity: badge }}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-[0.4em]">
          {/* Nome e prévia subiram (0.62→0.68 / 0.54→0.64) SEM mexer na altura
              da linha: quem dita a altura aqui é o avatar (`h-[2.1em]`), e o
              bloco de texto empilhado soma ~1.7em mesmo depois do aumento —
              continua com folga dentro dos 2.1em. Por isso o aumento é de
              graça em layout. */}
          <span className="truncate font-satoshi text-[0.68em] font-semibold text-white/95">{chat.name}</span>
          <motion.span className="shrink-0 font-satoshi text-[0.52em] font-medium" style={{ color: WA_GREEN, opacity: badge }}>
            {chat.time}
          </motion.span>
        </span>

        <span className="mt-[0.12em] flex items-center justify-between gap-[0.4em]">
          {chat.typing ? (
            <span aria-hidden className="flex items-center gap-[0.16em] py-[0.18em]">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-[0.2em] w-[0.2em] rounded-full"
                  style={{ background: 'rgba(255,255,255,0.55)' }}
                  animate={reduce ? {} : { opacity: [0.25, 1, 0.25], y: [0, -1.5, 0] }}
                  transition={reduce ? {} : { duration: 1.15, repeat: Infinity, ease: 'easeInOut', delay: d * 0.16 }}
                />
              ))}
            </span>
          ) : (
            <span className="truncate font-satoshi text-[0.64em] text-white/50">{chat.preview}</span>
          )}

          <motion.span
            className="flex h-[0.95em] min-w-[0.95em] shrink-0 items-center justify-center rounded-full px-[0.2em] font-satoshi text-[0.5em] font-bold text-[#04140b]"
            style={{ background: WA_GREEN, opacity: badge, scale: badge, boxShadow: '0 0 0.7em rgba(37,211,102,0.55)' }}
          >
            1
          </motion.span>
        </span>
      </span>
    </motion.div>
  );
}

/* ── Aparelho ─────────────────────────────────────────────────────────────
   Toda a UI interna é escrita em `em` sobre uma base proporcional à LARGURA
   da tela. É isto que cumpre "100% responsivo": o aparelho mede ~165px de
   largura num iPhone SE e ~320px num monitor grande, e com tamanhos fixos em
   px a mesma UI apareceria gigante numa ponta e ilegível na outra. Com a base
   proporcional, o mockup fica IDÊNTICO em qualquer tela — como a foto de um
   mesmo aparelho, não como um layout que se reflowa.

   A base sai de um `ResizeObserver`, não de `cqw` (container queries): `cqw`
   resolveria isso em uma linha, mas onde não houvesse suporte (iOS 15 e
   anteriores) o `font-size` seria descartado como inválido, a tela herdaria
   os 16px do documento e TODA a UI apareceria em escala de gigante dentro de
   um aparelho de 165px — falha catastrófica e silenciosa, justamente nos
   aparelhos antigos que mais aparecem em tráfego pago. Medir é algumas linhas
   a mais e funciona em qualquer navegador; é o mesmo padrão que
   GlassPanelMockup.jsx já usa pra escalar os iframes do portfólio. */
/* v11 — 0.074 → 0.085 (+15%) por acessibilidade. Na base antiga a prévia de
   mensagem saía a ~11px e o nome do contato a ~13px num desktop de 1440:
   texto que CARREGA a mensagem da seção ("Oi! Vi o anúncio, quero saber
   mais" é o argumento inteiro do ato) renderizado abaixo do limiar
   confortável de leitura.

   Subir a base escala a UI inteira junto (é esse o ponto do `em`), inclusive
   alturas de linha — então cabem menos conversas na tela. Isso é
   deliberado e não é perda: um celular real mostra quantas conversas
   couberem, e a leitura de "caixa de entrada cheia" vem da densidade
   visível, não de um número exato de linhas. */
const SCREEN_BASE_RATIO = 0.085;

function Phone({ children, reduce }) {
  const screenRef = useRef(null);
  const [base, setBase] = useState(0);

  useLayoutEffect(() => {
    const el = screenRef.current;
    if (!el) return undefined;

    const apply = (width) => setBase(width * SCREEN_BASE_RATIO);

    // Medição síncrona antes do primeiro paint — o ResizeObserver só dispara
    // depois, e sem esta primeira leitura a tela pintaria um frame com a UI
    // colapsada em font-size 0.
    apply(el.getBoundingClientRect().width);

    const ro = new ResizeObserver(([entry]) => apply(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="relative h-full w-full"
      style={{ borderRadius: '13%/6.4%', padding: '0.9%', background: FRAME_RAIL, boxShadow: FRAME_SHADOW }}
    >
      <SideButtons />

      {/* bisel preto — a espessura entre o metal e o vidro */}
      <div className="h-full w-full overflow-hidden p-[2.1%]" style={{ borderRadius: '12%/6%', background: '#040407' }}>
        <div
          ref={screenRef}
          className="relative h-full w-full overflow-hidden"
          style={{ borderRadius: '10.5%/5.2%', background: WA_BG }}
        >
          {/* papel de parede sutil — tira o chapado do preto puro */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 120% 70% at 50% 0%, rgba(37,211,102,0.07), transparent 62%)' }}
          />

          <div className="relative flex h-full w-full flex-col" style={{ fontSize: base ? `${base}px` : undefined, opacity: base ? 1 : 0 }}>
            {children}
          </div>

          {/* reflexo do vidro — diagonal fina, alta o suficiente pra ler como
              luz de ambiente e baixa o suficiente pra não lavar a UI */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(118deg, transparent 24%, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.02) 49%, transparent 62%)',
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: 'inset 0 0 2.5em rgba(0,0,0,0.55)' }}
          />
        </div>
      </div>

      {/* Dynamic Island — por cima de tudo, como no aparelho real */}
      <span
        aria-hidden
        className="absolute left-1/2 top-[1.9%] flex h-[3.4%] w-[30%] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[9%]"
      >
        <motion.span
          className="h-[42%] w-[13%] rounded-full"
          style={{ background: 'radial-gradient(circle at 35% 32%, #2b3a52, #05070c 72%)' }}
          animate={reduce ? {} : { opacity: [0.75, 1, 0.75] }}
          transition={reduce ? {} : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </span>
    </div>
  );
}

/* Legenda que troca junto com a tela. Sobe e desfoca ao sair (mesma gramática
   de dissolve do Ato 2) em vez de piscar — as duas legendas nunca coexistem
   legíveis, então a leitura nunca fica ambígua sobre qual metade está no ar. */
function Caption({ progress, window: win, children, out }) {
  const opacity = useTransform(
    progress,
    out ? [win[0], win[1], out[0], out[1]] : win,
    out ? [0, 1, 1, 0] : [0, 1],
  );
  const y = useTransform(progress, out || win, out ? [0, -22] : [16, 0], { ease: EASE_LUXE });
  const blur = useTransform(progress, out || win, out ? [0, 7] : [6, 0]);
  const filter = useTransform(blur, blurFilter);

  /* Maior e mais pesada que o `TYPE.body` padrão de propósito — esta legenda
     é a agitação da dor / a virada da promessa, o texto que mais precisa
     "gritar" depois do título. `font-medium` (a legenda comum da marca é
     regular) sustenta o peso maior sem virar bloco de texto solto.

     16px no mobile (era 17px) — diferença pequena de propósito: no desktop
     ela sobe pra 22px porque sobra espaço de sobra; no iPhone SE cada px de
     `line-height` a mais sai direto da altura que deveria ser do aparelho,
     que é a prova real da seção. Continua acima do piso de 14px da marca. */
  return (
    <motion.p
      className="max-w-[34rem] font-satoshi text-[16px] font-medium leading-[1.4] text-rv-slate md:text-[22px] md:leading-[1.42]"
      style={{ opacity, y, filter, willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.p>
  );
}

export default function SilentInbox({ data }) {
  const trackRef = useRef(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);
  const rawProgress = useTrackProgress(trackRef, reduce);
  const progress = useSpring(rawProgress, SCRUB_SPRING);

  const ghosts = data.ghosts ?? [];
  const chats = data.chats ?? [];

  const turnMid = (STAGE.turn[0] + STAGE.turn[1]) / 2;

  /* ── Entrada cinematográfica ────────────────────────────────────────────
     v2 — três camadas de movimento resolvendo em RITMOS diferentes, em vez
     de tudo chegando junto no mesmo instante (que lê como corte seco, não
     como cena contínua):

       1. FOCO      o desfoque resolve PRIMEIRO (65% da janela) — a leitura é
                     "a câmera acha o foco", só depois o objeto termina de
                     se assentar. Foco+posição+giro chegando juntos parecem
                     um elemento de UI que só "aparece"; escalonados, parecem
                     um objeto físico entrando em cena.
       2. TRAJETÓRIA posição (x/y) e escala usam a janela inteira — é o
                     movimento "pesado" que dá peso ao objeto, maior agora
                     (era 150px de subida, é 260 — o aparelho também cresceu)
                     e com um leve desvio lateral (x) pra virar um arco vindo
                     de cima-direita, não um elevador reto vertical.
       3. ASSENTAR  rotateX/rotateZ (a "queda pra frente" e o leve banzo
                     lateral) se estendem um pouco ALÉM da janela nominal —
                     o balanço residual depois que posição e foco já
                     resolveram é o que dá peso físico real, o tipo de
                     "cauda" que EASE_LUXE (calibrada pra UI que responde
                     rápido) não entrega; daí `CINEMATIC_EASE` aqui. */
  const enterSpan = STAGE.enter[1] - STAGE.enter[0];
  const settleEnd = STAGE.enter[1] + enterSpan * 0.4;

  const phoneY = useTransform(progress, STAGE.enter, [260, 0], { ease: CINEMATIC_EASE });
  const phoneX = useTransform(progress, STAGE.enter, [70, 0], { ease: CINEMATIC_EASE });
  const phoneScale = useTransform(progress, STAGE.enter, [0.6, 1], { ease: CINEMATIC_EASE });
  const phoneRotateX = useTransform(progress, [STAGE.enter[0], settleEnd], [28, 3], { ease: CINEMATIC_EASE });
  const phoneRotateZ = useTransform(progress, [STAGE.enter[0], settleEnd], [-7, 0], { ease: CINEMATIC_EASE });
  const phoneOpacity = useTransform(progress, [STAGE.enter[0], STAGE.enter[0] + 0.05], [0, 1]);
  const phoneBlurRaw = useTransform(progress, [STAGE.enter[0], STAGE.enter[0] + enterSpan * 0.65], [28, 0]);
  const phoneFilter = useTransform(phoneBlurRaw, blurFilter);

  /* Giro em 4 tempos (nasce torto → pousa na vitrine → vira pro leitor na
     revelação → assenta). Precisa dos 4 pontos no domínio: com 2 o
     `useTransform` clampa no PRIMEIRO valor pra todo progresso anterior à
     janela, e o aparelho ficaria na pose de nascimento durante a seção
     inteira — mesmo bug já documentado na âncora do Ato 2. */
  const phoneRotateY = useTransform(
    progress,
    [STAGE.enter[0], STAGE.enter[1], STAGE.turn[0], turnMid, STAGE.turn[1]],
    [TILT.born, TILT.rest, TILT.rest, TILT.turned, TILT.settled],
    { ease: EASE_LUXE },
  );

  const lossOpacity = useTransform(progress, [STAGE.turn[0], turnMid], [1, 0]);
  const gainOpacity = useTransform(progress, [turnMid - 0.02, STAGE.turn[1]], [0, 1]);

  /* Varredura de luz violeta atravessando o vidro no instante da virada —
     o "flash" que marca a troca. Um pulso só, amarrado ao mesmo progresso:
     parar o scroll no meio congela a luz no meio do vidro. */
  const sweepX = useTransform(progress, STAGE.turn, ['-130%', '130%'], { ease: EASE_LUXE });
  const sweepOpacity = useTransform(progress, [STAGE.turn[0], turnMid, STAGE.turn[1]], [0, 1, 0]);

  /* Halo verde crescendo por trás do aparelho conforme as conversas entram —
     recompensa cromática: a cena inteira é violeta/preta até aqui. */
  const gainGlow = useTransform(progress, [STAGE.turn[0], STAGE.gain[1]], [0, 0.6]);

  const headlineOpacity = useTransform(progress, [STAGE.enter[0], STAGE.enter[1] * 0.7], [0, 1]);
  const headlineY = useTransform(progress, [STAGE.enter[0], STAGE.enter[1] * 0.7], [24, 0], { ease: EASE_LUXE });

  const stateLabelOpacity = useTransform(progress, [STAGE.enter[1], STAGE.enter[1] + 0.06], [0, 1]);

  return (
    <section
      id="consequencia"
      ref={trackRef}
      aria-labelledby="silent-inbox-title"
      className="relative h-[340dvh] bg-rv-void"
    >
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {/* Brilho ambiente violeta — respira em loop, independente do scroll */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[110vh] w-[110vh] -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2), transparent 62%)', filter: 'blur(30px)' }}
          animate={reduce ? {} : { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={reduce ? {} : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Ordem de DOM = chamada → aparelho → ação, que já é a leitura certa
            empilhada no mobile (a prova ANTES do pedido de ação) e dispensa
            qualquer `order`. No desktop o grid recompõe em duas colunas por
            posicionamento explícito, que ignora a ordem do documento.

            O aparelho é `flex-1 min-h-0` no mobile: ele fica com EXATAMENTE a
            sobra de altura depois do texto, e a largura sai do aspect-ratio.
            É o que garante caber num iPhone SE (667px de altura) sem nenhum
            breakpoint — em vez de um `clamp` chutado que erra em algum
            aparelho, a altura é medida pelo próprio layout.

            Grid de UMA linha só agora (era duas, com o CTA solto embaixo do
            aparelho inteiro): chamada+legenda+CTA formam um bloco só na
            coluna 1, o aparelho ocupa a coluna 2 do lado — o botão fica a um
            `mt` de distância da frase que o justifica, não a uma seção
            inteira dela.

            `pb` mobile subiu (era só `clamp(1rem,3dvh,2rem)`, ~20px): o
            WhatsAppButton flutuante do site inteiro (`fixed bottom-right`,
            56px) vive bem nessa faixa, e com pouco respiro embaixo o último
            elemento da coluna acabava na mesma altura dele — duas manchas
            verdes coladas no rodapé da tela. No desktop essa folga não faz
            falta (o grid já centraliza tudo verticalmente, longe do canto),
            por isso `md:pb-0`. */}
        <div
          className={`relative z-10 mx-auto flex h-full max-w-[1400px] flex-col items-center justify-center gap-[clamp(0.75rem,2dvh,1.75rem)] pb-[clamp(2.5rem,2rem+2dvh,3.5rem)] md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-x-[5vw] md:pb-0 ${GX}`}
          style={{ paddingTop: 'clamp(3.5rem, 3.5rem + 2.5dvh, 6.5rem)' }}
        >
          {/* ── A · Chamada + legenda + ação ─────────────────────────────
              O CTA mora AQUI dentro, logo após a legenda — sem amarra ao
              scroll, é o único elemento da cena que nunca some. Numa página
              de Google Ads, esconder a ação atrás de um gesto de scroll é
              desperdiçar clique pago. */}
          <div className="flex w-full max-w-xl shrink-0 flex-col items-center text-center md:col-start-1 md:row-start-1 md:max-w-none md:items-start md:text-left">
            {/* Some no mobile (`hidden md:flex`): é o elemento menos essencial
                da coluna — o título já entrega o assunto sozinho — e num
                iPhone SE cada linha custa altura que sai direto do tamanho do
                aparelho, que é a prova real da seção. No desktop sobra espaço
                de sobra, então ele volta. */}
            <motion.p
              className={`hidden items-center gap-3 font-satoshi font-medium uppercase tracking-widest2 text-rv-slate md:flex ${TYPE.eyebrow}`}
              style={{ opacity: headlineOpacity, y: headlineY }}
            >
              <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
              {data.eyebrow}
            </motion.p>

            <motion.h2
              id="silent-inbox-title"
              className="mt-0 font-grotesk font-light leading-[1.06] tracking-[-0.025em] text-rv-titanium md:mt-[clamp(1.5rem,4dvh,3rem)]"
              style={{
                fontSize: 'clamp(1.55rem, 2.6vw + 0.8dvh, 3.75rem)',
                opacity: headlineOpacity,
                y: headlineY,
              }}
            >
              {data.headlineLines.map((line, i) => {
                const accent = line.startsWith('_') && line.endsWith('_');
                return (
                  <span key={i} className={`block ${accent ? 'text-rv-purple-400' : ''}`}>
                    {accent ? line.slice(1, -1) : line}
                  </span>
                );
              })}
            </motion.h2>

            {/* As duas legendas ocupam a MESMA célula do grid — empilhadas em
                vez de irmãs no fluxo. Se fossem irmãs, a saída de uma
                colapsaria a altura e tudo abaixo daria um pulo no meio da
                virada. Grid + `col-start-1 row-start-1` reserva a maior
                altura das duas, permanentemente.

                Título e legenda continuam perto o bastante pra ler como uma
                unidade só. No mobile o respiro é mais contido (`mt-3`) pra
                sobrar altura pro aparelho; no desktop, onde não falta espaço,
                cresce bem mais — é o pedido de "mais espaçamento" aplicado
                onde ele não compete com o resto da composição. */}
            <div className="mt-3 grid md:mt-[clamp(1.5rem,3.6dvh,2.75rem)]">
              <div className="col-start-1 row-start-1">
                <Caption progress={progress} window={STAGE.loss} out={STAGE.turn}>
                  {data.lossCaption}
                </Caption>
              </div>
              <div className="col-start-1 row-start-1">
                {/* Mesma cor/peso da primeira legenda (herda text-rv-slate
                    font-medium do próprio `<Caption>`) — antes vinha embrulhada
                    num `<span className="text-rv-titanium">` que a deixava
                    branca/mais clara que a legenda de perda, uma inconsistência
                    que não tinha motivo (as duas são a mesma voz editorial,
                    só o conteúdo muda). */}
                <Caption progress={progress} window={[turnMid, STAGE.gain[1] * 0.9]}>
                  {data.gainCaption}
                </Caption>
              </div>
            </div>

            <motion.a
              href={data.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative mt-5 inline-flex items-center gap-2.5 overflow-hidden rounded-full px-[clamp(1.25rem,4vw,1.9rem)] py-[clamp(0.7rem,1.6dvh,1rem)] font-satoshi text-[clamp(14px,3.4vw,16px)] font-semibold text-[#04140b] md:mt-[clamp(2.25rem,5dvh,3.75rem)]"
              /* opacity/y amarrados ao MESMO motion value do título — antes o
                 botão simplesmente "já estava lá" com opacidade 1 fixa desde
                 o primeiro frame da seção, sem nenhuma entrada, enquanto tudo
                 ao redor ainda estava invisível/borrado — lia como um
                 elemento quebrado boiando sozinho. Continua nunca sumindo
                 depois de aparecer (headlineOpacity só sobe e nunca desce),
                 só ganhou uma chegada coordenada com o resto da cena. */
              style={{ opacity: headlineOpacity, y: headlineY, background: WA_GREEN }}
              animate={
                reduce
                  ? {}
                  : { boxShadow: ['0 0 0 rgba(37,211,102,0)', '0 0 42px rgba(37,211,102,0.5)', '0 0 0 rgba(37,211,102,0)'] }
              }
              transition={reduce ? {} : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
              <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="relative z-10 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="relative z-10 whitespace-nowrap">{data.cta.label}</span>
              <span aria-hidden className="relative z-10 hidden transition-transform duration-300 group-hover:translate-x-1 sm:inline">
                →
              </span>
            </motion.a>
          </div>

          {/* ── B · Aparelho ──────────────────────────────────────────── */}
          {/* No desktop a altura é `dvh + vw` somados, não um piso fixo em px:
              um `min` alto estouraria a viewport de um notebook em tela
              dividida ou de um celular em paisagem (412px de altura), onde a
              cena inteira é mais baixa que o próprio aparelho. Somando `vw` o
              mockup ainda cresce de verdade em monitor grande — o termo `vw`
              subiu de 5 pra 9 e o teto de 660 pra 820px: é o pedido explícito
              de "maior no desktop", mais espaço de sobra pro drama da entrada
              (ver `phoneScale`/`phoneY` abaixo) ter distância física real pra
              percorrer antes de assentar. */}
          <div className="relative flex min-h-[190px] w-full flex-1 flex-col items-center justify-center gap-2 md:col-start-2 md:row-start-1 md:h-[clamp(320px,60dvh+9vw,820px)] md:w-auto md:flex-none md:gap-5">
            {/* halo verde da recompensa, atrás do vidro */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute h-[105%] w-[210%] rounded-full"
              style={{
                opacity: gainGlow,
                background: 'radial-gradient(circle, rgba(37,211,102,0.32), transparent 66%)',
                filter: 'blur(50px)',
              }}
            />

            {/* Rótulo de estado — chip com ÍCONE, não só texto, funcionando
                como legenda/kicker PARA o aparelho (fica ACIMA dele, como uma
                tag sobre uma foto de antes/depois). Antes vivia flutuando
                colado na base do vidro, sobre a barra de gestos, na MESMA
                faixa de altura do WhatsAppButton flutuante do site inteiro
                (`fixed bottom-right`, sempre presente) — duas manchas verdes
                competindo no rodapé da tela, sem contar que também não
                explicava o que estava rotulando. Aqui em cima ele nunca
                encosta em nada, e o ícone (✕ cinza vs ✓ verde) faz o
                significado ler antes mesmo do texto. */}
            <motion.div aria-hidden className="grid shrink-0" style={{ opacity: stateLabelOpacity }}>
              <motion.div
                className="col-start-1 row-start-1 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.05] py-1 pl-1 pr-2.5 backdrop-blur-md md:gap-2 md:py-2 md:pl-2 md:pr-4"
                style={{ opacity: lossOpacity }}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 md:h-[22px] md:w-[22px]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" className="h-2 w-2 md:h-[10px] md:w-[10px]">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </span>
                <span className="font-satoshi text-[15px] font-semibold uppercase tracking-widest2 text-white/60 md:text-[16px]">
                  {data.lossLabel}
                </span>
              </motion.div>

              <motion.div
                className="col-start-1 row-start-1 flex items-center gap-1.5 whitespace-nowrap rounded-full py-1 pl-1 pr-2.5 md:gap-2 md:py-2 md:pl-2 md:pr-4"
                style={{
                  opacity: gainOpacity,
                  background: 'rgba(4,20,11,0.8)',
                  border: '1px solid rgba(37,211,102,0.4)',
                  boxShadow: '0 0 26px rgba(37,211,102,0.28)',
                }}
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full md:h-[22px] md:w-[22px]"
                  style={{ background: WA_GREEN }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#04140b" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" className="h-2 w-2 md:h-[11px] md:w-[11px]">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="font-satoshi text-[15px] font-semibold uppercase tracking-widest2 md:text-[16px]" style={{ color: WA_GREEN }}>
                  {data.gainLabel}
                </span>
              </motion.div>
            </motion.div>

            {/* Camada 1 — transformações do SCROLL */}
            <motion.div
              className="relative h-full"
              style={{
                aspectRatio: '1 / 2.03',
                x: phoneX,
                y: phoneY,
                scale: phoneScale,
                rotateX: phoneRotateX,
                rotateY: phoneRotateY,
                rotateZ: phoneRotateZ,
                opacity: phoneOpacity,
                filter: phoneFilter,
                /* `transformPerspective` e não `perspective` no pai: a
                   perspectiva de um ancestral só alcança seus filhos DIRETOS,
                   e o aparelho está vários níveis abaixo do palco — ali o
                   rotateY viraria um achatamento horizontal sem profundidade
                   nenhuma. Aplicada no próprio elemento transformado, vale. */
                transformPerspective: 1500,
                willChange: 'transform, opacity, filter',
              }}
            >
              {/* Camada 2 — vida própria em LOOP (nunca no mesmo nó da 1) */}
              <motion.div
                className="h-full w-full"
                animate={reduce ? {} : { y: [0, -14, 0] }}
                transition={reduce ? {} : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Phone reduce={reduce}>
                  <StatusBar />
                  <AppHeader />

                  <div className="relative min-h-0 flex-1 overflow-hidden">
                    {/* ── Metade PERDA ─────────────────────────────── */}
                    <motion.div className="absolute inset-0" style={{ opacity: lossOpacity }}>
                      <div className="relative h-[50%]">
                        {ghosts.map((text, i) => (
                          <GhostLead
                            key={text}
                            progress={progress}
                            window={slot(STAGE.loss, i, ghosts.length, 0.5)}
                            text={text}
                          />
                        ))}
                      </div>
                      <EmptyState label={data.emptyState} reduce={reduce} />
                    </motion.div>

                    {/* ── Metade GANHO ─────────────────────────────── */}
                    <motion.div className="absolute inset-x-0 top-0 pt-[0.3em]" style={{ opacity: gainOpacity }}>
                      {chats.map((chat, i) => (
                        <ChatRow
                          key={chat.name}
                          progress={progress}
                          window={slot(STAGE.gain, i, chats.length, 0.5)}
                          chat={chat}
                          tone={AVATAR_TONES[i % AVATAR_TONES.length]}
                          reduce={reduce}
                        />
                      ))}
                    </motion.div>

                    {/* varredura da virada */}
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 w-1/2"
                      style={{
                        x: sweepX,
                        opacity: sweepOpacity,
                        background:
                          'linear-gradient(100deg, transparent, rgba(167,139,250,0.55), rgba(255,255,255,0.3), transparent)',
                        filter: 'blur(9px)',
                      }}
                    />
                  </div>

                  {/* barra de gestos */}
                  <span
                    aria-hidden
                    className="mx-auto mb-[0.5em] h-[0.14em] w-[28%] shrink-0 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.3)' }}
                  />
                </Phone>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* fade inferior — funde o palco no próximo ato */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[12dvh]"
          style={{ background: 'linear-gradient(to top, #03000A, transparent)' }}
        />
      </div>
    </section>
  );
}
