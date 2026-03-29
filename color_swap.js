
const fs = require('fs');
const files = ['src/app/page.tsx', 'src/components/AIFlow.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // replace #6A82FB with #10b981 (green)
  // replace #B3B6F4 with #f97316 (orange)
  content = content.replace(/#6A82FB/g, '#10b981');
  content = content.replace(/#B3B6F4/g, '#f97316');
  
  // also handle lower case if any
  content = content.replace(/#6a82fb/g, '#10b981');
  content = content.replace(/#b3b6f4/g, '#f97316');
  
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});

