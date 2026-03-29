"use client";
import { HugeiconsIcon } from "@hugeicons/react";
import { DocumentAttachmentIcon, Note01Icon, ComputerIcon, Download04Icon, EnergyIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";


import React from "react";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Keyframes & Easing
const revealVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08 
    } 
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

type DashboardClientProps = {
  totalCredits?: number;
  resumes?: Array<{ id: string }>;
  coverLetters?: Array<{ id: string }>;
  presentations?: Array<{ id: string }>;
  isPro?: boolean;
};

export default function DashboardClient({
  totalCredits = 0,
  resumes = [],
  coverLetters = [],
  presentations = [],
  isPro = false,
}: DashboardClientProps) {
  const router = useRouter();
  const totalDocuments = resumes.length + coverLetters.length + presentations.length;
  const planLabel = isPro ? "Pro" : "Starter";

  return (
    <div className="flex flex-col h-full bg-zinc-950/50 text-white font-geist selection:bg-emerald-500/30">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">
          <motion.div 
        className="max-w-[1440px] mx-auto space-y-8"
        variants={revealVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ROW 1: WORKSPACE HEADER STRIP */}
        <motion.div 
          variants={itemVariants}
          className="relative w-full rounded-[28px] bg-[#0A0A0A] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
        >
          {/* Subtle Aurora in Header */}
          <div className="absolute top-[-50%] left-[-10%] w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-2.5">
            <div className="flex items-center gap-2 text-[12px] font-medium tracking-[0.18em] uppercase text-white/40 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Omni AI Workspace
            </div>
            <h1 className="text-3xl md:text-[32px] font-bold tracking-tight text-white leading-tight">
              Welcome back
            </h1>
            <p className="text-[15px] text-white/50 font-light max-w-xl">
              Build tailored resumes, cover letters, and pitch decks from one place.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#101010] border border-white/[0.08] py-2 px-4 rounded-[16px]">
              <HugeiconsIcon icon={EnergyIcon} className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]"  strokeWidth={1.5} />
              <span className="text-[14px] font-medium text-white/90">{totalCredits}</span>
              <span className="text-[12px] text-white/40 ml-1">Credits</span>
            </div>
            
            <div className="flex items-center gap-2 bg-[#101010] border border-white/[0.08] py-2 px-4 rounded-[16px]">
              <span className="text-[14px] font-medium text-white/80">{planLabel}</span>
              <div className="w-[1px] h-3 bg-white/10 mx-1" />
              <span className="text-[12px] text-orange-400/80 font-medium">{isPro ? "Active" : "Free"}</span>
            </div>

            <Button 
              onClick={() => router.push('/pricing')}
              className="bg-[#141414] border border-orange-500/20 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 hover:border-orange-500/30 rounded-[14px] px-6 h-[42px] transition-all shadow-[0_0_15px_rgba(251,146,60,0.05)]"
            >
              Plan Details
            </Button>
          </div>
        </motion.div>

        {/* ROW 2: QUICK ACTIONS */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ActionCard 
            icon={<HugeiconsIcon icon={DocumentAttachmentIcon} className="w-5 h-5 text-emerald-400"  strokeWidth={1.5} />}
            title="New Resume"
            description="Create an AI-tailored resume from scratch."
            accent="emerald"
            onClick={() => router.push('/cv')}
          />
          <ActionCard 
            icon={<HugeiconsIcon icon={Note01Icon} className="w-5 h-5 text-white/70"  strokeWidth={1.5} />}
            title="Cover Letter"
            description="Generate a job-specific letter in minutes."
            accent="neutral"
            onClick={() => router.push('/cover-letter')}
          />
          <ActionCard 
            icon={<HugeiconsIcon icon={ComputerIcon} className="w-5 h-5 text-emerald-400"  strokeWidth={1.5} />}
            title="Presentation"
            description="Build a concise pitch deck for interviews."
            accent="emerald"
            onClick={() => router.push('/presentation')}
          />
          <ActionCard 
            icon={<HugeiconsIcon icon={Download04Icon} className="w-5 h-5 text-orange-400"  strokeWidth={1.5} />}
            title="Import Profile"
            description="Bring in LinkedIn or PDF content fast."
            accent="orange"
            onClick={() => {}} 
          />
        </motion.div>

        {/* ROW 3: MAIN DASHBOARD SPLIT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left 8 Columns - Recent Documents */}
          <motion.div variants={itemVariants} className="xl:col-span-8 flex flex-col h-full">
            <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-[24px] p-6 lg:p-8 min-h-[360px] flex flex-col relative overflow-hidden flex-1 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[22px] font-semibold tracking-tight text-white/90">Recent Documents</h2>
              </div>

              {/* Empty State */}
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
                <div className="w-[64px] h-[64px] rounded-[20px] bg-[#141414] border border-white/5 flex items-center justify-center mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_10px_20px_rgba(0,0,0,0.3)]">
                  <HugeiconsIcon icon={DocumentAttachmentIcon} className="w-7 h-7 text-emerald-400/80"  strokeWidth={1.5} />
                </div>
                <h3 className="text-[20px] font-semibold text-white/90 mb-2 tracking-tight">Start your first document</h3>
                <p className="text-[15px] text-white/50 font-light mb-8 leading-relaxed max-w-sm mx-auto">
                  Create a resume, import an existing CV, or generate a job-specific cover letter.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button 
                    onClick={() => router.push('/cv')} 
                    className="bg-[#141414] border border-white/[0.08] text-white/90 hover:bg-[#1A1A1A] hover:border-white/[0.15] hover:text-white rounded-[14px] h-[44px] px-6 text-[14px] font-medium transition-all"
                  >
                    Create Resume
                  </button>
                  <button 
                    className="bg-[#141414] border border-white/[0.08] text-white/90 hover:bg-[#1A1A1A] hover:border-white/[0.15] hover:text-white rounded-[14px] h-[44px] px-6 text-[14px] font-medium transition-all"
                  >
                    Import Profile
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right 4 Cols - Plan Overview */}
          <motion.div variants={itemVariants} className="xl:col-span-4 flex flex-col h-full">
             <div className="bg-[#0A0A0A] border border-orange-500/[0.12] rounded-[24px] p-7 relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_40px_rgba(251,146,60,0.08)] flex-1 flex flex-col">
                <div className="absolute -bottom-20 -right-20 w-[200px] h-[200px] bg-orange-500/10 blur-[80px] pointer-events-none group-hover:bg-orange-500/15 transition-colors duration-500" />
                
                <h3 className="text-[18px] font-semibold tracking-tight text-white/90 mb-1 relative z-10">Usage Overview</h3>
                <p className="text-[14px] text-white/50 mb-6 relative z-10">{planLabel} Plan • {totalCredits} credits left</p>

                <div className="space-y-3 mb-8 relative z-10 text-[14px] text-white/65 flex-1">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2/5 min-h-[44px]">
                    <span>Credits used today</span>
                    <span className="font-semibold text-white/85">0</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2/5 min-h-[44px]">
                    <span>Documents created</span>
                    <span className="font-semibold text-white/85">{totalDocuments}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2/5 min-h-[44px]">
                    <span>Current plan</span>
                    <span className="font-semibold text-orange-300">{planLabel}</span>
                  </div>
                </div>

                <div className="relative z-10 w-full p-[1px] rounded-[16px] bg-linear-to-r from-orange-500/20 to-orange-400/5 group-hover:from-orange-500/40 group-hover:to-orange-400/20 transition-colors duration-300 mt-auto">
                  <button
                    onClick={() => router.push('/pricing')}
                    className="w-full bg-[#101010] py-3 rounded-[15px] text-[15px] font-semibold text-orange-300 flex items-center justify-center gap-2 hover:bg-orange-500/5 transition-colors"
                  >
                    Manage Plan <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4"  strokeWidth={1.5} />
                  </button>
                </div>
             </div>
          </motion.div>

        </div>

        {/* ROW 4: SECONDARY SPLIT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left 8 Cols - Continue Editing */}
          <motion.div variants={itemVariants} className="xl:col-span-8 flex flex-col gap-5">
            <h3 className="text-[20px] font-semibold tracking-tight text-white/90 px-2 mt-2">Continue Editing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-[24px] p-5 hover:border-white/[0.15] transition-all group cursor-pointer flex flex-col hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-[16px] bg-[#141414] border border-white/5 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <HugeiconsIcon icon={DocumentAttachmentIcon} className="w-5 h-5 text-emerald-400/80"  strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white/90 text-[16px] mb-0.5">Frontend Dev CV</h4>
                      <p className="text-[13px] text-white/40">Edited 2h ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-[#1A1A1A] border-white/10 text-[11px] font-normal text-white/50 px-2.5 py-0.5 rounded-full">Draft</Badge>
                </div>
                <div className="mt-auto flex items-center justify-between text-sm pt-2">
                  <span className="text-white/40 text-[13px]">65% complete</span>
                  <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[13px] font-medium -translate-x-2 group-hover:translate-x-0 duration-300">
                    Continue <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5"  strokeWidth={1.5} />
                  </span>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-[24px] p-5 hover:border-white/[0.15] transition-all group cursor-pointer flex flex-col hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-[16px] bg-[#141414] border border-white/5 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <HugeiconsIcon icon={Note01Icon} className="w-5 h-5 text-white/60"  strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white/90 text-[16px] mb-0.5">Stripe App Letter</h4>
                      <p className="text-[13px] text-white/40">Edited 1d ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-[11px] font-normal text-emerald-400 px-2.5 py-0.5 rounded-full">Ready</Badge>
                </div>
                <div className="mt-auto flex items-center justify-between text-sm pt-2">
                  <span className="text-white/40 text-[13px]">100% complete</span>
                  <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[13px] font-medium -translate-x-2 group-hover:translate-x-0 duration-300">
                    Open <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5"  strokeWidth={1.5} />
                  </span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right 4 Cols - Plan Overview */}
          <motion.div variants={itemVariants} className="xl:col-span-4 flex flex-col justify-end mt-10 xl:mt-0">
             <div className="bg-[#0A0A0A] border border-orange-500/[0.12] rounded-[24px] p-7 relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_40px_rgba(251,146,60,0.08)]">
                <div className="absolute -bottom-20 -right-20 w-[200px] h-[200px] bg-orange-500/10 blur-[80px] pointer-events-none group-hover:bg-orange-500/15 transition-colors duration-500" />
                
                <h3 className="text-[18px] font-semibold tracking-tight text-white/90 mb-1 relative z-10">Usage Overview</h3>
                <p className="text-[14px] text-white/50 mb-6 relative z-10">{planLabel} Plan • {totalCredits} credits left</p>

                <div className="space-y-3 mb-8 relative z-10 text-[14px] text-white/65">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2">
                    <span>Credits used today</span>
                    <span className="font-semibold text-white/85">0</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2">
                    <span>Documents created</span>
                    <span className="font-semibold text-white/85">{totalDocuments}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2">
                    <span>Current plan</span>
                    <span className="font-semibold text-orange-300">{planLabel}</span>
                  </div>
                </div>

                <div className="relative z-10 w-full p-[1px] rounded-[16px] bg-linear-to-r from-orange-500/20 to-orange-400/5 group-hover:from-orange-500/40 group-hover:to-orange-400/20 transition-colors duration-300">
                  <button
                    onClick={() => router.push('/pricing')}
                    className="w-full bg-[#101010] py-3 rounded-[15px] text-[15px] font-semibold text-orange-300 flex items-center justify-center gap-2 hover:bg-orange-500/5 transition-colors"
                  >
                    Manage Plan <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4"  strokeWidth={1.5} />
                  </button>
                </div>
             </div>
          </motion.div>

        </div>
       
      </motion.div>
    </div>
        </div>
      </div>
  );
}

function ActionCard({ icon, title, description, accent, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={` 
        group relative rounded-[24px] bg-[#101010] border p-6 h-[172px] 
        flex flex-col cursor-pointer transition-all duration-300 ease-out
        hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)]
        ${accent === 'emerald' ? 'border-white/[0.08] hover:border-emerald-500/30' : ''}
        ${accent === 'orange' ? 'border-white/[0.08] hover:border-orange-500/30' : ''}
        ${accent === 'neutral' ? 'border-white/[0.08] hover:border-white/20' : ''}
      `}
    >
      {accent === 'emerald' && (
        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors rounded-[24px] pointer-events-none" />
      )}
      {accent === 'orange' && (
        <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors rounded-[24px] pointer-events-none" />
      )}
      {accent === 'neutral' && (
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors rounded-[24px] pointer-events-none" />
      )}

      <div className="w-[48px] h-[48px] rounded-[16px] bg-[#1A1A1A] border border-white/[0.06] flex items-center justify-center mb-auto group-hover:scale-105 transition-transform duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
        {icon}
      </div>
      
      <div className="relative z-10 flex items-end justify-between w-full">
        <div>
          <h3 className="text-[16px] font-semibold tracking-tight text-white mb-1.5 group-hover:text-white transition-colors">{title}</h3>
          <p className="text-[13px] text-white/50 leading-snug line-clamp-1 max-w-[90%] font-light">{description}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none flex-shrink-0">
          <HugeiconsIcon icon={ArrowRight01Icon} className={`w-4 h-4 ${accent === 'emerald' ? 'text-emerald-400' : accent === 'orange' ? 'text-orange-400' : 'text-white/60'}`}  strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
