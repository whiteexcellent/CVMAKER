'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Wand2, Download } from 'lucide-react';

export default function AIFlow() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 150) return 0;
        return prev + 0.5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const step1Active = progress >= 0;
  const step2Active = progress >= 45; // trigger slightly right as it touches
  const step3Active = progress >= 95; // trigger as it reaches end

  return (
    <section id="how-it-works" className="relative z-10 w-full py-32 bg-zinc-950/20 backdrop-blur-sm border-t border-white/5 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[600px] bg-gradient-to-b from-[#34d399]/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

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
            How the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fb923c] to-[#34d399]">magic</span> happens.
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 min-h-[300px]">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-[2px] bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#34d399] to-[#fb923c] transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* STEP 1 */}
          <div className={`relative flex flex-col items-center text-center transition-all duration-1000 ${step1Active ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'}`}>
            <div className="relative w-24 h-24 mb-8 flex justify-center items-center group overflow-hidden rounded-[24px]">
              {step1Active && (
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#34d399_25%,transparent_50%,#fb923c_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-50 blur-[2px]" /> 
              )}
              <div className={`absolute inset-[1px] rounded-[23px] bg-zinc-950 border transition-colors duration-500 ${step1Active ? 'border-[#34d399]/50 shadow-[0_0_30px_rgba(106,130,251,0.2)]' : 'border-zinc-800'}`} />
              <Database className={`w-10 h-10 relative z-10 transition-colors duration-500 ${step1Active ? 'text-white' : 'text-zinc-600'}`} />
            </div>

            <span className={`font-bold font-geist tracking-widest text-sm mb-3 transition-colors ${step1Active ? 'text-[#34d399]' : 'text-zinc-600'}`}>STEP 01</span>
            <h3 className="text-2xl font-bold font-geist text-white mb-4">Connect your data</h3>
            <p className="text-zinc-400 leading-relaxed max-w-sm">Import your LinkedIn profile or upload your dusty old PDF. We instantly parse your career history into structured data.</p>
          </div>

          {/* STEP 2 */}
          <div className={`relative flex flex-col items-center text-center transition-all duration-1000 ${step2Active ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'}`}>
            <div className="relative w-24 h-24 mb-8 flex justify-center items-center group overflow-hidden rounded-[24px]">
              {step2Active && (
                 <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#34d399_25%,transparent_50%,#fb923c_75%,transparent_100%)] animate-[spin_4s_linear_infinite]" />
              )}
              <div className={`absolute inset-[1px] rounded-[23px] bg-black border transition-colors duration-500 ${step2Active ? 'border-transparent shadow-[0_0_40px_rgba(106,130,251,0.3)]' : 'border-zinc-800'}`} />
              <Wand2 className={`w-10 h-10 relative z-10 transition-colors duration-500 ${step2Active ? 'text-white' : 'text-zinc-600'}`} />
            </div>
            
            <span className={`font-bold font-geist tracking-widest text-sm mb-3 transition-colors ${step2Active ? 'text-[#34d399]' : 'text-zinc-600'}`}>STEP 02</span>
            <h3 className="text-2xl font-bold font-geist text-white mb-4">AI Optimization</h3>
            <p className="text-zinc-400 leading-relaxed max-w-sm">Paste the job description you aim for. Our AI explicitly rewrites your bullet points to match the required keyword density naturally.</p>
          </div>

          {/* STEP 3 */}
          <div className={`relative flex flex-col items-center text-center transition-all duration-1000 ${step3Active ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'}`}>
            <div className="relative w-24 h-24 mb-8 flex justify-center items-center group overflow-hidden rounded-[24px]">
              {step3Active && (
                 <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#34d399_25%,transparent_50%,#fb923c_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-50 blur-[2px]" />
              )}
              <div className={`absolute inset-[1px] rounded-[23px] bg-zinc-950 border transition-colors duration-500 ${step3Active ? 'border-[#34d399]/50 shadow-[0_0_30px_rgba(106,130,251,0.2)]' : 'border-zinc-800'}`} />
              <Download className={`w-10 h-10 relative z-10 transition-colors duration-500 ${step3Active ? 'text-white' : 'text-zinc-600'}`} />
            </div>

            <span className={`font-bold font-geist tracking-widest text-sm mb-3 transition-colors ${step3Active ? 'text-[#34d399]' : 'text-zinc-600'}`}>STEP 03</span>
            <h3 className="text-2xl font-bold font-geist text-white mb-4">Export & Apply</h3>
            <p className="text-zinc-400 leading-relaxed max-w-sm">Download a structurally perfect, visually stunning PDF or copy a live web link. Ready to hit send in under 5 minutes.</p>
          </div>

        </div>
      </div>
    </section>
  );
}

