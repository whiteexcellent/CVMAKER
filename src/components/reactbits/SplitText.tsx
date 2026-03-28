'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useInView, Variants } from 'framer-motion';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  animationVariants?: Variants;
  onAnimationComplete?: () => void;
}

export function SplitText({
  text,
  className = '',
  delay = 0,
  animationVariants,
  onAnimationComplete,
}: SplitTextProps) {
  const letters = Array.from(text);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-10%' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9, filter: 'blur(8px)' },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        delay: delay + i * 0.04,
        type: 'spring',
        stiffness: 150,
        damping: 10,
        mass: 0.5,
      },
    }),
  };

  return (
    <div ref={containerRef} className={`inline-block ${className}`}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="hidden"
          animate={controls}
          variants={animationVariants || defaultVariants}
          onAnimationComplete={i === letters.length - 1 ? onAnimationComplete : undefined}
          className="inline-block whitespace-pre"
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}
