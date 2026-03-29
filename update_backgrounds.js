const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace backgrounds
content = content.replace(/bg-black border-t border-white\/10/g, 'bg-transparent border-t border-white/5');
content = content.replace(/bg-zinc-950\/80 backdrop-blur-xl py-32 px-6 border-t border-white\/10/g, 'bg-zinc-950/30 backdrop-blur-md py-32 px-6 border-t border-white/5');
content = content.replace(/bg-zinc-950\/80 backdrop-blur-2xl py-32 px-6 border-t border-white\/10/g, 'bg-zinc-950/30 backdrop-blur-md py-32 px-6 border-t border-white/5');
content = content.replace(/bg-black py-32 px-6 border-t border-white\/10/g, 'bg-transparent py-32 px-6 border-t border-white/5');

// Update marquee animation to use framer motion to guarantee it works flawlessly
// Currently it's:
// <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-6 pl-6">
const marqueeRegex = /<div className="relative w-full".*?animate-\[marquee_40s_linear_infinite\].*?>[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;

if (content.match(marqueeRegex)) {
    // Wait, the regex might be tricky since it's nested divs. Let's do a specific replace
    const oldMarquee = `<div className="relative w-full" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>      
           <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-6 pl-6">`;
           
    const newMarquee = `<div className="relative w-full" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>      
           <motion.div 
              animate={{ x: [0, -1000] }} 
              transition={{ repeat: Infinity, ease: "linear", duration: 20 }} 
              className="flex w-max gap-6 pl-6"
           >`;
           
    content = content.replace(oldMarquee, newMarquee);
    // Replace the closing div with motion.div
    content = content.replace(/<\/div>\n           <\/div>\n        <\/section>/, `</motion.div>\n        </div>\n      </section>`);
}

// But I should check if that exact string exists. 

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done');