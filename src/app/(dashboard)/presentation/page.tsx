"use client";
import React, { useState } from 'react';
import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerIcon, PlusSignIcon, MoreVerticalIcon, PlayIcon, PencilEdit01Icon, Delete01Icon, Search01Icon, GridIcon, ListViewIcon } from "@hugeicons/core-free-icons";
import { MagicCard } from '@/components/ui/magic-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Dummy data
const presentations = [
  { id: '1', title: 'Q3 Product Roadmap', slides: 12, lastEdited: 'Just now', theme: 'Dark Minimal', status: 'Ready' },
  { id: '2', title: 'Investor Pitch Deck', slides: 24, lastEdited: '1 week ago', theme: 'Glassmorphism', status: 'Draft' },
];

export default function PresentationListPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="flex flex-col h-full bg-zinc-950/50">
      {/* Workspace Header */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 font-geist flex items-center gap-2">
            <HugeiconsIcon icon={ComputerIcon} strokeWidth={1.5} className="w-5 h-5 text-cyan-400" />
            Presentations
          </h1>
          <p className="text-zinc-400 text-sm">Create stunning, AI-powered pitch decks and presentations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="h-4 w-4 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search decks..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-zinc-900/50 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
            />
          </div>
          
          <div className="flex items-center p-1 bg-zinc-900/50 border border-white/10 rounded-xl hidden sm:flex">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <HugeiconsIcon icon={GridIcon} strokeWidth={1.5} className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <HugeiconsIcon icon={ListViewIcon} strokeWidth={1.5} className="w-4 h-4" />
            </button>
          </div>

          <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl px-4 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all">
            <Link href="/presentation/new">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={1.5} className="w-4 h-4 mr-2" />
              New Deck
            </Link>
          </Button>
        </div>
      </div>

      {/* Workspace Content */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <motion.div 
          layout
          className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-3"
          }
        >
          <AnimatePresence mode="popLayout">
            {presentations.map((pres, index) => (
              <motion.div
                key={pres.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={`/presentation/${pres.id}`} className="block h-full">
                  <MagicCard
                    className={`group relative bg-zinc-900/40 border-white/5 cursor-pointer hover:border-cyan-500/30 transition-all overflow-hidden ${
                      viewMode === 'grid' 
                        ? 'h-[320px] p-0 flex flex-col justify-between rounded-2xl' 
                        : 'p-4 flex items-center justify-between rounded-xl'
                    }`}
                    gradientColor="rgba(6,182,212,0.08)"
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="h-32 w-full bg-linear-to-br from-zinc-950 to-zinc-900 border-b border-cyan-500/10 relative overflow-hidden flex items-center justify-center">
                           <div className="absolute inset-0 bg-cyan-950/20 backdrop-blur-sm z-10" />
                           
                           {/* Abstract Presentation Deck Aesthetic */}
                           <div className="relative z-20 flex flex-col items-center justify-center gap-1.5 group-hover:scale-105 transition-transform duration-500 w-3/5 h-20 bg-zinc-900/80 border border-white/5 rounded-lg shadow-xl overflow-hidden p-2.5">
                              <div className="w-full flex items-center justify-between mb-1">
                                <div className="w-1/3 h-1.5 bg-cyan-500/30 rounded-full group-hover:bg-cyan-400/50 transition-colors" />
                                <div className="flex gap-1">
                                  <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                                  <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                                </div>
                              </div>
                              <div className="flex gap-2 w-full h-full">
                                <div className="w-[45%] h-full bg-gradient-to-br from-cyan-500/10 to-transparent rounded border border-cyan-500/10" />
                                <div className="w-[55%] flex flex-col gap-1.5 justify-center">
                                  <div className="w-[90%] h-1 bg-zinc-700/50 rounded-full" />
                                  <div className="w-[70%] h-1 bg-zinc-700/50 rounded-full" />
                                  <div className="w-[50%] h-1 bg-zinc-700/50 rounded-full" />
                                </div>
                              </div>
                           </div>

                           <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md">
                             <Button variant="secondary" className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md" onClick={(e) => e.preventDefault()}>
                               <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-4 h-4 mr-2 fill-white text-white" />      
                               Present
                             </Button>
                           </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1 relative z-10">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-cyan-300 transition-colors line-clamp-1">
                              {pres.title}
                            </h3>
                            <button className="p-1 -mt-1 -mr-1 hover:bg-white/10 rounded-lg transition-colors text-zinc-500 hover:text-white" onClick={(e) => e.preventDefault()}>
                              <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={1.5} className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <p className="text-sm text-zinc-400 font-medium mb-auto">{pres.theme}</p>

                          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-zinc-300 bg-white/5 px-2 py-1 rounded-md">
                                {pres.slides} Slides
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                              <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-zinc-400 hover:text-white" title="Edit" onClick={(e) => e.preventDefault()}>
                                <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1.5} className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 rounded-md transition-colors" title="Delete" onClick={(e) => e.preventDefault()}>
                                <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.5} className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="relative z-10 flex items-center w-full gap-4">
                        <div className="p-2.5 bg-zinc-800/50 rounded-lg border border-white/5 group-hover:border-cyan-500/20 transition-all">
                          <HugeiconsIcon icon={ComputerIcon} strokeWidth={1.5} className="w-5 h-5 text-cyan-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                            {pres.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                            <span>{pres.lastEdited}</span>
                            <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                            <span className={pres.status === 'Ready' ? 'text-cyan-400' : 'text-orange-400'}>
                              {pres.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-2 hidden sm:flex">
                              <span className="text-xs font-medium text-zinc-300 bg-white/5 border border-white/5 px-2 py-1 rounded-md">
                                {pres.slides} Slides
                              </span>
                              <Button size="sm" variant="secondary" className="h-7 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/20" onClick={(e) => e.preventDefault()}>
                               <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-3 h-3 mr-1 fill-cyan-300" /> Present 
                              </Button>
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white" title="Edit" onClick={(e) => e.preventDefault()}>
                              <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1.5} className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 rounded-lg transition-colors" title="Delete" onClick={(e) => e.preventDefault()}>
                              <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.5} className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </MagicCard>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

