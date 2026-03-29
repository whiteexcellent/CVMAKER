"use client";
import React from 'react';
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, CreditCardIcon } from "@hugeicons/core-free-icons";

export default function PricingPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950/50">
      {/* Workspace Header */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 font-geist flex items-center gap-2">
            <HugeiconsIcon icon={CreditCardIcon} strokeWidth={1.5} className="w-5 h-5 text-white/70" />
            Billing & Plan
          </h1>
          <p className="text-zinc-400 text-sm">Manage your subscription and billing details.</p>
        </div>
      </div>

      {/* Workspace Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">      
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4 pt-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2 font-geist">
              Simple, transparent pricing.
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">Invest in your career. Upgrade anytime.</p>        
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
            {/* Free */}
            <div className="relative group rounded-[24px] overflow-hidden">   
               <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#34d399_25%,transparent_50%,#fb923c_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-30" />
               <div className="relative p-8 m-[1px] rounded-[23px] bg-zinc-950 flex flex-col h-full z-10 w-[calc(100%-2px)]">
                  <h3 className="text-xl font-bold font-geist text-white mb-2">Free</h3>
                  <p className="text-zinc-400 mb-6 font-geist">Perfect to test the waters.</p>
                  <div className="text-4xl font-bold text-white mb-8">$0<span className="text-lg text-zinc-500 font-normal">/yr</span></div>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {['1 Resume parsing', 'Basic PDF export', 'Standard templates'].map((feat, i) => (
                      <li key={i} className="flex gap-3 text-zinc-300 font-geist items-center">
                        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="w-5 h-5 text-zinc-500" /> {feat}
                      </li>       
                    ))}
                  </ul>
                  <button className="w-full py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors mt-auto">Current Plan</button>
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
                        <li key={i} className="flex gap-3 text-zinc-200 font-geist items-center">
                          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="w-5 h-5 text-[#34d399]" /> {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button className="w-full py-4 rounded-xl bg-white text-black font-bold hover:scale-[1.02] transition-transform shadow-lg mt-auto">Upgrade to Pro</button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
