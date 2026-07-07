import { useEffect, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useVelocity,
  useTransform,
} from 'framer-motion';
import TextReveal from './TextReveal';
import { useMenu } from '../context/MenuContext';

// Coluna reservada só pra imagem — precisa bater exatamente com o `right` e o
// `width` do card flutuante abaixo, senão o alinhamento quebra por breakpoint.
const DOCK_COL   = 'clamp(180px, 15vw, 240px)';
const ROW_PAD_X  = 'clamp(32px, 5vw, 96px)';

function useCanHover() {
  const [ok, setOk] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const fn = () => setOk(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return ok;
}

const PRINCIPLES = [
  {
    num:   '001',
    label: 'Ser encontrado primeiro é vender mais',
    body:  'Soluções de inteligência artificial para empresas e criação de sites de alta conversão começam pelo mesmo ponto: visibilidade. Otimizamos cada detalhe técnico para sua empresa aparecer nas buscas que o seu cliente usa antes de ligar para o concorrente.',
    image: '/hover-reveal-ravenn/vision-01.webp',
  },
  {
    num:   '002',
    label: 'Design que fecha negócios antes da proposta',
    body:  'A presença digital da sua marca faz uma promessa silenciosa antes de você abrir a boca. Construímos sites premium que transmitem autoridade visual imediata e transformam o primeiro clique em confiança. Cada elemento visual serve para converter.',
    image: '/hover-reveal-ravenn/vision-02.webp',
  },
  {
    num:   '003',
    label: 'Automação que substitui o esforço repetitivo',
    body:  'Agentes de IA para WhatsApp e automação de atendimento para clínicas e serviços que trabalham enquanto você dorme. Seu negócio responde, qualifica e agenda sem depender de horário comercial ou de um funcionário disponível no momento certo.',
    image: '/hover-reveal-ravenn/vision-03.webp',
  },
];

export default function ManifestoSection() {
  const { scrollContainerRef } = useMenu();
  const canHover  = useCanHover();
  const [hoverIdx, setHoverIdx] = useState(null);
  const listRef   = useRef(null);
  const cardHRef  = useRef(300); // altura real do card, medida no 1º hover

  // Só o eixo Y segue o cursor — o eixo X fica travado na coluna reservada
  // (DOCK_COL), então never overlaps o texto, não importa o viewport.
  const mvY     = useMotionValue(0);
  const springY = useSpring(mvY, { stiffness: 100, damping: 20, mass: 0.5 });

  // Tilt cinematográfico: reage à velocidade vertical do movimento, não à
  // posição — dá a sensação de "arrasto" físico em vez de rotação estática.
  const velocityY   = useVelocity(springY);
  const rawTilt     = useTransform(velocityY, [-1200, 1200], [-6, 6], { clamp: true });
  const smoothTilt  = useSpring(rawTilt, { stiffness: 120, damping: 18, mass: 0.4 });

  const handleMouseMove = (e) => {
    if (!canHover || !listRef.current) return;
    const rect = listRef.current.getBoundingClientRect();
    const half = cardHRef.current / 2;
    const relY = e.clientY - rect.top;
    mvY.set(Math.min(Math.max(relY, half), rect.height - half));
  };

  return (
    <section
      id="manifesto"
      style={{ borderTop: '1px solid #1E1B4B', position: 'relative', overflow: 'hidden' }}
    >
      {/* Aura violeta lateral */}
      <div aria-hidden style={{
        position:      'absolute',
        top:           '20%',
        left:          '-15%',
        width:         600,
        height:        600,
        borderRadius:  '50%',
        background:    'radial-gradient(circle, rgba(76,29,149,0.22) 0%, transparent 65%)',
        filter:        'blur(90px)',
        pointerEvents: 'none',
      }} />

      {/* ── Citação principal — centrada, imersiva ──────────────────────────── */}
      <div
        style={{
          padding:  'clamp(80px, 12vw, 160px) clamp(32px, 8vw, 180px)',
          textAlign: 'center',
          position:  'relative',
          zIndex:    1,
        }}
      >
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, amount: 0.05, root: scrollContainerRef }}
          style={{ display: 'block', marginBottom: 36 }}
        >
        <span style={{
          fontSize:      10,
          fontWeight:    500,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color:         '#5B6472',
          display:       'inline',
        }}>
          — Nossa Visão
        </span>
        </motion.span>

        <blockquote style={{ margin: 0, padding: 0 }}>
          <TextReveal
            text='"Não entregamos apenas sites. Construímos a infraestrutura digital necessária para sua marca dominar o mercado local."'
            style={{
              fontSize:      'clamp(28px, 4.2vw, 58px)',
              fontWeight:    300,
              lineHeight:    1.3,
              letterSpacing: '-0.03em',
              color:         '#F8F9FA',
            }}
          />
        </blockquote>
      </div>

      {/* ── Pilares — lista horizontal brutalista ───────────────────────────── */}
      <div
        ref={listRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
        style={{
          borderTop: '1px solid #1E1B4B',
          position:  'relative',
          zIndex:    1,
        }}
      >
        {/* Imagem flutuante — dockada na coluna reservada (DOCK_COL), nunca
            sobre o texto. Só o Y segue o cursor; X é fixo por design. */}
        {canHover && (
          <AnimatePresence>
            {hoverIdx !== null && (
              <motion.div
                key="vision-hover-image"
                aria-hidden
                ref={(el) => { if (el) cardHRef.current = el.offsetHeight; }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position:      'absolute',
                  right:         ROW_PAD_X,
                  width:         DOCK_COL,
                  aspectRatio:   '3 / 4',
                  top:           springY,
                  y:             '-50%',
                  rotate:        smoothTilt,
                  borderRadius:  16,
                  overflow:      'hidden',
                  pointerEvents: 'none',
                  zIndex:        5,
                  background:    '#000',
                  border:        '1px solid rgba(255,255,255,0.08)',
                  boxShadow:     '0 40px 90px -20px rgba(0,0,0,0.80), 0 0 44px -14px rgba(124,58,237,0.35)',
                }}
              >
                <img
                  src={PRINCIPLES[hoverIdx].image}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  aria-hidden
                  style={{
                    position:     'absolute',
                    inset:        0,
                    background:   'linear-gradient(160deg, rgba(124,58,237,0.30) 0%, rgba(0,0,0,0.55) 100%)',
                    mixBlendMode: 'multiply',
                  }}
                />
                <div
                  aria-hidden
                  style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {PRINCIPLES.map((p, i) => (
          <motion.div
            key={p.num}
            initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.05, root: scrollContainerRef }}
            onMouseEnter={() => canHover && setHoverIdx(i)}
            className="flex flex-col items-start gap-3 px-6 py-7 md:grid md:items-center md:px-[clamp(32px,5vw,96px)] md:py-[clamp(28px,3.5vw,44px)] md:gap-[clamp(20px,3vw,48px)]"
            style={{
              // 4ª coluna fica sempre vazia — é o dock reservado pra imagem
              // flutuante (DOCK_COL), garantindo que o texto nunca disputa
              // espaço com ela em nenhum breakpoint.
              gridTemplateColumns: `clamp(52px, 8vw, 100px) 1fr 1fr ${DOCK_COL}`,
              borderBottom:        '1px solid rgba(30,27,75,0.6)',
              cursor:              'default',
            }}
            whileHover={{ backgroundColor: 'rgba(124,58,237,0.04)' }}
          >
            {/* Número */}
            <span style={{
              fontSize:      'clamp(11px, 1vw, 13px)',
              fontWeight:    500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color:         '#7C3AED',
              lineHeight:    1,
              flexShrink:    0,
            }}>
              {p.num}
            </span>

            {/* Título do pilar */}
            <h3 style={{
              fontSize:      'clamp(20px, 2.4vw, 32px)',
              fontWeight:    300,
              letterSpacing: '-0.025em',
              lineHeight:    1.15,
              color:         '#F8F9FA',
              margin:        0,
              textWrap:      'balance',
            }}>
              {p.label}
            </h3>

            {/* Descrição */}
            <p style={{
              fontSize:   'clamp(16px, 1.3vw, 18px)',
              fontWeight: 400,
              lineHeight: 1.72,
              color:      '#94A3B8',
              margin:     0,
              width:      '100%',
              textWrap:   'pretty',
            }}>
              {p.body}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── CTA pós-manifesto ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, amount: 0.05, root: scrollContainerRef }}
        style={{
          padding:        'clamp(40px, 5vh, 64px) clamp(32px, 5vw, 96px)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexWrap:       'wrap',
          gap:            24,
          position:       'relative',
          zIndex:         1,
          borderTop:      '1px solid #1E1B4B',
        }}
      >
        <p style={{
          fontSize:      15,
          fontWeight:    400,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color:         '#94A3B8',
          margin:        0,
        }}>
          Sua empresa merece uma presença que compete. Vamos começar.
        </p>

        <a
          href="#contact"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            10,
            height:         48,
            padding:        '0 28px',
            fontSize:       11,
            fontWeight:     500,
            textTransform:  'uppercase',
            letterSpacing:  '0.14em',
            background:     'transparent',
            color:          '#F8F9FA',
            borderRadius:   4,
            border:         '1px solid #2A2560',
            textDecoration: 'none',
            transition:     'border-color 250ms ease, box-shadow 250ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#7C3AED';
            e.currentTarget.style.boxShadow   = '0 0 24px -4px rgba(124,58,237,0.40)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#2A2560';
            e.currentTarget.style.boxShadow   = 'none';
          }}
        >
          Falar com Especialista →
        </a>
      </motion.div>
    </section>
  );
}
