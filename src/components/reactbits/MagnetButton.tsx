'use client';

import React, { useRef, useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface MagnetButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  magnetStrength?: number;
  className?: string;
}

export function MagnetButton({
  children,
  magnetStrength = 0.5,
  className = '',
  ...props
}: MagnetButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const { clientX, clientY } = e;
    const { width, height, left, top } = buttonRef.current.getBoundingClientRect();
    
    // Calculate distance from center
    const x = ((clientX - left) - width / 2) * magnetStrength;
    const y = ((clientY - top) - height / 2) * magnetStrength;
    
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        mass: 0.5
      }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Shine effect that moves relative to cursor */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] mix-blend-overlay opacity-30 bg-[radial-gradient(circle_at_var(--x,_50%)_var(--y,_50%),_rgba(255,255,255,0.8)_0%,_transparent_60%)]"
        animate={{
          '--x': `${50 + position.x}%`,
          '--y': `${50 + position.y}%`,
        } as unknown as string}
        transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
      />
      <span className="relative z-10 block">{children}</span>
    </motion.button>
  );
}
