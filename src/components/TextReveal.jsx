import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function TextReveal({ text, style, className }) {
  const containerRef = useRef(null);

  // once: false → animação tem ida e volta conforme o scroll
  // amount: 0.15 → dispara quando 15% do elemento está visível
  // Funciona no mobile porque o SiteShell tem overflow:hidden, recortando
  // o conteúdo abaixo do fold do viewport do documento — o IO sem root
  // detecta corretamente entrada e saída tanto no desktop (lerp) quanto
  // no mobile (scroll nativo por touch).
  const isInView = useInView(containerRef, {
    once:   false,
    amount: 0.15,
  });

  const words = text.split(' ');

  return (
    <p ref={containerRef} style={{ margin: 0, ...style }} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.08, filter: 'blur(4px)' }}
          animate={
            isInView
              ? { opacity: 1,    filter: 'blur(0px)' }
              : { opacity: 0.08, filter: 'blur(4px)' }
          }
          transition={{
            duration: isInView ? 0.65 : 0.35,
            delay:    isInView ? i * 0.05 : 0,
            ease:     [0.16, 1, 0.3, 1],
          }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}
