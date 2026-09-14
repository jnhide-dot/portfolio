import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const catalog=JSON.parse(fs.readFileSync('content/catalog.json','utf8'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const idMap=Object.fromEntries(catalog.filter(d=>d.source).map(d=>[d.source,d.id]));
function inline(s){
 return esc(s).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>').replace(/&lt;br\s*\/?&gt;/g,'<br>').replace(/\\([~>|])/g,'$1');
}
function render(md){
 const saved=[]; const block=html=>`@@BLOCK${saved.push(html)-1}@@`;
 md=md.replace(/<callout\b[^>]*>([\s\S]*?)<\/callout>/g,(_,s)=>block('<details class="note"><summary>원문 주석</summary>'+render(s.trim())+'</details>'));
 md=md.replace(/<mention-page url="https:\/\/app.notion.com\/p\/([a-f0-9]+)"\/>/g,(_,id)=>idMap[id]?`[관련 문서](./#/docs/${idMap[id]})`:'');
 md=md.replace(/<table\b[^>]*>[\s\S]*?<\/table>/g,t=>block('<div class="table-scroll"><table>'+[...t.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map((r,i)=>'<tr>'+[...r[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(c=>`<${i?'td':'th'}>${inline(c[1].trim())}</${i?'td':'th'}>`).join('')+'</tr>').join('')+'</table></div>'));
 md=md.replace(/<[^>]+>/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'');
 let result='',inList=false;const end=()=>{if(inList){result+='</ul>';inList=false;}};
 for(let line of md.split('\n')){line=line.trim();if(!line){end();continue;}const b=line.match(/^@@BLOCK(\d+)@@$/);if(b){end();result+=saved[+b[1]];continue;}
 const h=line.match(/^#{1,6}\s+(.+)$/);if(h){end();result+=`<h2>${inline(h[1])}</h2>`;continue;}
 if(/^---+$/.test(line)){end();result+='<hr>';continue;}
 if(/^[-*]\s|^\d+\.\s/.test(line)){if(!inList){result+='<ul>';inList=true;}result+='<li>'+inline(line.replace(/^([-*]|\d+\.)\s+/,'').replace(/^\[[ x]\]\s*/,''))+'</li>';continue;}
 end();result+=line.startsWith('>')?'<blockquote>'+inline(line.slice(1).trim())+'</blockquote>':'<p>'+inline(line)+'</p>';
 }end();return result.replace(/\[관련 문서\]\(\.\/#\/docs\/([a-z-]+)\)/g,'<a href="#/docs/$1">관련 문서 →</a>');
}
fs.mkdirSync('dist',{recursive:true});
const docs=catalog.map(d=>({...d,body:render(fs.readFileSync(`content/${d.id}.md`,'utf8'))}));
const attachments=JSON.parse(fs.readFileSync('content/attachments.json','utf8'));
for(const a of attachments){if(!catalog.some(d=>d.id===a.document)||!a.title||!['문서','이미지','영상','빌드'].includes(a.type))throw Error('Invalid attachment');if(!/^https:\/\//.test(a.url)&&!/^files\/[\w./-]+$/.test(a.url))throw Error('Invalid URL');if(a.url.startsWith('files/')&&!fs.existsSync(path.join('dist',a.url)))throw Error('Missing attachment: '+a.url);}
const playlist=fs.readdirSync('content/playlist').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync('content/playlist/'+f,'utf8')));
const images=fs.existsSync('content/images.json')?JSON.parse(fs.readFileSync('content/images.json','utf8')):[];
const gameRank=g=>{const index=images.findIndex(i=>g.title.includes(i.match));return index<0?images.length:index;};
playlist.sort((a,b)=>gameRank(a)-gameRank(b)||a.title.localeCompare(b.title,'ko'));
fs.writeFileSync('dist/data.js','window.PORTFOLIO='+JSON.stringify({docs,attachments,playlist,images}).replaceAll('<','\\u003c')+';');
console.log(`Built ${docs.length} documents, ${attachments.length} attachments.`);
