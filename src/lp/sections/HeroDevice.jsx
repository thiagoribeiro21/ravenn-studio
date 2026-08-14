import { useEffect, useMemo, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Aurora from '../primitives/Aurora';
import ParticleField from '../primitives/ParticleField';
import { EASE_LUXE, GX, TYPE, prefersReducedMotion } from '../config/_base';

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

  Paths vêm de `data.deviceImages` (config por LP) — antes eram hardcoded
  aqui, o que quebrava a promessa desta LP ser MOLDE: clonar pra outro
  serviço exigia editar este componente, não só o config.
*/
function DeviceShot({ images }) {
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={images.desktop} />
      <img
        src={images.mobile}
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

/*
  Botão magnético — o cursor "puxa" o botão dentro de um raio curto (spring
  crítico, não elástico: mass/damping ajustados pra parar sem overshoot
  visível, senão parece brinquedo). `prefersReducedMotion` desliga o
  tracking do mouse por completo (fica estático, só o hover de cor/glow
  continua) em vez de simplesmente pular o spring — mexer na posição de um
  elemento clicável sem input explícito do usuário é o tipo de movimento que
  a preferência existe pra evitar.
*/
const MAGNETIC_SPRING = { stiffness: 180, damping: 14, mass: 0.4 };
const MAGNETIC_STRENGTH = 0.35;

function MagneticCta({ href, children, variant = 'solid', className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, MAGNETIC_SPRING);
  const springY = useSpring(y, MAGNETIC_SPRING);
  const reduce = prefersReducedMotion();

  function handleMove(e) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * MAGNETIC_STRENGTH);
    y.set((e.clientY - rect.top - rect.height / 2) * MAGNETIC_STRENGTH);
  }
  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  const solid = variant === 'solid';

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={reduce ? undefined : { x: springX, y: springY }}
      className={`group relative isolate inline-flex items-center gap-2.5 overflow-hidden rounded-full px-8 py-4 font-satoshi font-medium tracking-wide transition-[color,border-color,box-shadow] duration-500 ${TYPE.button} ${
        solid
          ? 'bg-rv-purple text-white shadow-[0_0_36px_rgba(124,58,237,0.32)] group-hover:shadow-[0_0_64px_rgba(124,58,237,0.62)]'
          : 'border border-white/15 text-rv-titanium hover:border-rv-purple/50'
      } ${className}`}
    >
      {/* halo violeta — só acende no hover, blur largo pra parecer luz, não caixa */}
      {solid && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-8 -z-10 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,.85), transparent 68%)' }}
        />
      )}
      {/* faixa de brilho varrendo o botão no hover — sutil, uma vez por hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      <span className="relative z-10">{children}</span>
      <span aria-hidden className="relative z-10 inline-block transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </motion.a>
  );
}

/*
  Item 3, refinamento v6 — dashboard editorial. Cada stat vira uma célula
  numa régua Swiss-grid: hairline que se desenha (scaleY/scaleX, não width/
  height — pura composição, sem layout shift), número com count-up amarrado
  ao viewport (não a um timer) e o sufixo (`s`, `%`) isolado em roxo, como
  destaque tipográfico em vez de ícone.

  `parseStat`/`formatStat` — a marca usa vírgula decimal (pt-BR: "0,05s"),
  então o count-up precisa reconstruir esse formato a cada frame, não só
  interpolar um número cru. Falha graciosamente: qualquer `big` que não
  comece com dígito (conteúdo futuro fora do padrão) renderiza como texto
  estático, sem quebrar.
*/
function parseStat(raw) {
  const match = /^(-?[\d.,]+)(.*)$/.exec(String(raw).trim());
  if (!match || match[1] === '') return { value: null, decimals: 0, suffix: raw };
  const [, numeric, suffix] = match;
  const decimals = numeric.includes(',') ? numeric.split(',')[1].length : 0;
  const value = parseFloat(numeric.replace(/\./g, '').replace(',', '.'));
  return { value: Number.isNaN(value) ? null : value, decimals, suffix };
}

function formatStat(value, decimals) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/* v10 — "Apple Dark Mode": números sólidos e pesados (não mais o gradiente
   titanium→slate do v6), o acento violeta migrou pro SUFIXO (`s`/`%`), que
   agora é ele mesmo o elemento "chamativo" via `bg-clip-text` — a marca já
   tinha esse recorte pronto (era só o dot que dependia de ficar fora dele).
   Sem dot nenhum agora, então o número volta a ser um `<p>` só, sem wrapper
   flex pra acomodar um irmão. */
function StatNumber({ raw, active, reduce }) {
  const { value, decimals, suffix } = useMemo(() => parseStat(raw), [raw]);
  const count = useMotionValue(reduce ? value ?? 0 : 0);
  const display = useTransform(count, (v) => formatStat(v, decimals));

  useEffect(() => {
    if (!active || value === null || reduce) return undefined;
    const controls = animate(count, value, { duration: 2, ease: EASE_LUXE });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, value, reduce]);

  if (value === null) {
    return <>{raw}</>;
  }

  return (
    <>
      <motion.span>{display}</motion.span>
      {suffix && (
        <span className="bg-gradient-to-br from-rv-purple-400 to-rv-purple bg-clip-text text-transparent">
          {suffix}
        </span>
      )}
    </>
  );
}

/* Hairline neutro (era um gradiente com ponta violeta) — o acento da régua
   agora vive só no sufixo do número; um segundo ponto violeta aqui
   competiria com ele em vez de emoldurar. Continua se desenhando
   (scaleY 0→1) ao entrar em vista, só a cor mudou.

   Sempre vertical agora (a variante horizontal existia só pra separar as
   3 provas quando ficavam EMPILHADAS no mobile — item pedido pelo
   usuário: alinhar as 3 na mesma linha em toda LP, não só no desktop). */
function Divider({ active, reduce, delay }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 h-full w-px bg-white/10"
      style={{ transformOrigin: 'top' }}
      initial={reduce ? false : { scaleY: 0 }}
      animate={active ? { scaleY: 1 } : undefined}
      transition={{ duration: 0.9, delay, ease: EASE_LUXE }}
    />
  );
}

