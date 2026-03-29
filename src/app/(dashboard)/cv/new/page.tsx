import { HugeiconsIcon } from "@hugeicons/react";
import { MagicWand01Icon, ArrowRight01Icon, CloudUploadIcon, ArrowLeft01Icon, DocumentAttachmentIcon } from "@hugeicons/core-free-icons";
import Link from 'next/link';

export default function NewCVPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950/50 text-white font-geist selection:bg-emerald-500/30">
      {/* Workspace Header */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 md:px-8 md:py-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-5">
          <Link href="/cv" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-[12px] uppercase tracking-[0.18em] text-white/45 mb-1">Resume Flow</p>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <HugeiconsIcon icon={DocumentAttachmentIcon} className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />
              Create New Resume
            </h1>
          </div>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in duration-500">
        <div className="max-w-[1000px] mx-auto space-y-8 mt-4">
          <p className="text-[15px] text-white/60 max-w-2xl font-light">
            Start with AI-guided generation or import your existing profile to build your tailored CV faster.
          </p>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Link
              href="/wizard"
              className="group rounded-[24px] border border-white/[0.08] bg-[#0A0A0A] p-6 md:p-8 transition-all hover:-translate-y-[2px] hover:border-emerald-500/30 hover:shadow-[0_16px_40px_rgba(52,211,153,0.1)] relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
              <div className="h-14 w-14 rounded-2xl border border-white/10 bg-[#151515] flex items-center justify-center mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-emerald-400 group-hover:scale-105 transition-transform">
                <HugeiconsIcon icon={MagicWand01Icon} className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">AI Guided Wizard</h2>
              <p className="text-[14px] text-white/50 mb-8 leading-relaxed font-light">Answer a few prompts and generate a tailored CV draft instantly with our cognitive AI.</p>
              <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-emerald-400 group-hover:gap-3 transition-all">
                Start Wizard <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" strokeWidth={1.5} />
              </div>
            </Link>

            <Link
              href="/wizard"
              className="group rounded-[24px] border border-white/[0.08] bg-[#0A0A0A] p-6 md:p-8 transition-all hover:-translate-y-[2px] hover:border-orange-500/30 hover:shadow-[0_16px_40px_rgba(251,146,60,0.1)] relative overflow-hidden flex flex-col"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] pointer-events-none group-hover:bg-orange-500/10 transition-colors" />
              <div className="h-14 w-14 rounded-2xl border border-white/10 bg-[#151515] flex items-center justify-center mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-orange-400 group-hover:scale-105 transition-transform">
                <HugeiconsIcon icon={CloudUploadIcon} className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">Import Profile</h2>
              <p className="text-[14px] text-white/50 mb-8 leading-relaxed font-light">Bring your LinkedIn or existing resume data and seamlessly refine it in our workspace.</p>
              <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-orange-400 group-hover:gap-3 transition-all">
                Import & Continue <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" strokeWidth={1.5} />
              </div>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
