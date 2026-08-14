import { motion } from 'framer-motion';
import Aurora from '../primitives/Aurora';
import GradientBorder from '../primitives/GradientBorder';
import { EASE_LUXE, GX, TYPE, RADIUS, prefersReducedMotion } from '../config/_base';

/*
  Ato 9 — Finale, item 11 do refinamento v4 + ajuste posterior: card quase
  full-bleed (max-w-[92vw], não max-w-7xl), device no canto inferior-
  direito de verdade, cortado pelo overflow:hidden do card.

  Ajuste: antes o device vivia DENTRO da célula do grid (md:col-span-6),
  então "bottom:0" ancorava no fundo da ROW (altura definida pelo conteúdo
  de texto, mais curto que o card inteiro) — sobrava um vão vazio grande
  entre o device e a borda real do card, parecendo "centralizado" em vez
  de encostado no fim da seção. Fix: o device agora é posicionado absolute
  direto no container `overflow-hidden` do card (irmão do grid, não filho
  dele) — "bottom-0 right-0" passa a bater na borda real do card, sem vão.

  Maior + entrada "crescendo de baixo pra cima": a entrada trocou de
  fade+slide (y:80→0) pra scale a partir do canto inferior-direito
  (transformOrigin bottom right, scale 0.5→1) — o device nasce pequeno
  encostado no canto e cresce pra cima/esquerda até o tamanho final, then
  segue com o mesmo float infinito de sempre.

  Segundo ajuste: cta-device.webp tinha ~50px de margem transparente nos
  4 lados (confirmado via `magick identify -format "%@"` → trim box
  1571x1325+50+50 num canvas 1671x1425) — isso era compensado com
  translate manual no <img>, mas o offset precisava crescer toda vez que o
  device aumentava de tamanho (px fixo, não escala com %), e ficou
  defasado quando o device foi ampliado — sobrava gap visível até a borda
  do card em vez de ficar "100% encostado". Fix definitivo: a margem
  transparente foi cortada do arquivo (`magick ... -trim +repage`), então
  a imagem em si não tem mais padding invisível — "bottom-0 right-0" agora
  encosta de verdade sem nenhum translate/margin de compensação, e
  continua correto em qualquer tamanho, pra sempre (não é um número mágico
  que precisa ser recalibrado a cada mudança de %).
*/
function StarField() {
  const stars = STAR_SHADOW;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute h-[2px] w-[2px] rounded-full bg-white" style={{ boxShadow: stars, opacity: 0.55 }} />
    </div>
  );
}

function genStarShadow(count, spread) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(Math.random() * spread);
    const y = Math.round(Math.random() * spread);
    const a = (0.3 + Math.random() * 0.7).toFixed(2);
    parts.push(`${x}px ${y}px 0 rgba(255,255,255,${a})`);
  }
  return parts.join(', ');
}
const STAR_SHADOW = genStarShadow(90, 1400);

function FloatingDevice({ className, imgClassName, src }) {
  const reduce = prefersReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.1, delay: 0.3, ease: EASE_LUXE }}
      style={{ transformOrigin: 'bottom right' }}
      className={className}
    >
      <motion.img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        width={1571}
        height={1325}
        animate={reduce ? {} : { y: [0, -8, 0] }}
        transition={reduce ? {} : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={imgClassName}
      />
    </motion.div>
  );
}

export default function FinaleCta({ data }) {
  return (
    <section id="finale" className={`relative overflow-hidden border-t border-white/[0.06] py-20 md:py-[120px] ${GX}`}>
      <GradientBorder radius={RADIUS.lg} slow className="relative mx-auto max-w-[92vw] bg-rv-void">
        <div className="relative overflow-hidden" style={{ borderRadius: RADIUS.lg }}>
          <div className="absolute inset-0 bg-rv-void" />
          <StarField />
          <Aurora variant="cta" />

          <div className="relative z-10 grid gap-10 px-8 pb-0 pt-16 md:grid-cols-12 md:gap-8 md:px-16 md:py-24">
            <div className="text-center md:col-span-6 md:text-left">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: EASE_LUXE }}
                className={`flex items-center justify-center gap-3 font-satoshi font-medium uppercase tracking-widest2 text-rv-slate md:justify-start ${TYPE.eyebrow}`}
              >
                <span aria-hidden className="h-px w-8 bg-rv-purple/60" />
                Diagnóstico gratuito
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXE }}
                className={`mt-6 font-grotesk font-light leading-[1.1] tracking-[-0.02em] text-rv-titanium ${TYPE.h2}`}
              >
                {data.headline}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, delay: 0.25, ease: EASE_LUXE }}
                className={`mx-auto mt-6 max-w-md font-satoshi text-rv-slate ${TYPE.body} md:mx-0`}
              >
                {data.body}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, delay: 0.4, ease: EASE_LUXE }}
                className="mt-9 flex justify-center md:justify-start"
              >
                <a
                  href={data.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-full bg-rv-titanium px-9 py-4 font-satoshi font-medium tracking-wide text-rv-void shadow-[0_0_40px_rgba(255,255,255,0.18)] transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] ${TYPE.button}`}
                >
                  {data.cta.label}
                </a>
              </motion.div>

              <motion.ul
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, delay: 0.55, ease: EASE_LUXE }}
                className="mt-8 flex flex-wrap items-center justify-center gap-3 pb-16 md:justify-start md:pb-0"
              >
                {data.badges.map((b) => (
                  <li key={b} className={`rounded-full border border-white/15 bg-rv-void/40 px-5 py-2.5 font-satoshi text-rv-slate backdrop-blur-sm ${TYPE.cardDesc}`}>
                    {b}
                  </li>
                ))}
              </motion.ul>
            </div>

          </div>

          {/* desktop — ancorado no canto inferior-direito do CARD de verdade
              (irmão do grid, não célula dele), pra "bottom-0" bater na
              borda real da seção em vez do fundo da row de texto. */}
          <FloatingDevice
            src={data.deviceImage}
            className="absolute bottom-0 right-0 z-10 hidden w-[48%] md:block"
            imgClassName="block w-full"
          />

          {/* mobile — faixa própria abaixo do texto, device à direita, sem sobrepor nada.
              w-[90%] (era 74%) a pedido do usuário — "maior no mobile". Continua cabendo
              dentro do h-72 (mesmo em viewports maiores tipo iPhone Pro Max o excedente é
              de poucos px, e como o overflow:hidden real fica no card inteiro — não nesta
              faixa — não há corte visível, só o device crescendo um pouco além da caixa
              nominal, ancorado no canto como sempre). */}
          <div className="relative z-10 mt-2 h-72 md:hidden">
            <FloatingDevice
              src={data.deviceImage}
              className="absolute bottom-0 right-0 w-[90%]"
              imgClassName="block w-full"
            />
          </div>
        </div>
      </GradientBorder>
    </section>
  );
}
