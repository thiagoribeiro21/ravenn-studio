import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function TextReveal({ text, style, className }) {
  const containerRef = useRef(null);

  // Sem `root` → usa o viewport do documento.
  // Funciona porque o SiteShell tem overflow:hidden, então elementos
  // abaixo do fold são fisicamente recortados do viewport — o
  // IntersectionObserver os vê como "fora de view" até o usuário
  // rolar até eles, tanto no desktop (scroll por lerp) quanto no
  // mobile (scroll nativo por touch).
  const isInView = useInView(containerRef, {
    once:   true,
    amount: 0.2,
  });

  const words = text.split(' ');

  return (
    <p ref={containerRef} style={{ margin: 0, ...style }} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.08, filter: 'blur(4px)' }}
          animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
          transition={{
            duration: 0.65,
            delay:    i * 0.05,
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
