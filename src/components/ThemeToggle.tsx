'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/8 bg-white/65 text-zinc-900 shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-all duration-300 outline-none hover:border-black/14 hover:bg-white/85 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:shadow-[0_8px_30px_rgba(0,0,0,0.22)] dark:hover:border-white/20 dark:hover:bg-white/[0.1]"
    >
      <motion.span
        key={theme}
        initial={{ scale: 0.72, opacity: 0.45 }}
        animate={{ scale: 1.45, opacity: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full border border-black/10 dark:border-white/16"
      />
      <div className="absolute inset-0 translate-x-[-150%] skew-x-[-30deg] rounded-full bg-gradient-to-tr from-transparent via-white/55 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-[150%] dark:via-white/12"></div>

      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? -180 : 0,
          scale: isDark ? 0 : 1,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        className="absolute"
      >
        <Sun className="h-4 w-4 drop-shadow-sm" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : 180,
          scale: isDark ? 1 : 0,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        className="absolute"
      >
        <Moon className="h-4 w-4 drop-shadow-sm" />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </motion.button>
  );
}
