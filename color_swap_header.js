
const fs = require('fs');
const files = ['src/components/AppleHeader.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/#6A82FB/g, '#10b981');
  content = content.replace(/#B3B6F4/g, '#f97316');
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});

