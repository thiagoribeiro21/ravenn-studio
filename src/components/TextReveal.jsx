import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useMenu } from '../context/MenuContext';

export default function TextReveal({ text, style, className }) {
  const { scrollContainerRef } = useMenu();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target:    containerRef,
    container: scrollContainerRef,
    offset:    ['start 0.9', 'start 0.42'],
  });

  const words = text.split(' ');

  return (
    <p ref={containerRef} style={{ margin: 0, ...style }} className={className}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end   = (i + 1) / words.length;
        return (
          <WordFade
            key={i}
            word={word}
            progress={scrollYProgress}
            start={start}
            end={end}
          />
        );
      })}
    </p>
  );
}

function WordFade({ word, progress, start, end }) {
  const opacity = useTransform(progress, [start, end], [0.1, 1]);
  const filter  = useTransform(
    progress,
    [start, end],
    ['blur(4px)', 'blur(0px)'],
  );

  return (
    <motion.span
      style={{ opacity, filter, display: 'inline-block', marginRight: '0.28em' }}
    >
      {word}
    </motion.span>
  );
}
