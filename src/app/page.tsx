"use client";




import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AppleHeader from '@/components/AppleHeader';
import SoftAurora from '@/components/SoftAurora';
import BlurText from '@/components/BlurText';
import LogoLoop from '@/components/LogoLoop';
import BorderGlow from '@/components/BorderGlow';
import AIFlow from '@/components/AIFlow';
import { techLogos } from '@/components/CompanyLogos';
import { 
  FileText, Cpu, LayoutTemplate, ShieldAlert, 
  ChevronDown, Check, Star, Sparkles, Zap 
} from 'lucide-react';

const faqs = [
  { q: "Is it completely ATS-friendly?", a: "Yes. Our templates are rigorously tested against top Applicant Tracking Systems like Workday, Greenhouse, and Lever." },
  { q: "Can I export to PDF?", a: "Absolutely. You can export high-quality, pixel-perfect PDFs with a single click, perfectly scaled for A4 or US Letter." },
  { q: "How does the AI tailoring work?", a: "We use advanced large language models to analyze your target job description and precisely re-write your experience bullet points to match the required keywords naturally." },
  { q: "Is my personal data secure?", a: "We use enterprise-grade end-to-end encryption. Your data is entirely yours, and we never sell your information to third-party advertisers." },
];

const testimonials = [
  { name: "Sarah L.", role: "Product Manager at Google", text: "CVMAKER completely transformed my job hunt. The AI parsing made my resume ATS-proof in seconds." },
  { name: "Mark D.", role: "Senior Software Engineer", text: "The templates are gorgeous. I've never received so many interview callbacks in such a short time." },
  { name: "Elena R.", role: "Marketing Director", text: "Sleek, fast, and incredibly intuitive. It feels like an Apple product built exclusively for career growth." },
  { name: "James T.", role: "Data Scientist", text: "Worth every penny. The AI suggestions for my bullet points were spot on and incredibly professional." },
  { name: "Jessica W.", role: "UX/UI Designer", text: "The visual quality of the exported PDF is unmatched. I highly recommend it to all design professionals." },
];

function FAQItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-6 text-left focus:outline-none group">
        <span className="text-lg font-medium font-geist text-zinc-200 group-hover:text-white transition-colors">{q}</span>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-6 text-zinc-400 font-geist leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className='relative min-h-screen w-full bg-black text-white selection:bg-white/30 overflow-x-hidden font-sans'>
      
      {/* 0. Background Aurora */}
      <div className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none opacity-60">
        <SoftAurora color1="#fb923c" color2="#34d399" speed={0.5} brightness={1.5} />
      </div>

      <AppleHeader />
      
      {/* 1. HERO SECTION */}
      <main className='relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-32'>
        <div className="w-full flex justify-center items-center">
          <BlurText 
            text="The future of resumes."
            delay={50}
            animateBy="words"
            direction="bottom"
            className='text-6xl md:text-8xl font-geist font-bold tracking-tighter text-white drop-shadow-md justify-center w-full'
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
          className='mt-8 text-xl md:text-2xl text-zinc-400 max-w-3xl font-geist font-light tracking-wide leading-relaxed'
        >
          Craft your professional story with precision. Designed for those who appreciate the details.
        </motion.p>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }} className='mt-12 flex flex-col sm:flex-row items-center gap-6'>
          <div className="relative group p-[2px] rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#34d399_25%,transparent_50%,#fb923c_75%,transparent_100%)] animate-[spin_4s_linear_infinite]" />
            <Link href='/dashboard' className='relative block px-8 py-4 rounded-full bg-black text-white font-semibold tracking-wide hover:bg-zinc-900 transition-all duration-300'>
              Get Started <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
          <div className="relative group p-[1px] rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#ffffff_50%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-30" />
            <Link href='#pricing' className='relative block px-8 py-4 rounded-full bg-black text-white font-medium hover:bg-zinc-900 transition-colors duration-300'>
              View Pricing
            </Link>
          </div>
        </motion.div>

        {/* LOGO LOOP */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2 }} className='w-screen mt-32 space-y-6 pt-12 border-t border-white/5 bg-white/5 backdrop-blur-sm'>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-[0.25em]">Trusted by innovators worldwide</p>
          <div className="relative w-full overflow-hidden flex justify-center items-center pb-8" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
            <LogoLoop logos={techLogos} speed={62.5} gap={120} className="py-4" direction="left" pauseOnHover={true} ariaLabel="Trusted by top companies" />
          </div>
        </motion.div>
      </main>

      {/* 2. FEATURES GRID (Bento) */}
      <section id="features" className="relative z-10 w-full bg-zinc-950/20 backdrop-blur-sm py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-3xl md:text-5xl font-geist font-bold text-white tracking-tight">Engineered for impact.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-geist">Every pixel, every data point is optimized to ensure your resume stands out.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BorderGlow glowColor="152 76% 53%" backgroundColor="#0a0a0a" className="p-8 rounded-3xl">
              <div className="flex flex-col h-full space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4"><Cpu className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold font-geist text-white tracking-tight">AI-Powered Parsing</h3>
                <p className="text-zinc-400 font-geist leading-relaxed">Our core engine analyzes job descriptions and perfectly tailors your experience context.</p>
              </div>
            </BorderGlow>
            <BorderGlow glowColor="25 95% 53%" backgroundColor="#0a0a0a" className="p-8 rounded-3xl">
              <div className="flex flex-col h-full space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4"><LayoutTemplate className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold font-geist text-white tracking-tight">Precision Templates</h3>
                <p className="text-zinc-400 font-geist leading-relaxed">Avoid the clutter. Our templates are mathematically designed using golden ratios.</p>
              </div>
            </BorderGlow>
            <BorderGlow glowColor="45 93% 55%" backgroundColor="#0a0a0a" className="p-8 rounded-3xl">
              <div className="flex flex-col h-full space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4"><ShieldAlert className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold font-geist text-white tracking-tight">ATS Guaranteed</h3>
                <p className="text-zinc-400 font-geist leading-relaxed">Tested against Workday, Greenhouse, and Lever. Perfection in parsing.</p>
              </div>
            </BorderGlow>
            <BorderGlow glowColor="170 70% 50%" backgroundColor="#0a0a0a" className="p-8 rounded-3xl">
              <div className="flex flex-col h-full space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4"><FileText className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold font-geist text-white tracking-tight">One-Click Export</h3>
                <p className="text-zinc-400 font-geist leading-relaxed">Generate pixel-perfect PDFs or live web links in milliseconds. Share anywhere.</p>
              </div>
            </BorderGlow>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (Timeline / AI Flow) */}
      <AIFlow />

      {/* 5. TESTIMONIALS (Seamless Marquee) */}
      <section id="testimonials" className="relative z-10 w-full py-32 bg-transparent border-t border-white/5 overflow-hidden">
        <div className="text-center space-y-4 mb-20 px-6">
          <h2 className="text-3xl md:text-5xl font-geist font-bold text-white tracking-tight">Loved by professionals.</h2>
        </div>
        
        {/* Masked Marquee Container */}
        <div className="relative w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>      
           <motion.div 
             className="flex w-max gap-6"
             animate={{ x: ["0%", "calc(-50% - 0.75rem)"] }}
             transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
           >
              {[...testimonials, ...testimonials].map((t, i) => (
                <div key={i} className="relative group rounded-[24px] overflow-hidden w-[350px] md:w-[450px] shrink-0">
                  <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#34d399_25%,transparent_50%,#fb923c_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex flex-col justify-between m-[1px] p-8 rounded-[23px] bg-zinc-950/90 backdrop-blur-sm z-10 w-[calc(100%-2px)] h-full">
                    <div>
                      <div className="flex gap-1 mb-6">
                        {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-white text-white" />)}
                      </div>
                      <p className="text-lg font-geist text-zinc-300 leading-relaxed mb-8">"{t.text}"</p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold font-geist">{t.name}</h4>
                      <p className="text-sm text-zinc-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
             </motion.div>
          </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section id="pricing" className="relative z-10 w-full bg-zinc-950/20 backdrop-blur-sm py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl md:text-5xl font-geist font-bold text-white tracking-tight">Simple, transparent pricing.</h2>
            <p className="text-zinc-400 text-lg">Invest in your career. Upgrade anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">  
            {/* Free */}
            <div className="relative group rounded-[24px] overflow-hidden">
               <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#34d399_25%,transparent_50%,#fb923c_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-30" />     
               <div className="relative p-8 m-[1px] rounded-[23px] bg-zinc-950 flex flex-col h-full z-10 w-[calc(100%-2px)]">
                  <h3 className="text-xl font-bold font-geist text-white mb-2">Free</h3>
                  <p className="text-zinc-400 mb-6 font-geist">Perfect to test the waters.</p>
                  <div className="text-4xl font-bold text-white mb-8">$0<span className="text-lg text-zinc-500 font-normal">/yr</span></div>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {['1 Resume parsing', 'Basic PDF export', 'Standard templates'].map((feat, i) => (
                      <li key={i} className="flex gap-3 text-zinc-300 font-geist items-center"><Check className="w-5 h-5 text-zinc-500" /> {feat}</li>
                    ))}
                  </ul>
                  <button className="w-full py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors mt-auto">Start for free</button>
               </div>
            </div>

            {/* Pro - With Glow */}
            <div className="relative group rounded-[24px] overflow-hidden">
               <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#34d399_25%,transparent_50%,#fb923c_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-80" />     
               <div className="relative p-8 m-[1px] rounded-[23px] bg-black flex flex-col h-full z-10 w-[calc(100%-2px)] shadow-2xl">
                  <div>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold font-geist uppercase tracking-widest mb-4">Most Popular</div>
                    <h3 className="text-xl font-bold font-geist text-white mb-2">Pro</h3>
                    <p className="text-zinc-400 mb-6 font-geist">The ultimate job hunting arsenal.</p>
                    <div className="text-4xl font-bold text-white mb-8">$99<span className="text-lg text-zinc-500 font-normal">/yr</span></div>
                    <ul className="space-y-4 mb-8">
                      {['Unlimited Resumes', 'AI Keyword Matching', 'Premium Apple-style Templates', 'Cover Letter Generator', 'Priority Support'].map((feat, i) => (
                        <li key={i} className="flex gap-3 text-zinc-200 font-geist items-center"><Check className="w-5 h-5 pl-1 text-[#34d399]" /> {feat}</li>  
                      ))}
                    </ul>
                  </div>
                  <button className="w-full py-4 rounded-xl bg-white text-black font-bold hover:scale-[1.02] transition-transform shadow-lg mt-auto">Upgrade to Pro</button>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION SECTION */}
      <section id="faq" className="relative z-10 w-full bg-transparent py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-geist font-bold text-white tracking-tight mb-4">Frequently asked questions.</h2>
            <p className="text-zinc-400">Everything you need to know about the product and billing.</p>
          </div>
          <div className="border-t border-white/10">
            {faqs.map((faq, idx) => (
              <FAQItem key={idx} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA & FOOTER */}
      <section className="relative z-10 w-full min-h-[60vh] flex flex-col justify-between pt-32 bg-transparent border-t border-white/5 overflow-hidden">
        {/* Glow Element */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[400px] bg-[#34d399]/20 rounded-[100%] blur-[120px] pointer-events-none" />
        
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10">
          <h2 className="text-5xl md:text-8xl font-geist font-bold text-white tracking-tighter mb-8 max-w-4xl leading-tight">
            Stop trying to fit in. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-100">Start standing out.</span>
          </h2>
          <Link href='/signup' className='px-10 py-5 rounded-full bg-white text-black font-bold tracking-wide hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] md:text-lg'>
             Build Your Next Resume
          </Link>
        </div>

        {/* Footer Minimal Apple Style */}
        <footer className="w-full border-t border-white/10 mt-32 py-12 px-6 text-center md:text-left">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="font-bold font-geist tracking-[0.2em] text-white">CVMAKER</div>
            <div className="flex gap-6 text-sm text-zinc-500 font-medium">
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            </div>
            <div className="text-xs text-zinc-600">© 2026 CVMaker. All rights reserved.</div>
          </div>
        </footer>
      </section>

    </div>
  );
}

