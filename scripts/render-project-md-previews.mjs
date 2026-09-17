// Intermediate PDFs stay under ignored .sites-runtime; only raster previews are published.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const modules = process.env.CODEX_NODE_MODULES;
if (!modules) throw Error('Set CODEX_NODE_MODULES to the bundled runtime node_modules');
const {chromium} = await import(pathToFileURL(path.join(modules, 'playwright/index.mjs')));
const {marked} = await import(pathToFileURL(path.join(modules, 'marked/lib/marked.esm.js')));
const scratch = '.sites-runtime/project-md-previews';
const sources = JSON.parse(fs.readFileSync(`${scratch}/sources.json`, 'utf8'));
const escape = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function csvHtml(rows) {
  const cols = Math.max(1, ...rows.map(r => r.length));
  let html = '';
  for (let start=0; start<cols; start+=6) {
    const end = Math.min(start+6, cols);
    html += `<section class="csv-section"><h2>열 ${start+1}–${end} / ${cols}</h2><table><thead><tr><th class="row-number">행</th>${Array.from({length:end-start},(_,i)=>`<th>열 ${start+i+1}</th>`).join('')}</tr></thead><tbody>`;
    rows.forEach((row, i) => {
      if (!row.length || row.every(v=>!v)) return;
      const comment = row.length===1 || row[0].startsWith('#');
      html += `<tr><td class="row-number">${i+1}</td>` + (comment ? `<td colspan="${end-start}" class="csv-note">${escape(row.join(','))}</td>` : Array.from({length:end-start},(_,j)=>`<td>${escape(row[start+j]??'')}</td>`).join('')) + '</tr>';
    });
    html += '</tbody></table></section>';
  }
  return html;
}
const css = `@page{size:A4;margin:17mm 13mm 18mm}*{box-sizing:border-box}body{margin:0;color:#172b46;font:10pt/1.65 "Malgun Gothic",Arial,sans-serif;overflow-wrap:anywhere}h1{font-size:20pt;line-height:1.4}h2{font-size:15pt}h3{font-size:12pt}h1,h2,h3,h4{break-after:avoid}p,li{orphans:3;widows:3}table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:8pt;line-height:1.5;margin:12px 0}th,td{border:1px solid #ced8e5;padding:6px;vertical-align:top;overflow-wrap:anywhere;white-space:pre-wrap}th{background:#eaf0f9;text-align:left}thead{display:table-header-group}tr{break-inside:avoid}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f2f5fa;border:1px solid #d9e2ef;padding:12px;font:8pt/1.6 Consolas,"Malgun Gothic",monospace}code{overflow-wrap:anywhere}blockquote{margin:16px 0;padding:4px 14px;border-left:3px solid #7594c1;color:#526581}img{max-width:100%}a{color:inherit;text-decoration:none}.csv-section+.csv-section{break-before:page}.row-number{width:34px;color:#687e9d;font-size:7pt}.csv-note{color:#526581}.file-name{font-size:11pt;border-bottom:2px solid #3558a0;padding-bottom:12px;margin-bottom:22px}.category{font-size:8pt;letter-spacing:1px;color:#637d9c}hr{border:0;border-top:1px solid #d9e2ef}`;
const browser = await chromium.launch({headless:true,channel:'msedge'});
try {
  const page = await browser.newPage({javaScriptEnabled:false});
  await page.route('**/*',route=>route.abort());
  for (const [index,item] of sources.entries()) {
    const output = `${scratch}/${item.id}.pdf`;
    const body = item.rows ? csvHtml(item.rows) : marked.parse(item.markdown);
    await page.setContent(`<html lang="ko"><meta charset="utf-8"><style>${css}</style><body><div class="category">PROJECT MD · ${escape(item.category)}</div><div class="file-name">${escape(item.title)}</div><article>${body}</article></body></html>`);
    await page.evaluate(()=>{
      document.querySelectorAll('script,iframe,object,embed,form,style:not(head style)').forEach(el=>el.remove());
      document.querySelectorAll('img').forEach(el=>el.replaceWith(document.createTextNode(el.alt||'이미지 참조')));
      document.querySelectorAll('*').forEach(el=>{for(const attr of [...el.attributes])if(attr.name.startsWith('on'))el.removeAttribute(attr.name);});
      document.querySelectorAll('a').forEach(el=>el.removeAttribute('href'));
    });
    await page.evaluate(()=>document.fonts.ready);
    await page.pdf({path:output,printBackground:true,preferCSSPageSize:true});
    if (index%10===0 || index===sources.length-1) console.log(`Rendered ${index+1}/${sources.length}: ${item.title}`);
  }
} finally { await browser.close(); }
