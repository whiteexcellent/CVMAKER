const fs = require('fs');

const content = "use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FilePlus,
  FileText,
  MonitorUp,
  Download,
  Zap,
  Lock,
  Sparkles,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Keyframes & Easing
const revealVariants = {
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

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function DashboardClient() {
  const router = useRouter();

  return (
    <div className="min-h-full bg-transparent text-white p-6 md:p-8 font-geist selection:bg-emerald-500/30">
      
      <motion.div 
        className="max-w-[1440px] mx-auto space-y-8"
        variants={revealVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ROW 1: WORKSPACE HEADER STRIP */}
        <motion.div 
          variants={itemVariants}
          className="relative w-full rounded-[28px] bg-[#0A0A0A] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
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
              <Zap className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
              <span className="text-[14px] font-medium text-white/90">1,250</span>
              <span className="text-[12px] text-white/40 ml-1">Credits</span>
            </div>
            
            <div className="flex items-center gap-2 bg-[#101010] border border-white/[0.08] py-2 px-4 rounded-[16px]">
              <span className="text-[14px] font-medium text-white/80">Starter</span>
              <div className="w-[1px] h-3 bg-white/10 mx-1" />
              <span className="text-[12px] text-orange-400/80 font-medium">Free</span>
            </div>

            <Button 
              className="bg-[#141414] border border-orange-500/20 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 hover:border-orange-500/30 rounded-[14px] px-6 h-[42px] transition-all shadow-[0_0_15px_rgba(251,146,60,0.05)]"
            >
              Upgrade
            </Button>
          </div>
        </motion.div>

        {/* ROW 2: QUICK ACTIONS */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ActionCard 
            icon={<FilePlus className="w-5 h-5 text-emerald-400" />}
            title="New Resume"
            description="Create an AI-tailored resume from scratch."
            accent="emerald"
            onClick={() => router.push('/cv')}
          />
          <ActionCard 
            icon={<FileText className="w-5 h-5 text-white/70" />}
            title="Cover Letter"
            description="Generate a job-specific letter in minutes."
            accent="neutral"
            onClick={() => router.push('/cover-letter')}
          />
          <ActionCard 
            icon={<MonitorUp className="w-5 h-5 text-emerald-400" />}
            title="Presentation"
            description="Build a concise pitch deck for interviews."
            accent="emerald"
            onClick={() => router.push('/presentation')}
          />
          <ActionCard 
            icon={<Download className="w-5 h-5 text-orange-400" />}
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
                  <FilePlus className="w-7 h-7 text-emerald-400/80" />
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

          {/* Right 4 Columns - Profile Strength & AI Suggestions */}
          <motion.div variants={itemVariants} className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Profile Strength */}
            <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-[24px] p-6 relative overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex-1">
              <div className="absolute -top-10 -right-10 w-[200px] h-[200px] bg-emerald-500/5 blur-[60px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-[18px] font-semibold tracking-tight text-white/90">Profile Strength</h2>
                <span className="text-[28px] font-bold text-emerald-400 tracking-tight drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">78%</span>
              </div>
              
              <div className="w-full h-1.5 bg-[#141414] border border-white/5 rounded-full mb-6 overflow-hidden relative z-10">
                <div className="h-full bg-emerald-400 rounded-full w-[78%] shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>

              <div className="space-y-3.5 relative z-10">
                <ChecklistItem text="Contact info complete" done={true} />
                <ChecklistItem text="Education history added" done={true} />
                <ChecklistItem text="Experience impact missing" done={false} />
                <ChecklistItem text="Skills section can improve" done={false} />
              </div>

              <button className="mt-8 w-full h-[40px] rounded-[14px] bg-[#141414] text-[14px] font-medium text-emerald-400 hover:bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/25 transition-all relative z-10">
                Improve profile
              </button>
            </div>

            {/* AI Suggestions */}
            <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex-1">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                </div>
                <h2 className="text-[18px] font-semibold tracking-tight text-white/90">AI Suggestions</h2>
              </div>

              <div className="space-y-4">
                <SuggestionItem 
                  title="Measure your impact" 
                  desc="Add measurable results to your latest role."
                />
                <div className="w-full h-[1px] bg-white/[0.04]" />
                <SuggestionItem 
                  title="Software Internships" 
                  desc="Tailor your current draft for incoming tech roles."
                />
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
                      <FilePlus className="w-5 h-5 text-emerald-400/80" />
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
                  <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[13px] font-medium translate-x-2 group-hover:translate-x-0 duration-300">
                    Continue <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-[24px] p-5 hover:border-white/[0.15] transition-all group cursor-pointer flex flex-col hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-[16px] bg-[#141414] border border-white/5 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <FileText className="w-5 h-5 text-white/60" />
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
                  <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[13px] font-medium translate-x-2 group-hover:translate-x-0 duration-300">
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right 4 Cols - Plan & Usage */}
          <motion.div variants={itemVariants} className="xl:col-span-4 flex flex-col justify-end mt-10 xl:mt-0">
             <div className="bg-[#0A0A0A] border border-orange-500/10 rounded-[24px] p-7 relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_40px_rgba(251,146,60,0.08)]">
                <div className="absolute -bottom-20 -right-20 w-[200px] h-[200px] bg-orange-500/10 blur-[80px] pointer-events-none group-hover:bg-orange-500/15 transition-colors duration-500" />
                
                <h3 className="text-[18px] font-semibold tracking-tight text-white/90 mb-1 relative z-10">Plan & Usage</h3>
                <p className="text-[14px] text-white/50 mb-6 relative z-10">Starter Plan — 1,250 credits left</p>

                <div className="space-y-3 mb-8 relative z-10">
                  <div className="flex items-center gap-3 text-[14px] text-white/60">
                    <Lock className="w-4 h-4 text-orange-400/80" /> Deep search optimization
                  </div>
                  <div className="flex items-center gap-3 text-[14px] text-white/60">
                    <Lock className="w-4 h-4 text-orange-400/80" /> Mock interviews
                  </div>
                  <div className="flex items-center gap-3 text-[14px] text-white/60">
                    <Lock className="w-4 h-4 text-orange-400/80" /> Premium design templates
                  </div>
                </div>

                <div className="relative z-10 w-full p-[1px] rounded-[16px] bg-gradient-to-r from-orange-500/20 to-orange-400/5 group-hover:from-orange-500/40 group-hover:to-orange-400/20 transition-colors duration-300">
                  <button className="w-full bg-[#101010] py-3 rounded-[15px] text-[15px] font-medium text-orange-400 flex items-center justify-center gap-2 hover:bg-orange-500/5 transition-colors">
                    Upgrade to Pro <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
             </div>
          </motion.div>

        </div>
        
      </motion.div>
    </div>
  );
}

function ActionCard({ icon, title, description, accent, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={\
        group relative rounded-[24px] bg-[#101010] border p-6 h-[172px] 
        flex flex-col cursor-pointer transition-all duration-300 ease-out
        hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)]
        \
        \
        \
      \}
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
          <ArrowRight className={\w-4 h-4 \\} />
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ text, done }: { text: string; done?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      {done ? (
        <CircleCheck className="w-[18px] h-[18px] text-emerald-400 mt-0.5 shrink-0 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]" />
      ) : (
        <CircleDashed className="w-[18px] h-[18px] text-white/20 mt-0.5 shrink-0" />
      )}
      <span className={\	ext-[14px] \ leading-tight mt-0.5 font-light\}>
        {text}
      </span>
    </div>
  );
}

function SuggestionItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-1.5 group cursor-pointer">
      <div className="flex items-center justify-between">
        <h4 className="text-[14px] font-medium text-white/90 group-hover:text-orange-400 transition-colors">{title}</h4>
        <div className="opacity-0 group-hover:opacity-100 flex items-center text-[12px] text-orange-400/80 font-medium transition-opacity">
          Apply <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      </div>
      <p className="text-[13px] text-white/50 leading-snug font-light">{desc}</p>
    </div>
  );
}
;
fs.writeFileSync('src/app/(dashboard)/dashboard/DashboardClient.tsx', content);
console.log('Done!');