/* `grid-cols-3` sempre (era `grid-cols-1 md:grid-cols-3` — as 3 provas
   sociais empilhavam verticalmente no mobile). Pedido do usuário: alinhar
   horizontalmente em toda LP, não só a partir do `md`. `TYPE.statNum` já
   tem um clamp mobile menor especificamente pra caber 3 colunas numa tela
   estreita sem estourar (ver config/_base.js). */
function StatsRow({ stats }) {
  const rowRef = useRef(null);
  const reduce = prefersReducedMotion();
  const active = useInView(rowRef, { once: true, amount: 0.6 }) || reduce;

  return (
    <div ref={rowRef} className="grid grid-cols-3">
      {stats.map((s, i) => (
        <div key={s.label} className="relative">
          {i > 0 && <Divider active={active} reduce={reduce} delay={i * 0.15} />}

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={active ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
            transition={{ duration: 0.8, delay: 0.12 + i * 0.12, ease: EASE_LUXE }}
            className="group flex flex-col items-center gap-2 rounded-2xl px-3 py-4 text-center transition-colors duration-500 ease-out hover:bg-white/[0.02] md:items-start md:gap-2.5 md:px-10 md:py-2 md:text-left md:first:pl-0"
          >
            <p className={`font-grotesk font-semibold leading-none tracking-tight text-rv-titanium ${TYPE.statNum}`}>
              <StatNumber raw={s.big} active={active} reduce={reduce} />
            </p>
            {/* Sentence case (como escrito nos dados), não `uppercase`: o
                brief aceitava sentence case OU title case — `capitalize`
                (title case via CSS) capitalizaria preposições em português
                ("Da Credibilidade Vem Do Design"), o que lê como IA
                traduzindo convenção do inglês, não como editorial. Sentence
                case natural já bate com a voz do resto do site (subheadline
                do hero também começa em minúscula, é frase corrida). */}
            <p className={`max-w-[12rem] font-satoshi font-medium leading-snug text-rv-slate ${TYPE.statLabel}`}>
              {s.label}
            </p>
          </motion.div>
        </div>
      ))}
    </div>
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

        <Fade delay={0.45} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticCta href={data.ctaPrimary.href} variant="solid">
            {data.ctaPrimary.label}
          </MagneticCta>
          <MagneticCta href={data.ctaSecondary.href} variant="ghost">
            {data.ctaSecondary.label}
          </MagneticCta>
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
        <DeviceShot images={data.deviceImages} />
      </FloatWrap>

      <Fade
        delay={0.7}
        className="relative z-10 mx-auto mt-10 flex w-full max-w-6xl flex-col items-stretch justify-between gap-8 border-t border-white/[0.06] pt-8 md:flex-row md:items-end"
      >
        <StatsRow stats={data.stats} />

        {/* v10 — vidro branco-neutro (`bg-white/[0.03]`) em vez do vidro
            escuro-violeta (`rgba(13,10,24,0.5)`) do v6: são duas famílias
            diferentes de "glassmorphism" — a antiga lê como painel sólido
            com leve transparência, esta lê como o vidro fosco nativo da
            Apple, um véu neutro sobre o preto de trás. Pedido explícito do
            brief, não uma correção — as duas são válidas, essa é a que se
            quer aqui agora. */}
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md md:mx-0">
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
