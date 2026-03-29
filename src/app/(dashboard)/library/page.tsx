import Link from 'next/link';
import { HugeiconsIcon } from "@hugeicons/react";
import { DatabaseIcon, Task01Icon, FolderOpenIcon, ComputerIcon, ArrowRight01Icon, LibraryIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { MagicCard } from '@/components/ui/magic-card';

const libraryItems = [
  {
    title: 'Resume Templates',
    description: 'ATS-ready structures tailored for modern hiring pipelines.',
    href: '/cv',
    icon: Task01Icon,
    color: 'emerald',
  },
  {
    title: 'Cover Letter Patterns',
    description: 'High-conversion structures for specific roles and industries.',
    href: '/cover-letter',
    icon: FolderOpenIcon,
    color: 'orange',
  },
  {
    title: 'Presentation Deck Blocks',
    description: 'Reusable slide narratives for interviews and pitch sessions.',
    href: '/presentation',
    icon: ComputerIcon,
    color: 'cyan',
  },
];

export default function LibraryPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950/50">
      {/* Workspace Header */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 font-geist flex items-center gap-2">
            <HugeiconsIcon icon={LibraryIcon} strokeWidth={1.5} className="w-5 h-5 text-white/70" />
            Asset Library
          </h1>
          <p className="text-zinc-400 text-sm">Centralized repository for templates and content blocks.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search library..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-zinc-900/50 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Workspace Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
        <section className="rounded-3xl border border-white/5 bg-[#0A0A0A]/80 p-8 md:p-10 relative overflow-hidden mb-8 shadow-2xl shadow-black">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
          <div className="relative z-10 flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5 flex flex-shrink-0 items-center justify-center backdrop-blur-xl">
              <HugeiconsIcon icon={DatabaseIcon} strokeWidth={1.5} className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-1">Omni Knowledge Base</p>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Content Library</h1>
              <p className="text-zinc-400 max-w-2xl leading-relaxed">
                Reuse proven content blocks, templates, and structures across all career assets. Save high-performing paragraphs and designs here to rapidly generate new versions of your CVs or letters.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraryItems.map(({ title, description, href, icon: Icon, color }) => (
            <Link key={title} href={href} className="block group">
              <MagicCard
                className="h-full p-6 border-white/5 rounded-3xl bg-zinc-900/40 hover:border-white/10 transition-all cursor-pointer flex flex-col"
                gradientColor="rgba(255,255,255,0.05)"
              >
                <div className={`h-12 w-12 rounded-xl mb-6 flex items-center justify-center border transition-transform group-hover:scale-105 ${
                  color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  color === 'orange' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                  'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                }`}>
                  <HugeiconsIcon icon={Icon} strokeWidth={1.5} className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-white/90">{title}</h2>
                <p className="text-sm text-zinc-400 leading-relaxed mb-8 flex-1">{description}</p>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-white/50 group-hover:text-white/90 transition-colors">
                  Browse {title.split(' ')[0]} <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </MagicCard>
            </Link>
          ))}
        </section>

        <div className="mt-8 text-center border border-dashed border-white/10 rounded-3xl py-12 bg-white/[0.01]">
           <HugeiconsIcon icon={LibraryIcon} strokeWidth={1.5} className="w-8 h-8 text-zinc-600 mx-auto mb-4" />
           <h3 className="text-white font-medium mb-1">Your saved library items will appear here</h3>
           <p className="text-sm text-zinc-500">Save specific sections from your editor to reuse them later.</p>
        </div>
      </div>
    </div>
  );
}

