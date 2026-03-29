'use client';

import * as React from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from "@hugeicons/react";
import { Task01Icon, FolderOpenIcon, LibraryIcon, Home01Icon, DashboardSquare01Icon, Settings01Icon, ComputerIcon, CreditCardIcon, Logout01Icon, MagicWand01Icon } from "@hugeicons/core-free-icons";
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';

import { createClient } from '@/lib/supabase/client';

const MagicStarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 1L14.7355 8.26446L22 11L14.7355 13.7355L12 21L9.26446 13.7355L2 11L9.26446 8.26446L12 1Z" fill="currentColor" opacity="0.9" />
    <path d="M5.5 4.5L6.5 7L8.5 8L6.5 9L5.5 11.5L4.5 9L2.5 8L4.5 7L5.5 4.5Z" fill="currentColor" opacity="0.8" />
    <path d="M18.5 18L19 19.5L20.5 20L19 20.5L18.5 22L18 20.5L16.5 20L18 19.5L18.5 18Z" fill="currentColor" opacity="0.8" />
  </svg>
);

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';

  const [flowState, setFlowState] = React.useState({
    resumes: false,
    coverLetters: false,
    presentations: false,
    loaded: false,
  });

  React.useEffect(() => {
    async function checkFlow() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [rRes, cRes, pRes] = await Promise.all([
          supabase.from('resumes').select('id').eq('user_id', user.id).limit(1),
          supabase.from('cover_letters').select('id').eq('user_id', user.id).limit(1),
          supabase.from('presentations').select('id').eq('user_id', user.id).limit(1),
        ]);

        setFlowState({
          resumes: (rRes.data && rRes.data.length > 0) || false,
          coverLetters: (cRes.data && cRes.data.length > 0) || false,
          presentations: (pRes.data && pRes.data.length > 0) || false,
          loaded: true,
        });
      } catch (error) {
        console.warn('Flow check skipped (likely missing env vars):', error);
        // Fallback for visual testing when env variables are missing
        setFlowState({ resumes: false, coverLetters: false, presentations: false, loaded: true });
      }
    }

    checkFlow();
  }, [pathname]);

  const isRouteActive = (route: string) => pathname.startsWith(route);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const allCompleted = flowState.resumes && flowState.coverLetters && flowState.presentations;
  const showQuickFlow = flowState.loaded && !allCompleted;

  const stepsData = [
    { id: 'resume', href: '/cv/new', title: 'Start Resume', icon: <HugeiconsIcon icon={Task01Icon} strokeWidth={1.5} className="w-3 h-3" />, completed: flowState.resumes },
    { id: 'coverLetter', href: '/cover-letter/new', title: 'Generate Letter', icon: <HugeiconsIcon icon={FolderOpenIcon} strokeWidth={1.5} className="w-3 h-3" />, completed: flowState.coverLetters },
    { id: 'presentation', href: '/presentation/new', title: 'Build Deck', icon: <HugeiconsIcon icon={ComputerIcon} strokeWidth={1.5} className="w-3 h-3" />, completed: flowState.presentations },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-black/40 backdrop-blur-[40px] shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20" {...props}>
      <SidebarHeader className="border-b border-white/5 bg-transparent px-2 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500/20 to-orange-500/20 border border-white/10 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
            <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={1.5} className="h-4 w-4 text-white" />
          </div>
          <span className="font-geist font-bold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-orange-400 group-data-[collapsible=icon]:hidden drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
            Omni CV
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 font-medium tracking-wider uppercase text-[10px]">Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-emerald-400 data-[active=true]:shadow-[inset_3px_0_0_0_rgba(52,211,153,1)] transition-all duration-200" isActive={pathname === '/dashboard'} tooltip="Dashboard">
                  <Link href="/dashboard">
                    <HugeiconsIcon icon={Home01Icon} strokeWidth={1.5} />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-emerald-400 data-[active=true]:shadow-[inset_3px_0_0_0_rgba(52,211,153,1)] transition-all duration-200" isActive={isRouteActive('/cv')} tooltip="Resumes">
                  <Link href="/cv">
                    <HugeiconsIcon icon={Task01Icon} strokeWidth={1.5} />
                    <span>Resumes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-emerald-400 data-[active=true]:shadow-[inset_3px_0_0_0_rgba(52,211,153,1)] transition-all duration-200" isActive={isRouteActive('/cover-letter')} tooltip="Cover Letters">
                  <Link href="/cover-letter">
                    <HugeiconsIcon icon={FolderOpenIcon} strokeWidth={1.5} />
                    <span>Cover Letters</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-emerald-400 data-[active=true]:shadow-[inset_3px_0_0_0_rgba(52,211,153,1)] transition-all duration-200" isActive={isRouteActive('/presentation')} tooltip="Presentations">
                  <Link href="/presentation">
                    <HugeiconsIcon icon={ComputerIcon} strokeWidth={1.5} />
                    <span>Presentations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-emerald-400 data-[active=true]:shadow-[inset_3px_0_0_0_rgba(52,211,153,1)] transition-all duration-200" isActive={isRouteActive('/library')} tooltip="Library">
                  <Link href="/library">
                    <HugeiconsIcon icon={LibraryIcon} strokeWidth={1.5} />
                    <span>Library</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <AnimatePresence>
          {showQuickFlow && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95, filter: 'blur(4px)' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <SidebarGroup>
                <SidebarGroupLabel className="text-emerald-400 font-medium tracking-wide flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                  <MagicStarIcon className="w-4 h-4 text-emerald-400" /> Quick Guide
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="flex flex-col gap-1.5 px-2 py-1">
                    {stepsData.map((step, index) => {
                      const isCompleted = step.completed;
                      return (
                        <Link 
                          key={step.id}
                          href={step.href} 
                          className={`group flex items-center gap-2.5 p-2 rounded-xl transition-all relative overflow-hidden border ${
                            isCompleted 
                              ? 'bg-orange-950/20 border-orange-500/20 hover:border-orange-500/30' 
                              : 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/30'
                          }`}
                        >
                          {/* Incomplete pulsing dot */}
                          {!isCompleted && !isCollapsed && (
                            <span className="absolute top-2.5 right-2.5 flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                          )}

                          <div className={`w-6 h-6 rounded-md flex flex-shrink-0 items-center justify-center border transition-transform ${
                            isCompleted 
                              ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' 
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:scale-110'
                          }`}>
                            {step.icon}
                          </div>
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                              <div className={`text-[12px] font-medium leading-none truncate ${
                                isCompleted ? 'text-orange-400/80 line-through decoration-orange-500/50' : 'text-emerald-50'
                              }`}>
                                {step.title}
                              </div>
                              <div className={`text-[10px] mt-0.5 flex items-center gap-1 ${
                                isCompleted ? 'text-orange-500/60' : 'text-emerald-400/60'
                              }`}>
                                Step {index + 1} {isCompleted && <span className="text-[9px]">✓</span>}
                              </div>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </motion.div>
          )}
        </AnimatePresence>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-white/40 font-medium tracking-wider uppercase text-[10px]">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-emerald-400 data-[active=true]:shadow-[inset_3px_0_0_0_rgba(52,211,153,1)] transition-all duration-200" isActive={isRouteActive('/pricing')} tooltip="Billing & Plan">
                  <Link href="/pricing">
                    <HugeiconsIcon icon={CreditCardIcon} strokeWidth={1.5} />
                    <span>Billing & Plan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-emerald-400 data-[active=true]:shadow-[inset_3px_0_0_0_rgba(52,211,153,1)] transition-all duration-200" isActive={isRouteActive('/settings')} tooltip="Settings">
                  <Link href="/settings">
                    <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out" className="text-zinc-400 hover:text-white">
              <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.5} className="w-4 h-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}







