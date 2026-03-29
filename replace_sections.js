const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Section 3 completely
content = content.replace(/\{\/\* 3\. SHOWCASE.*?(?=\{\/\* 4\. HOW IT WORKS)/s, '');

// 2. Replace Testimonials mapping with Glowing Cards
const oldTestimonialsMap = /\{\[\.\.\.testimonials, \.\.\.testimonials\]\.map\(\(t, i\) => \([\s\S]*?<\/div>[\s]*\)\)\}/;
const newTestimonialsMap = `{[...testimonials, ...testimonials].map((t, i) => (
                <div key={i} className="relative group rounded-[24px] overflow-hidden w-[350px] md:w-[450px] shrink-0">
                  <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#6A82FB_25%,transparent_50%,#B3B6F4_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex flex-col justify-between m-[1px] p-8 rounded-[23px] bg-zinc-950 backdrop-blur-sm h-[calc(100%-2px)] z-10 w-[calc(100%-2px)]">
                    <div>
                      <div className="flex gap-1 mb-6">
                        {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-white text-white" />)}
                      </div>
                      <p className="text-lg font-geist text-zinc-300 leading-relaxed mb-8">"{t.text}"</p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold font-geist">{t.name}</h4>
                      <p className="text-sm text-zinc-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}`;

content = content.replace(oldTestimonialsMap, newTestimonialsMap);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated sections in page.tsx');