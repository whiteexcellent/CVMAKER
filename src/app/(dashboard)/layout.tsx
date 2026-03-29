import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { BorderBeam } from '@/components/ui/border-beam';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative flex h-dvh min-h-dvh w-full overflow-hidden bg-[#020202] text-white">
        {/* Animated Background Ambience (Orange + Emerald) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] animate-[pulse_8s_ease-in-out_infinite_alternate]" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-orange-500/10 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_alternate_reverse]" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] animate-[pulse_12s_ease-in-out_infinite_alternate]" />
        </div>

        {/* Sidebar z-index adjusted to float over background */}
        <AppSidebar />

        <main className="flex-1 flex flex-col min-w-0 relative z-10 mx-2 my-2 rounded-2xl border border-white/10 bg-white/[0.01] backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Border Beam around the entire main layout */}
          <BorderBeam size={400} duration={15} delay={0} colorFrom="#34d399" colorTo="#fb923c" />

          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/5 bg-black/20 backdrop-blur-md px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-2 text-zinc-400 hover:text-white transition-colors" />
              <h1 className="font-geist text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-orange-400 tracking-wide translate-y-0.5">
                Omni AI Workspace
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Refined Avatar */}
              <div className="w-8 h-8 rounded-full bg-black border border-white/10 hover:border-orange-500/50 transition-colors flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(251,146,60,0.1)] group relative">
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-emerald-400 transition-colors">JD</span>
                <div className="absolute inset-0 rounded-full border border-emerald-400/0 group-hover:border-emerald-400/30 transition-colors scale-110" />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-transparent rounded-b-2xl scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

