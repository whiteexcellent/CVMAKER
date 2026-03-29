const fs = require('fs');

const content = `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AppleHeader from '@/components/AppleHeader';
import SoftAurora from '@/components/SoftAurora';
import BlurText from '@/components/BlurText';
import LogoLoop from '@/components/LogoLoop';
import BorderGlow from '@/components/BorderGlow';
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
        <ChevronDown className={\`w-5 h-5 text-zinc-500 transition-transform duration-300 \${isOpen ? 'rotate-180 text-white' : ''}\`} />
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
        <SoftAurora color1="#B3B6F4" color2="#6A82FB" speed={0.5} brightness={1.5} />
      </div>

      <AppleHeader />
      
      {/* 1. HERO SECTION */}
      <main className='relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-32'>
        <div className="flex justify-center items-center">
          <BlurText 
            text="The future of resumes." 
            delay={50} 
            animateBy="words" 
            direction="bottom" 
            className='text-5xl md:text-8xl font-semibold tracking-tighter max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 drop-shadow-sm'
          />
        </div>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
          className='mt-8 text-lg md:text-2xl text-white/90 max-w-4xl font-heavy tracking-wide'
        >
          Craft your professional story with precision. Designed for those who appreciate the details.
        </motion.p>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }} className='mt-12 flex flex-col sm:flex-row items-center gap-6'>
          <div className="relative group p-[2px] rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#6A82FB_25%,transparent_50%,#B3B6F4_75%,transparent_100%)] animate-[spin_3s_linear_infinite]" />
            <Link href='/dashboard' className='relative block px-8 py-4 rounded-full bg-black text-white font-semibold tracking-wide group-hover:bg-white/5 transition-all duration-300'>
              Get Started <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
          <div className="relative group p-[1px] rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#ffffff_50%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-30" />
            <Link href='#pricing' className='relative block px-8 py-4 rounded-full bg-black/40 backdrop-blur-xl text-white font-medium hover:bg-white/10 transition-colors duration-300'>
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
      <section id="features" className="relative z-10 w-full bg-black/40 backdrop-blur-3xl py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-3xl md:text-5xl font-geist font-bold text-white tracking-tight">Engineered for impact.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-geist">Every pixel, every data point is optimized to ensure your resume stands out.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BorderGlow glowColor="240 100% 70%" backgroundColor="#0a0a0a" className="p-8 rounded-3xl">
              <div className="flex flex-col h-full space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4"><Cpu className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold font-geist text-white tracking-tight">AI-Powered Parsing</h3>
                <p className="text-zinc-400 font-geist leading-relaxed">Our core engine analyzes job descriptions and perfectly tailors your experience context.</p>
              </div>
            </BorderGlow>
            <BorderGlow glowColor="280 100% 70%" backgroundColor="#0a0a0a" className="p-8 rounded-3xl">
              <div className="flex flex-col h-full space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4"><LayoutTemplate className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold font-geist text-white tracking-tight">Precision Templates</h3>
                <p className="text-zinc-400 font-geist leading-relaxed">Avoid the clutter. Our templates are mathematically designed using golden ratios.</p>
              </div>
            </BorderGlow>
            <BorderGlow glowColor="180 100% 50%" backgroundColor="#0a0a0a" className="p-8 rounded-3xl">
              <div className="flex flex-col h-full space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4"><ShieldAlert className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold font-geist text-white tracking-tight">ATS Guaranteed</h3>
                <p className="text-zinc-400 font-geist leading-relaxed">Tested against Workday, Greenhouse, and Lever. Perfection in parsing.</p>
              </div>
            </BorderGlow>
            <BorderGlow glowColor="320 100% 60%" backgroundColor="#0a0a0a" className="p-8 rounded-3xl">
              <div className="flex flex-col h-full space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4"><FileText className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold font-geist text-white tracking-tight">One-Click Export</h3>
                <p className="text-zinc-400 font-geist leading-relaxed">Generate pixel-perfect PDFs or live web links in milliseconds. Share anywhere.</p>
              </div>
            </BorderGlow>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE (Tilted Scroll Alternative in Pure Tailwind) */}
      <section id="templates" className="relative z-10 w-full py-32 bg-black border-t border-white/10 overflow-hidden">
        <div className="text-center space-y-4 mb-20 px-6">
          <h2 className="text-3xl md:text-5xl font-geist font-bold text-white tracking-tight">Pixel-perfect aesthetics.</h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto font-geist">Stand out in a sea of generic PDF exports. Choose from templates designed by top-tier UI professionals.</p>
        </div>
        
        {/* Tilted Perspective Container */}
        <div className="flex w-full overflow-visible justify-center relative [perspective:1000px] h-[500px]">
          <div className="absolute top-0 flex gap-6 md:gap-12 rotate-[-5deg] scale-110 [transform-style:preserve-3d]">
            {[1, 2, 3, 4, 5].map((item, idx) => (
              <div key={idx} className="w-[300px] md:w-[400px] h-[565px] bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex-shrink-0 group hover:-translate-y-4 transition-transform duration-500">
                {/* Mock CV UI Content */}
                <div className="w-1/3 h-4 bg-zinc-700 rounded-full mb-8"></div>
                <div className="w-full h-px bg-zinc-800 mb-6"></div>
                <div className="space-y-4">
                  <div className="w-3/4 h-3 bg-zinc-800 rounded-full"></div>
                  <div className="w-5/6 h-3 bg-zinc-800 rounded-full"></div>
                  <div className="w-2/3 h-3 bg-zinc-800 rounded-full"></div>
                </div>
                <div className="mt-12 space-y-4">
                  <div className="w-1/4 h-4 bg-zinc-700 rounded-full mb-4"></div>
                  <div className="w-full h-12 bg-zinc-800 rounded-lg"></div>
                  <div className="w-full h-12 bg-zinc-800 rounded-lg"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 hidden group-hover:flex items-center justify-center">
                  <button className="px-6 py-2 bg-white text-black font-geist font-semibold rounded-full shadow-lg">Preview Template</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (Timeline / AI Flow) */}
      <section id="how-it-works" className="relative z-10 w-full bg-zinc-950/80 backdrop-blur-xl py-32 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-sm mb-4">
              <Zap className="w-4 h-4" /> AI Powered Flow
            </div>
            <h2 className="text-3xl md:text-5xl font-geist font-bold text-white tracking-tight">How the magic happens.</h2>
          </div>

          <div className="relative border-l border-zinc-800 ml-4 md:ml-0 md:pl-8 space-y-24">
            {/* Step 1 */}
            <div className="relative pl-8 md:pl-12">
              <div className="absolute -left-[17px] md:-left-[41px] top-0 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center z-10">
                <span className="text-zinc-400 font-bold text-sm">1</span>
              </div>
              <h3 className="text-2xl font-bold font-geist text-white mb-2">Connect your data</h3>
              <p className="text-zinc-400 text-lg leading-relaxed">Import your LinkedIn profile or upload your dusty old PDF. We instantly parse your career history into structured data.</p>
            </div>
            
            {/* Step 2 */}
            <div className="relative pl-8 md:pl-12">
              <div className="absolute -left-[17px] md:-left-[41px] top-0 w-8 h-8 rounded-full bg-blue-500 border-4 border-black flex items-center justify-center z-10 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-geist text-white mb-2">AI Optimization</h3>
              <p className="text-zinc-400 text-lg leading-relaxed">Paste the job description you are aiming for. Our AI analyzes the keywords and seamlessly re-writes your bullet points to match perfectly.</p>
            </div>

            {/* Step 3 */}
            <div className="relative pl-8 md:pl-12">
              <div className="absolute -left-[17px] md:-left-[41px] top-0 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center z-10">
                 <span className="text-zinc-400 font-bold text-sm">3</span>
              </div>
              <h3 className="text-2xl font-bold font-geist text-white mb-2">Export & Apply</h3>
              <p className="text-zinc-400 text-lg leading-relaxed">Download a structurally perfect, visually stunning PDF or copy a live web link. Ready to hit send in under 5 minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS (Seamless Marquee) */}
      <section id="testimonials" className="relative z-10 w-full py-32 bg-black border-t border-white/10 overflow-hidden">
        <div className="text-center space-y-4 mb-20 px-6">
          <h2 className="text-3xl md:text-5xl font-geist font-bold text-white tracking-tight">Loved by professionals.</h2>
        </div>
        
        {/* Masked Marquee Container */}
        <div className="relative w-full" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
           <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-6 pl-6">
              {[...testimonials, ...testimonials].map((t, i) => (
                <div key={i} className="w-[350px] md:w-[450px] p-8 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm shrink-0 flex flex-col justify-between">
                  <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-white text-white" />)}
                  </div>
                  <p className="text-lg font-geist text-zinc-300 leading-relaxed mb-8">"{t.text}"</p>
                  <div>
                    <h4 className="text-white font-bold font-geist">{t.name}</h4>
                    <p className="text-sm text-zinc-500">{t.role}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section id="pricing" className="relative z-10 w-full bg-zinc-950/80 backdrop-blur-2xl py-32 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl md:text-5xl font-geist font-bold text-white tracking-tight">Simple, transparent pricing.</h2>
            <p className="text-zinc-400 text-lg">Invest in your career. Upgrade anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Free */}
            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 h-fit">
              <h3 className="text-xl font-bold font-geist text-white mb-2">Hobby</h3>
              <p className="text-zinc-400 mb-6 font-geist">Perfect to test the waters.</p>
              <div className="text-4xl font-bold text-white mb-8">$0<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {['1 Resume parsing', 'Basic PDF export', 'Standard templates'].map((feat, i) => (
                  <li key={i} className="flex gap-3 text-zinc-300 font-geist items-center"><Check className="w-5 h-5 text-zinc-500" /> {feat}</li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors">Start for free</button>
            </div>

            {/* Pro - With Glow */}
            <div className="relative group">
               <div className="absolute inset-[-2px] rounded-3xl bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#6A82FB_25%,transparent_50%,#B3B6F4_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-50 blur-sm" />
               <div className="relative p-8 rounded-3xl bg-black border border-white/20 h-[105%] flex flex-col justify-between shadow-2xl">
                  <div>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold font-geist uppercase tracking-widest mb-4">Most Popular</div>
                    <h3 className="text-xl font-bold font-geist text-white mb-2">Pro</h3>
                    <p className="text-zinc-400 mb-6 font-geist">The ultimate job hunting arsenal.</p>
                    <div className="text-4xl font-bold text-white mb-8">$15<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
                    <ul className="space-y-4 mb-8">
                      {['Unlimited Resumes', 'AI Keyword Matching', 'Premium Apple-style Templates', 'Cover Letter Generator', 'Priority Support'].map((feat, i) => (
                        <li key={i} className="flex gap-3 text-zinc-200 font-geist items-center"><Check className="w-5 h-5 pl-1 text-[#6A82FB]" /> {feat}</li>
                      ))}
                    </ul>
                  </div>
                  <button className="w-full py-4 rounded-xl bg-white text-black font-bold hover:scale-[1.02] transition-transform shadow-lg">Upgrade to Pro</button>
               </div>
            </div>

            {/* Lifetime */}
            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 h-fit">
              <h3 className="text-xl font-bold font-geist text-white mb-2">Lifetime</h3>
              <p className="text-zinc-400 mb-6 font-geist">Pay once, use forever.</p>
              <div className="text-4xl font-bold text-white mb-8">$149<span className="text-lg text-zinc-500 font-normal">/once</span></div>
              <ul className="space-y-4 mb-8">
                {['Everything in Pro', 'Lifetime access', 'Future templates included'].map((feat, i) => (
                  <li key={i} className="flex gap-3 text-zinc-300 font-geist items-center"><Check className="w-5 h-5 text-zinc-500" /> {feat}</li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors">Get Lifetime</button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION SECTION */}
      <section id="faq" className="relative z-10 w-full bg-black py-32 px-6 border-t border-white/10">
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
      <section className="relative z-10 w-full min-h-[60vh] flex flex-col justify-between pt-32 bg-zinc-950 border-t border-white/10 overflow-hidden">
        {/* Glow Element */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[400px] bg-[#6A82FB]/20 rounded-[100%] blur-[120px] pointer-events-none" />
        
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
`;

fs.writeFileSync('src/app/page.tsx', content);
