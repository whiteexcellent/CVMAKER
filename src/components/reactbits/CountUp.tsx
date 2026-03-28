'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  separator?: string;
  decimals?: number;
  className?: string;
}

export function CountUp({
  from = 0,
  to,
  duration = 2,
  separator = ',',
  decimals = 0,
  className = '',
}: CountUpProps) {
  const [hasRun, setHasRun] = useState(false);
  const springValue = useSpring(from, {
    bounce: 0,
    duration: duration * 1000,
  });

  const formattedValue = useTransform(springValue, (latest) => {
    return Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
      .format(latest)
      .replace(/,/g, separator);
  });

  useEffect(() => {
    springValue.set(to);
    setHasRun(true);
  }, [springValue, to]);

  return <motion.span className={className}>{formattedValue}</motion.span>;
}
