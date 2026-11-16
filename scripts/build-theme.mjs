import fs from 'node:fs';
const read=file=>fs.readFileSync(file,'utf8');
const templates=Object.fromEntries(fs.readdirSync('ui').filter(file=>file.endsWith('.html')).map(file=>[file.slice(0,-5),read('ui/'+file)]));
fs.writeFileSync('dist/theme-templates.js','window.PORTFOLIO_TEMPLATES='+JSON.stringify(templates).replaceAll('<','\\u003c')+';\n');
fs.copyFileSync('ui/theme.js','dist/theme.js');
// Preserve native document components instead of recoloring them automatically.
fs.writeFileSync('dist/subculture.css',['ui/approved-theme.css','ui/site-theme.css','ui/document-theme.css'].map(read).join('\n').trimEnd()+'\n');
