import fs from 'node:fs';
const read=file=>fs.readFileSync(file,'utf8');
const templates=Object.fromEntries(fs.readdirSync('ui').filter(file=>file.endsWith('.html')).map(file=>[file.slice(0,-5),read('ui/'+file)]));
fs.writeFileSync('dist/theme-templates.js','window.PORTFOLIO_TEMPLATES='+JSON.stringify(templates).replaceAll('<','\\u003c')+';\n');
fs.copyFileSync('ui/theme.js','dist/theme.js');
// Keep the document layouts and diagrams; adapt their fixed paper colors to the site theme.
function darkArticle(css){
 const colors=(value,property)=>value.replace(/#[\da-f]{3,8}\b/gi,hex=>{
   const code=hex.slice(1);if(![3,6].includes(code.length))return hex;
   const full=code.length===3?[...code].map(c=>c+c).join(''):code;
   const rgb=[0,2,4].map(i=>parseInt(full.slice(i,i+2),16));
   const light=(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722)/255;
   if(property==='color')return light<.5?(rgb[2]>rgb[0]*1.4?'#c4b7ff':'#dce3f3'):light<.72?'#acb8cf':hex;
   if(property.startsWith('background'))return light>.72?'#17263c':hex;
   if(property.startsWith('border')||property==='box-shadow')return light>.65?'#35445e':hex;
   return hex;
 });
 let result='';
 for(const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
   const selector=match[1].replace(/\/\*[\s\S]*?\*\//g,'').trim();
   if(!selector||selector.startsWith('@')||selector.includes('.nk-skill')||selector.includes('.nk-reset'))continue;
   const declarations=match[2].split(';').map(s=>s.trim()).filter(Boolean).map(s=>{const colon=s.indexOf(':');return[s.slice(0,colon),s.slice(colon+1)];}).filter(([property,value])=>/^(color|background(?:-color|-image)?|border(?:-color|-top|-bottom|-left|-right)?|box-shadow)$/.test(property)&&/#[\da-f]/i.test(value)).map(([property,value])=>property+':'+colors(value,property));
   if(declarations.length)result+=selector.split(',').map(s=>'#portfolio-theme '+s.trim()).join(',')+'{'+declarations.join(';')+'}\n';
 }
 return result;
}
const articleTheme=['dist/nikke-document.css','dist/consumption-document.css'].map(file=>darkArticle(read(file))).join('\n');
fs.writeFileSync('dist/subculture.css',(read('ui/approved-theme.css')+'\n'+articleTheme+'\n'+read('ui/site-theme.css')).trimEnd()+'\n');
