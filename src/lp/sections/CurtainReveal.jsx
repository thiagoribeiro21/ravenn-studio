import { useMemo, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { SCRUB_SPRING, prefersReducedMotion, useIsDesktop, useSectionProgress } from '../config/_base';

/* ══════════════════════════════════════════════════════════════════════════
   "Curtain reveal" — v4, Framer Motion (parallax contra o scroll) no lugar
   do `position: sticky` das v2/v3.

   ── Por que o sticky não entregava a sensação de reveal ───────────────────
   Não era `overflow-hidden` num ancestral (a suspeita levantada; conferido:
   o único `overflow` no caminho é o `overflowY:auto` do próprio scroller do
   LPShell, que é o container de scroll e NÃO quebra sticky, mais um
   `overflow-hidden` no `<footer>`, que é IRMÃO, não ancestral). O sticky
   funcionava de verdade — medido com eventos de wheel reais passando pelo
   Lenis, a seção ficava 8 frames consecutivos travada em `top: 126px`.

   O problema é geométrico, não de CSS quebrado: um elemento sticky só
   PRENDE quando o topo do container dele alcança o topo da viewport. Nesse
   instante, a seção ANTERIOR já rolou inteira pra fora da tela. Ou seja: a
   metade "ser coberto" do efeito funcionava (o FAQ desliza por cima), mas a
   metade "ser revelado" nunca existiu — não havia nada por cima pra sair e
   revelar. A seção entrava normal, ficava parada um tempo, e era coberta.
   "Entrar normal" é exatamente o "não tem efeito" relatado.

   ── O que a v4 faz ────────────────────────────────────────────────────────
   Move o conteúdo CONTRA a direção do scroll (`y: -30% → 30%` ao longo da
   travessia da seção pela viewport). Como o conteúdo sobe mais devagar que
   a página, ele lê como um plano mais fundo — profundidade real, presente
   durante a travessia INTEIRA, inclusive enquanto as cortinas (as seções
   z-20 de cima e de baixo) deslizam por cima. Não depende de containing
   block, de sticky, nem de ordem de irmãos: é transform puro.

   ── Sobre `useScroll` ─────────────────────────────────────────────────────
   `useScroll({ target, offset })` do Framer escuta a `window` por padrão, e
   esta rota não rola a window (o LPShell rola `[data-lp-scroller]`) — o
   progresso ficaria cravado em 0 e o parallax nunca sairia do lugar, sem
   erro nenhum no console. `useSectionProgress` (config/_base.js) resolve o
   scroller certo e implementa EXATAMENTE a mesma semântica de
   `offset: ["start end", "end start"]`: 0 quando o topo da seção toca a
   base da viewport, 1 quando a base da seção toca o topo. A matemática
   pedida, no scroller que existe aqui.

   ── Por que ainda existe o guard de mobile ────────────────────────────────
   Medido ao vivo: o conteúdo de `#processo` tem ~846px de altura num iPhone
   SE (viewport de 667px). Com `overflow-hidden` no wrapper de 1 viewport, o
   que passa da borda fica cortado e inacessível — não há scroll interno pra
   alcançar. Abaixo do breakpoint `md` os `children` renderizam soltos, em
   fluxo normal, sem wrapper nenhum.
   ══════════════════════════════════════════════════════════════════════════ */

/* Deslocamento do plano de fundo ao longo da travessia. ±30% da altura do
   wrapper: forte o bastante pra leitura de profundidade ser inequívoca, e
   os extremos (onde o conteúdo centralizado chega a sair do recorte) só
   acontecem quando a seção está entrando/saindo — momentos em que as
   cortinas z-20 já estão por cima de qualquer forma. */
const PARALLAX_RANGE = ['-30%', '30%'];

export default function CurtainReveal({ children }) {
  const containerRef = useRef(null);
  const isDesktop = useIsDesktop();
  const reduce = useMemo(() => prefersReducedMotion(), []);

  /* Hooks rodam sempre (Regra dos Hooks) — só o JSX no fim decide se o
     wrapper existe. Com `disabled`, `useSectionProgress` trava o progresso
     e não registra listener nenhum. */
  const rawProgress = useSectionProgress(containerRef, !isDesktop || reduce);
  /* Mola pra tirar o jitter: o progresso cru é recalculado por rAF a cada
     frame de scroll e, com o Lenis por baixo, chega com micro-degraus. A
     mesma física (`SCRUB_SPRING`) que todo scroll-linked motion desta LP
     usa — overdamped, nunca ultrapassa o alvo. */
  const progress = useSpring(rawProgress, SCRUB_SPRING);
  const y = useTransform(progress, [0, 1], PARALLAX_RANGE);

  if (!isDesktop || reduce) return children;

  return (
    /* `bg-rv-void` TAMBÉM no wrapper (não só no filho, como no spec): o
       filho tem exatamente 100% da altura e se desloca ±30% — nos extremos
       sobraria uma faixa vazia numa das pontas. Com a mesma cor de fundo
       nos dois, a faixa é invisível e o recorte fica perfeito. */
    <div ref={containerRef} className="relative z-0 h-dvh w-full overflow-hidden bg-rv-void">
      <motion.div
        style={{ y, willChange: 'transform' }}
        className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-rv-void"
      >
        {children}
      </motion.div>
    </div>
  );
}
