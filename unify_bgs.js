const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace backgrounds
content = content.replace(/bg-black\/40 backdrop-blur-3xl/g, 'bg-zinc-950/20 backdrop-blur-sm');
content = content.replace(/bg-zinc-950\/30 backdrop-blur-md/g, 'bg-zinc-950/20 backdrop-blur-sm');
content = content.replace(/bg-transparent border-t border-white\/5/g, 'bg-transparent border-t border-white/5');
content = content.replace(/pt-32 bg-zinc-950 border-t border-white\/10/g, 'pt-32 bg-transparent border-t border-white/5');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Backgrounds simplified');