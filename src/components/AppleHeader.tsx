
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppleHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 p-[1px] rounded-full transition-all duration-500 ease-out shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#34d399_25%,transparent_50%,#fb923c_75%,transparent_100%)] animate-[spin_4s_linear_infinite]" />
      
      <div className={`relative flex items-center justify-between px-6 py-2 md:py-3 rounded-full h-full w-full bg-black`}>
        <div className='flex items-center gap-2 md:gap-8'>
          <Link href='/' className='font-bold font-geist text-white tracking-[0.1em] text-sm hover:opacity-80 transition-opacity'>
            CVMAKER
          </Link>
          
          <nav className='hidden md:flex items-center gap-6'>
            {[
              { label: 'Features', href: '#features' },
              { label: 'How it Works', href: '#how-it-works' },
              { label: 'Testimonials', href: '#testimonials' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' }
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className='text-xs font-semibold font-geist tracking-wide text-zinc-400 hover:text-white transition-colors duration-300'
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className='flex items-center gap-3 md:border-l md:border-white/10 md:pl-6 md:ml-2'>
            <Link href='/login' className='text-xs font-semibold font-geist text-zinc-400 hover:text-white transition-colors'>
              Log in
            </Link>
            <div className="relative group/btn p-[1px] rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#ffffff_50%,transparent_100%)] animate-[spin_4s_linear_infinite]" />
              <Link href='/signup' className='relative block text-xs font-bold font-geist px-4 py-2 bg-black text-white rounded-full hover:bg-zinc-900 transition-all duration-300'>
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}


