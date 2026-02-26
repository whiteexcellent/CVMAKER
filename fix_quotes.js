const fs = require('fs');

const langs = ['fr', 'it'];

langs.forEach(lang => {
    const p = `src/lib/dictionaries/${lang}.ts`;
    let content = fs.readFileSync(p, 'utf8');

    // Replace all instances of \\' with \'
    content = content.replace(/\\\\'/g, "\\'");

    fs.writeFileSync(p, content, 'utf8');
    console.log(`Cleaned up quotes in ${lang}.ts`);
});
