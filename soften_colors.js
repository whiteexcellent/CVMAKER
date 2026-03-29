
const fs = require('fs');
const files = ['src/app/page.tsx', 'src/components/AIFlow.tsx', 'src/components/AppleHeader.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/#10b981/g, '#34d399');
  content = content.replace(/#f97316/g, '#fb923c');
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});

