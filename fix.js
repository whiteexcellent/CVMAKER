const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/dashboard/DashboardClient.tsx', 'utf8');

const replacementStr = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <div className="w-full h-full">
                      <MagicCard className="p-5 bg-white/[0.02] border-white/5 rounded-2xl flex gap-4 cursor-pointer hover:border-emerald-500/30 transition-all group" gradientColor="rgba(52,211,153,0.1)">
                        <div className="p-3 bg-white/5 rounded-xl h-fit border border-white/10 group-hover:scale-110 transition-transform">
                          <MessageSquare className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium group-hover:text-emerald-300 transition-colors">Magic Rewrite</h4>
                          <p className="text-sm text-zinc-400 mt-1">Select any resume section and let AI enhance its impact and tone instantly.</p>
                        </div>
                      </MagicCard>
                    </div>
                  </SheetTrigger>
                  <SheetContent side="right" className="bg-zinc-950 border-white/10 text-white sm:max-w-md w-full overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="text-emerald-400 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Magic Rewrite</SheetTitle>
                      <SheetDescription className="text-zinc-400 text-left">
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
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    <div className="w-full h-full">
                      <MagicCard className="p-5 bg-white/[0.02] border-white/5 rounded-2xl flex gap-4 cursor-pointer hover:border-orange-500/30 transition-all group relative overflow-hidden" gradientColor="rgba(251,146,60,0.1)">
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
                      </MagicCard>
                    </div>
                  </SheetTrigger>
                  <SheetContent side="right" className="bg-zinc-950 border-white/10 text-white sm:max-w-md w-full overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="text-orange-400 flex items-center gap-2"><Headphones className="w-4 h-4" /> Mock Interview</SheetTitle>
                      <SheetDescription className="text-zinc-400 text-left">
                        {isPro ? "Configure your audio AI interviewer for your target role." : "Upgrade to Pro to unlock Mock Interviews."}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-4">
                      {isPro ? (
                        <>
                          <div className="space-y-4 mb-8">
                            <div>
                              <p className="text-sm text-zinc-400 mb-2">Target Role</p>
                              <Input placeholder="e.g. Senior Frontend Engineer" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-orange-500/50" />
                            </div>
                            <div>
                              <p className="text-sm text-zinc-400 mb-2">Focus Areas</p>
                              <Input placeholder="e.g. React, System Design" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-orange-500/50" />
                            </div>
                          </div>
                          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Start Audio Session</Button>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 mt-12 py-12 border border-white/10 rounded-2xl bg-white/[0.02]">
                          <Lock className="w-12 h-12 text-zinc-500" />
                          <p className="text-center text-sm text-zinc-400 max-w-[200px]">This feature requires a premium subscription.</p>
                          <Button className="w-full bg-white text-black hover:bg-zinc-200 mt-4 rounded-full">Upgrade to Pro</Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>`;

c = c.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?<\/section>/, replacementStr + '\n            </section>');

const oldInput = '<input type="text" placeholder="Search tech jobs..." className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500" disabled={!isPro} />';
const newInput = '<Input type="search" placeholder="Search tech jobs..." className="w-full bg-black/50 border-white/10 rounded-xl h-10 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50" disabled={!isPro} />';
c = c.replace(oldInput, newInput);

fs.writeFileSync('src/app/(dashboard)/dashboard/DashboardClient.tsx', c);
