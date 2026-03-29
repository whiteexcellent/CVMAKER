"use client";
import React, { useState } from 'react';
import { HugeiconsIcon } from "@hugeicons/react";
import { Task01Icon, PlusSignIcon, MoreVerticalIcon, PencilEdit01Icon, Delete01Icon, Search01Icon, FilterIcon, GridIcon, ListViewIcon } from "@hugeicons/core-free-icons";
import { MagicCard } from '@/components/ui/magic-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Dummy data
const resumes = [
  { id: '1', title: 'Senior Frontend Engineer', lastEdited: '2 hours ago', status: 'Complete', score: '92%' },
  { id: '2', title: 'Product Manager 2026', lastEdited: '1 day ago', status: 'Draft', score: '65%' },
  { id: '3', title: 'UI/UX Designer', lastEdited: '3 days ago', status: 'Complete', score: '88%' },
];

export default function CVListPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="flex flex-col h-full bg-zinc-950/50">
      {/* Workspace Header */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 font-geist flex items-center gap-2">
            <HugeiconsIcon icon={Task01Icon} strokeWidth={1.5} className="w-5 h-5 text-emerald-400" />
            My Resumes
          </h1>
          <p className="text-zinc-400 text-sm">Manage and optimize your ATS-friendly resumes.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="h-4 w-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search resumes..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-zinc-900/50 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
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

          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl px-4 shadow-[0_0_15px_rgba(52,211,153,0.2)] hover:shadow-[0_0_25px_rgba(52,211,153,0.3)] transition-all">
            <Link href="/cv/new">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={1.5} className="w-4 h-4 mr-2" />
              New Resume
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
            {resumes.map((cv, index) => (
              <motion.div
                key={cv.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={`/cv/${cv.id}`} className="block h-full block">
                  <MagicCard
                    className={`group relative bg-zinc-900/40 border-white/5 cursor-pointer hover:border-emerald-500/30 transition-all overflow-hidden ${
                      viewMode === 'grid' 
                        ? 'h-[280px] p-6 flex flex-col justify-between rounded-2xl' 
                        : 'p-4 flex items-center justify-between rounded-xl'
                    }`}
                    gradientColor="rgba(52,211,153,0.08)"
                  >
                    

                    {viewMode === 'grid' ? (
                      // Grid Layout
                      <>
                        <div className="relative z-10 flex justify-between items-start">
                          <div className="p-3 bg-zinc-800/50 rounded-xl border border-white/5 group-hover:scale-110 group-hover:border-emerald-500/20 transition-all duration-300 shadow-sm">
                            <HugeiconsIcon icon={Task01Icon} strokeWidth={1.5} className="w-6 h-6 text-emerald-400" />
                          </div>
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-500 hover:text-white" onClick={(e) => e.preventDefault()}>
                            <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={1.5} className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="relative z-10 mt-auto mb-6">
                          <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-emerald-300 transition-colors line-clamp-2">
                            {cv.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
                            <span>{cv.lastEdited}</span>
                            <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                            <span className={cv.status === 'Complete' ? 'text-emerald-400' : 'text-orange-400'}>
                              {cv.status}
                            </span>
                          </div>
                        </div>

                        <div className="relative z-10 pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">ATS Score</span>
                            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
                              {cv.score}
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
                      </>
                    ) : (
                      // List Layout
                      <div className="relative z-10 flex items-center w-full gap-4">
                        <div className="p-2.5 bg-zinc-800/50 rounded-lg border border-white/5 group-hover:border-emerald-500/20 transition-all">
                          <HugeiconsIcon icon={Task01Icon} strokeWidth={1.5} className="w-5 h-5 text-emerald-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                            {cv.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                            <span>{cv.lastEdited}</span>
                            <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                            <span className={cv.status === 'Complete' ? 'text-emerald-400' : 'text-orange-400'}>
                              {cv.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md hidden sm:block">
                              ATS {cv.score}
                            </span>
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
