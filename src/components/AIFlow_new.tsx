'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Wand2, Download } from 'lucide-react';

export default function AIFlow() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const step1Active = progress >= 0;
  const step2Active = progress >= 33;
  const step3Active = progress >= 66;

  return (
    <section id="how-it-works" className="relative z-10 w-full py-32 bg-black border-t border-white/5 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[600px] bg-gradient-to-b from-[#6A82FB]/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-sm shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          >
            <Wand2 className="w-4 h-4" /> The Intelligent Workflow
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-geist font-bold text-white tracking-tight">
            How the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B3B6F4] to-[#6A82FB]">magic</span> happens.
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 min-h-[300px]">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-[2px] bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#6A82FB] to-[#B3B6F4] transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* STEP 1 */}
          <div className={`relative flex flex-col items-center text-center transition-all duration-1000 ${step1Active ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'}`}>
            
            {/* Safe Wrapper with fixed rounded corners and Strict overflow-hidden so the spinning gradient doesn't bleed out */}
            <div className={`relative w-24 h-24 mb-8 rounded-[24px] overflow-hidden flex justify-center items-center ${step1Active ? 'shadow-[0_0_30px_rgba(106,130,251,0.2)]' : ''}`}>
              {step1Active ? (
                // Super wide background so when it spins it fills corners. Overflow hidden handles the clipping perfectly.
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#6A82FB_25%,transparent_50%,#B3B6F4_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-80" />
              ) : (
                <div className="absolute inset-0 bg-zinc-800" />
              )}
              {/* Inner core to mask the gradient with absolute solid color. Leaves exact 1px or 2px space to visually be the glowing border. */}
              <div className="absolute inset-[1px] bg-[#09090b] rounded-[23px] z-10 flex items-center justify-center">
                <Database className={`w-10 h-10 transition-colors duration-500 ${step1Active ? 'text-white' : 'text-zinc-600'}`} />
              </div>
            </div>
            
            <span className={`font-bold font-geist tracking-widest text-sm mb-3 transition-colors ${step1Active ? 'text-[#6A82FB]' : 'text-zinc-600'}`}>STEP 01</span>
            <h3 className="text-2xl font-bold font-geist text-white mb-4">Connect your data</h3>
            <p className="text-zinc-400 leading-relaxed max-w-sm">Import your LinkedIn profile or upload your dusty old PDF. We instantly parse your career history into structured data.</p>
          </div>

          {/* STEP 2 */}
          <div className={`relative flex flex-col items-center text-center transition-all duration-1000 ${step2Active ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'}`}>
            
            <div className={`relative w-24 h-24 mb-8 rounded-[24px] overflow-hidden flex justify-center items-center ${step2Active ? 'shadow-[0_0_50px_rgba(106,130,251,0.4)]' : ''}`}>
              {step2Active ? (
                 <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#6A82FB_25%,transparent_50%,#B3B6F4_75%,transparent_100%)] animate-[spin_4s_linear_infinite]" />
              ) : (
                 <div className="absolute inset-0 bg-zinc-800" />
              )}
              <div className="absolute inset-[1px] bg-[#09090b] rounded-[23px] z-10 flex items-center justify-center">
                <Wand2 className={`w-10 h-10 transition-colors duration-500 ${step2Active ? 'text-white' : 'text-zinc-600'}`} />
              </div>
            </div>
            
            <span className={`font-bold font-geist tracking-widest text-sm mb-3 transition-colors ${step2Active ? 'text-[#6A82FB]' : 'text-zinc-600'}`}>STEP 02</span>
            <h3 className="text-2xl font-bold font-geist text-white mb-4">AI Optimization</h3>
            <p className="text-zinc-400 leading-relaxed max-w-sm">Paste the job description you aim for. Our AI explicitly rewrites your bullet points to match the required keyword density naturally.</p>
          </div>

          {/* STEP 3 */}
          <div className={`relative flex flex-col items-center text-center transition-all duration-1000 ${step3Active ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'}`}>
            
            <div className={`relative w-24 h-24 mb-8 rounded-[24px] overflow-hidden flex justify-center items-center ${step3Active ? 'shadow-[0_0_30px_rgba(106,130,251,0.2)]' : ''}`}>
              {step3Active ? (
                 <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#6A82FB_25%,transparent_50%,#B3B6F4_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-80" />
              ) : (
                <div className="absolute inset-0 bg-zinc-800" />
              )}
              <div className="absolute inset-[1px] bg-[#09090b] rounded-[23px] z-10 flex items-center justify-center">
                <Download className={`w-10 h-10 transition-colors duration-500 ${step3Active ? 'text-white' : 'text-zinc-600'}`} />
              </div>
            </div>

            <span className={`font-bold font-geist tracking-widest text-sm mb-3 transition-colors ${step3Active ? 'text-[#6A82FB]' : 'text-zinc-600'}`}>STEP 03</span>
            <h3 className="text-2xl font-bold font-geist text-white mb-4">Export & Apply</h3>
            <p className="text-zinc-400 leading-relaxed max-w-sm">Download a structurally perfect, visually stunning PDF or copy a live web link. Ready to hit send in under 5 minutes.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
