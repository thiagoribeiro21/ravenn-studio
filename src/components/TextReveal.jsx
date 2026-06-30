import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useMenu } from '../context/MenuContext';

export default function TextReveal({ text, style, className }) {
  const { scrollContainerRef } = useMenu();
  const containerRef = useRef(null);

  const isInView = useInView(containerRef, {
    root: scrollContainerRef,
    once: true,
    amount: 0.15,
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
            duration: 0.7,
            delay: i * 0.045,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}
