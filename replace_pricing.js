const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">.*?<button className="w-full py-4 rounded-xl border border-white\/10 text-white font-semibold hover:bg-white\/5 transition-colors">Get Lifetime<\/button>\s*<\/div>\s*<\/div>/s;

const newPricing = `<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">  
            {/* Free */}
            <div className="relative group rounded-[24px] overflow-hidden">
               <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#6A82FB_25%,transparent_50%,#B3B6F4_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-30" />     
               <div className="relative p-8 m-[1px] rounded-[23px] bg-zinc-950 flex flex-col h-full z-10 w-[calc(100%-2px)]">
                  <h3 className="text-xl font-bold font-geist text-white mb-2">Free</h3>
                  <p className="text-zinc-400 mb-6 font-geist">Perfect to test the waters.</p>
                  <div className="text-4xl font-bold text-white mb-8">$0<span className="text-lg text-zinc-500 font-normal">/yr</span></div>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {['1 Resume parsing', 'Basic PDF export', 'Standard templates'].map((feat, i) => (
                      <li key={i} className="flex gap-3 text-zinc-300 font-geist items-center"><Check className="w-5 h-5 text-zinc-500" /> {feat}</li>
                    ))}
                  </ul>
                  <button className="w-full py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors mt-auto">Start for free</button>
               </div>
            </div>

            {/* Pro - With Glow */}
            <div className="relative group rounded-[24px] overflow-hidden">
               <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#6A82FB_25%,transparent_50%,#B3B6F4_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-80" />     
               <div className="relative p-8 m-[1px] rounded-[23px] bg-black flex flex-col h-full z-10 w-[calc(100%-2px)] shadow-2xl">
                  <div>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold font-geist uppercase tracking-widest mb-4">Most Popular</div>
                    <h3 className="text-xl font-bold font-geist text-white mb-2">Pro</h3>
                    <p className="text-zinc-400 mb-6 font-geist">The ultimate job hunting arsenal.</p>
                    <div className="text-4xl font-bold text-white mb-8">$99<span className="text-lg text-zinc-500 font-normal">/yr</span></div>
                    <ul className="space-y-4 mb-8">
                      {['Unlimited Resumes', 'AI Keyword Matching', 'Premium Apple-style Templates', 'Cover Letter Generator', 'Priority Support'].map((feat, i) => (
                        <li key={i} className="flex gap-3 text-zinc-200 font-geist items-center"><Check className="w-5 h-5 pl-1 text-[#6A82FB]" /> {feat}</li>  
                      ))}
                    </ul>
                  </div>
                  <button className="w-full py-4 rounded-xl bg-white text-black font-bold hover:scale-[1.02] transition-transform shadow-lg mt-auto">Upgrade to Pro</button>
               </div>
            </div>
          </div>`;

if(regex.test(content)) {
  content = content.replace(regex, newPricing);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully replaced pricing section.');
} else {
  console.error('Could not find the pricing section using regex.');
}
