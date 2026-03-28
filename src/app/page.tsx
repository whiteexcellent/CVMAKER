
import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-black text-white selection:bg-white/30'>
      <main className='flex flex-col items-center justify-center min-h-[90vh] px-6 text-center pt-32'>
        <h1 className='text-5xl md:text-8xl font-medium tracking-tighter max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60'>
          The future of resumes.
        </h1>
        <p className='mt-8 text-lg md:text-2xl text-zinc-400 max-w-2xl font-light tracking-wide'>
          Craft your professional story with precision. Designed for those who appreciate the details.
        </p>
        
        <div className='mt-12 flex flex-col sm:flex-row items-center gap-6'>
          <Link 
            href='/dashboard' 
            className='px-8 py-4 rounded-full bg-white text-black font-medium hover:scale-105 transition-transform duration-300'
          >
            Get Started
          </Link>
          <Link 
            href='/pricing' 
            className='px-8 py-4 rounded-full bg-zinc-900 border border-zinc-800 text-white font-medium hover:bg-zinc-800 transition-colors'
          >
            View Pricing
          </Link>
        </div>
      </main>
    </div>
  );
}

