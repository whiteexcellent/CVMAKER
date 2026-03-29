const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/dashboard/DashboardClient.tsx', 'utf8');

c = c.replace(
  import { Button } from '@/components/ui/button';,
  import { Button } from '@/components/ui/button';\nimport { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';\nimport { Input } from '@/components/ui/input';
);

let rewriteStr = <MagicCard className="p-5 bg-white/[0.02] border-white/5 rounded-2xl flex gap-4 cursor-pointer hover:border-emerald-500/30 transition-all group" gradientColor="rgba(52,211,153,0.1)">
                  <div className="p-3 bg-white/5 rounded-xl h-fit border border-white/10 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium group-hover:text-emerald-300 transition-colors">Magic Rewrite</h4>
                    <p className="text-sm text-zinc-400 mt-1">Select any resume section and let AI enhance its impact and tone instantly.</p>
                  </div>
                </MagicCard>;

let rewriteReplacement = <Sheet>
<SheetTrigger asChild>
  <div className="w-full h-full">
    \
  </div>
</SheetTrigger>
  <SheetContent side="right" className="bg-zinc-950 border-white/10 text-white sm:max-w-md">
    <SheetHeader>
      <SheetTitle className="text-emerald-400 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Magic Rewrite</SheetTitle>
      <SheetDescription className="text-zinc-400">
        Our VisionOS powered AI is ready to optimize your text.
      </SheetDescription>
    </SheetHeader>
    <div className="py-6 space-y-4">
      <div className="p-4 bg-white/5 border border-white/10 rounded-xl h-48 flex items-center justify-center">
        <p className="text-sm font-geist text-zinc-500">Select a section from your active document...</p>
      </div>
      <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">Refine Output</Button>
    </div>
  </SheetContent>
</Sheet>;

c = c.replace(rewriteStr, rewriteReplacement.replace('', rewriteStr));


let mockStr = <MagicCard className="p-5 bg-white/[0.02] border-white/5 rounded-2xl flex gap-4 cursor-pointer hover:border-orange-500/30 transition-all group relative overflow-hidden" gradientColor="rgba(251,146,60,0.1)">
                  {!isPro && <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col justify-center items-center text-zinc-300">
                    <Lock className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">Pro Feature</span>
                  </div>}
                  <div className="p-3 bg-white/5 rounded-xl h-fit border border-white/10 group-hover:scale-110 transition-transform">
                    <Headphones className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium group-hover:text-orange-300 transition-colors">Mock Interview</h4>
                    <p className="text-sm text-zinc-400 mt-1">Audio-based AI interviewer preparing you for specific job roles.</p>
                  </div>
                </MagicCard>;

let mockReplacement = <Sheet>
<SheetTrigger asChild>
  <div className="w-full h-full">
    \
  </div>
</SheetTrigger>
  <SheetContent side="right" className="bg-zinc-950 border-white/10 text-white sm:max-w-md">
    <SheetHeader>
      <SheetTitle className="text-orange-400 flex items-center gap-2"><Headphones className="w-4 h-4" /> Mock Interview</SheetTitle>
      <SheetDescription className="text-zinc-400">
        {isPro ? "Configure your audio AI interviewer." : "Upgrade to Pro to unlock Mock Interviews."}
      </SheetDescription>
    </SheetHeader>
    <div className="py-6 space-y-4">
      {isPro ? (
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Start Audio Session</Button>
      ) : (
        <Button className="w-full bg-white text-black hover:bg-zinc-200">Upgrade to Pro</Button>
      )}
    </div>
  </SheetContent>
</Sheet>;

c = c.replace(mockStr, mockReplacement.replace('', mockStr));

c = c.replace(
  '<input type="text" placeholder="Search tech jobs..." className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500" disabled={!isPro} />',
  '<Input type="search" placeholder="Search tech jobs..." className="w-full bg-white/[0.03] border-white/10 rounded-xl h-10 pl-9 pr-4 text-sm text-white focus-visible:ring-emerald-500/50" disabled={!isPro} />'
);

fs.writeFileSync('src/app/(dashboard)/dashboard/DashboardClient.tsx', c);
console.log('Script ran successfully');
