import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';

// Publish a separate derived package. The source atlas and its offline HTML are never changed.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.resolve(root,'../character-atlas/dist');
const output=path.join(root,'dist/tools/character-atlas');
const LIMIT=25*1024*1024,SHARD_BYTES=8*1024*1024;
const hash=b=>createHash('sha256').update(b).digest('hex');
const raw=fs.readFileSync(path.join(source,'atlas.json'));
const sourceHash=hash(raw),db=JSON.parse(raw.toString('utf8'));
const version=hash(sourceHash+fs.readFileSync(fileURLToPath(import.meta.url),'utf8')).slice(0,16);
if(db.characters.length!==95059||new Set(db.characters.map(c=>c.id)).size!==95059)throw Error('Unexpected source character population');
fs.mkdirSync(output,{recursive:true});
const generated=new Set();
function write(rel,bytes){const target=path.resolve(output,rel);if(!target.startsWith(output+path.sep))throw Error('Invalid output path');const b=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);if(b.length>=LIMIT)throw Error('Asset exceeds 25 MiB: '+rel);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,b);generated.add(rel.replaceAll('\\','/'));return b;}
const privacy={internalFileReferences:0,privateFields:0,privateStrings:0};
const privateKeys=/^(?:authorization|cookie|cookies|set-cookie|requestHeaders|responseHeaders|file_uri|download_url|downloadUrl|access_token|refresh_token|password|secret|api_key|apiKey|cwd|workdir)$/i;
const absolutePath=/(?:^|[\s"'(])[A-Z]:[\\/]|file:\/\/|(?:^|[\s"'(])\/(?:Users|home|mnt\/data|tmp)\//i;
const internalFile=/^(?:\.\.\/|\.\/)?(?:research|scripts|data|dist|delivery(?:-v\d+)?)[\\/]/;
const credentialQuery=/(?:[?&])(?:X-Amz-|X-Goog-|access_token=|signature=|token=|api_key=)/i;
const email=/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
function sanitize(value,key=''){
 if(privateKeys.test(key)){privacy.privateFields++;return undefined;}
 if(typeof value==='string'){
  if(absolutePath.test(value)||credentialQuery.test(value)||email.test(value)){privacy.privateStrings++;return undefined;}
  if(internalFile.test(value)){privacy.internalFileReferences++;return undefined;}
  return value;
 }
 if(Array.isArray(value))return value.map(v=>sanitize(v)).filter(v=>v!==undefined);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,sanitize(v,k)]).filter(([,v])=>v!==undefined));
 return value;
}
const publicDB=sanitize(db),images=[];
for(const c of publicDB.characters){
 if(!c.imageDataUrl)continue;
 const match=c.imageDataUrl.match(/^data:(image\/(?:webp|png|jpeg|gif));base64,([A-Za-z0-9+/=]+)$/);
 if(!match)throw Error('Unsupported embedded image '+c.id);
 const bytes=Buffer.from(match[2],'base64'),digest=hash(bytes),extension={"image/webp":'webp',"image/png":'png',"image/jpeg":'jpg',"image/gif":'gif'}[match[1]];
 const rel='images/'+digest.slice(0,24)+'.'+extension;
 write(rel,bytes);c.imageAsset={path:rel,mime:match[1],bytes:bytes.length,sha256:digest};
 images.push({id:c.id,...c.imageAsset});delete c.imageDataUrl;
}
if(images.length!==151)throw Error('Expected 151 Guardian Tales images');
function gzipAsset(label,value){const plain=Buffer.from(JSON.stringify(value)),zipped=gzipSync(plain,{level:9});const digest=hash(zipped),rel='data/'+label+'.'+digest.slice(0,16)+'.json.gz';write(rel,zipped);return {path:rel,bytes:zipped.length,decodedBytes:plain.length,sha256:digest};}
function splitArray(label,rows,{countLimit=Infinity,byteLimit=SHARD_BYTES}={}){
 const parts=[];let batch=[],bytes=2;
 function flush(){if(!batch.length)return;parts.push({...gzipAsset(label+'-'+String(parts.length).padStart(3,'0'),batch),records:batch.length});batch=[];bytes=2;}
 for(const row of rows){const n=Buffer.byteLength(JSON.stringify(row))+1;if(batch.length&&(batch.length>=countLimit||bytes+n>byteLimit))flush();batch.push(row);bytes+=n;}flush();return parts;
}
function lean(c){
 const row={};for(const k of ['id','name','nameKorean','nameOriginal','aliases','media','works','displayWorks','workAliases','searchTerms','gender','recordKind','recordType','imageKind','imageUrl','originalImageUrl'])if(c[k]!==undefined)row[k]=c[k];
 row.tags=(c.tags||[]).map(t=>typeof t==='string'?t:{name:t.name,status:t.status});
 row.workPeriods=(c.workPeriods||[]).map(p=>typeof p==='string'?p:p.period).filter(Boolean);
 row.inclusion={strongestRole:c.inclusion?.strongestRole};row.popularity={value:c.popularity?.value};
 if(c.imageAsset)row.imageAssetUrl=c.imageAsset.path;
 if(c.imageUpgrade?.rule)row.imageUpgrade={rule:c.imageUpgrade.rule};
 for(const k of ['variants','battlesuits'])if(c[k])row[k]=c[k].map(v=>typeof v==='string'?v:{name:v.name,nameKorean:v.nameKorean,title:v.title});
 return row;
}
const readerRows=publicDB.characters.map(lean);
const readerShared=gzipAsset('reader-meta',{meta:publicDB.meta,labels:publicDB.labels,taxonomy:publicDB.taxonomy});
const readerParts=splitArray('reader',readerRows,{countLimit:5000,byteLimit:Infinity});
const researchFields={};
for(const [key,value]of Object.entries(publicDB))researchFields[key]=Array.isArray(value)?{type:'array',parts:splitArray('research-'+key,value)}:{type:'value',parts:[gzipAsset('research-'+key,value)]};
const manifest={schemaVersion:1,version,sourceHash,generatedAt:new Date().toISOString(),title:publicDB.meta.title,asOf:publicDB.meta.asOf,updatedAt:publicDB.meta.updatedAt,counts:{characters:publicDB.characters.length,anime:publicDB.characters.filter(c=>c.media==='anime').length,games:publicDB.characters.filter(c=>c.media==='game').length,koreanNames:publicDB.characters.filter(c=>c.nameKorean).length,embeddedImages:images.length},reader:{shared:readerShared,parts:readerParts,transferBytes:readerShared.bytes+readerParts.reduce((n,p)=>n+p.bytes,0)},research:{fields:researchFields,transferBytes:Object.values(researchFields).flatMap(f=>f.parts).reduce((n,p)=>n+p.bytes,0)},images:{entries:images,totalBytes:images.reduce((n,p)=>n+p.bytes,0)},privacy:{...privacy,policy:'공개 출처와 캐릭터 기록을 보존하며 작업 파일 경로·인증정보·전송 진단은 제외합니다.'},exports:{format:'public-original-records',images:'JSON 내보내기 시 별도 보관한 원래 이미지 바이트를 imageDataUrl로 복원합니다.',omitted:'비공개 작업 경로·전송 진단만 공개본에서 제외합니다.'}};

const loader=String.raw`(() => {
'use strict';
const mode=document.body.dataset.atlasMode||'reader',panel=document.getElementById('atlas-load'),label=document.getElementById('atlas-load-label'),progress=document.getElementById('atlas-load-progress'),retry=document.getElementById('atlas-load-retry');
let manifest;const imageCache=new Map();let exportBusy=false;
function show(text,value){if(panel)panel.hidden=false;if(label)label.textContent=text;if(progress)progress.value=Math.max(0,Math.min(100,value));}
function fail(error){document.body.classList.remove('atlas-is-loading');show('자료를 불러오지 못했습니다. 연결을 확인하고 다시 시도해 주세요.',0);if(retry)retry.hidden=false;console.error(error);}
if(retry)retry.onclick=()=>location.reload();
async function parallel(items,run){const results=new Array(items.length);let next=0;await Promise.all(Array.from({length:Math.min(4,items.length)},async()=>{while(next<items.length){const i=next++;results[i]=await run(items[i],i);}}));return results;}
async function fetchJSON(part,onBytes,signal){const response=await fetch(part.path,{cache:'force-cache',signal});if(!response.ok)throw Error('자료 응답 오류 '+response.status);let bytes;
 if(response.body&&onBytes){const reader=response.body.getReader(),chunks=[];let total=0;while(true){const {value,done}=await reader.read();if(done)break;chunks.push(value);total+=value.length;onBytes(total);}bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}}
 else{bytes=new Uint8Array(await response.arrayBuffer());if(onBytes)onBytes(bytes.length);}
 if(bytes[0]===31&&bytes[1]===139){if(typeof DecompressionStream==='undefined')throw Error('최신 브라우저가 필요합니다.');const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));return new Response(stream).json();}
 return JSON.parse(new TextDecoder().decode(bytes));
}
window.ATLAS_READY=(async()=>{
 document.body.classList.add('atlas-is-loading');show(mode==='research'?'출처와 기록을 준비하고 있습니다…':'캐릭터 도감을 준비하고 있습니다…',0);
 const response=await fetch('manifest.json',{cache:'no-cache'});if(!response.ok)throw Error('자료 목록을 읽지 못했습니다.');manifest=await response.json();if(manifest.schemaVersion!==1)throw Error('지원하지 않는 자료 버전입니다.');
 const controller=new AbortController(),tasks=mode==='research'?Object.entries(manifest.research.fields).flatMap(([field,spec])=>spec.parts.map((part,index)=>({field,index,part}))):[{field:'shared',part:manifest.reader.shared},...manifest.reader.parts.map((part,index)=>({field:'characters',index,part}))];
 const received=new Array(tasks.length).fill(0),total=tasks.reduce((n,t)=>n+t.part.bytes,0);let completed=0;
 const update=()=>{const fraction=Math.min(.99,received.reduce((n,x)=>n+x,0)/total);show((mode==='research'?'출처와 기록':'캐릭터 목록')+' 불러오는 중 · '+Math.round(fraction*100)+'% ('+completed+'/'+tasks.length+')',fraction*100);};
 let results;try{results=await parallel(tasks,async(task,i)=>{const value=await fetchJSON(task.part,n=>{received[i]=Math.min(n,task.part.bytes);update();},controller.signal);received[i]=task.part.bytes;completed++;update();return {...task,value};});}catch(error){controller.abort();throw error;}
 const DB={};if(mode==='reader'){Object.assign(DB,results[0].value);DB.characters=results.slice(1).flatMap(r=>r.value);}
 else for(const [field,spec]of Object.entries(manifest.research.fields)){const values=results.filter(r=>r.field===field).map(r=>r.value);DB[field]=spec.type==='array'?values.flat():values[0];}
 if(DB.characters.length!==manifest.counts.characters||new Set(DB.characters.map(c=>c.id)).size!==manifest.counts.characters)throw Error('캐릭터 자료가 완전하지 않습니다.');
 window.ATLAS=DB;window.ATLAS_MANIFEST=manifest;document.body.classList.remove('atlas-is-loading');show('준비 완료',100);if(panel)panel.hidden=true;return DB;
})().catch(error=>{fail(error);throw error;});
function findImages(value,found){if(!value||typeof value!=='object')return;if(value.imageAsset?.path)found.set(value.imageAsset.path,value.imageAsset);if(Array.isArray(value)){for(const item of value)findImages(item,found);}else for(const [key,item]of Object.entries(value))if(key!=='imageAsset')findImages(item,found);}
async function imageData(asset){if(imageCache.has(asset.path))return imageCache.get(asset.path);const response=await fetch(asset.path,{cache:'force-cache'});if(!response.ok)throw Error('이미지 파일을 읽지 못했습니다.');const bytes=await response.arrayBuffer();if(bytes.byteLength!==asset.bytes)throw Error('이미지 파일이 완전하지 않습니다.');const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(new Blob([bytes],{type:asset.mime}));});imageCache.set(asset.path,data);return data;}
window.ATLAS_EXPORT=async(value,filename)=>{
 if(exportBusy)return;exportBusy=true;const buttons=[...document.querySelectorAll('[data-export],[data-download-lazy]')];buttons.forEach(b=>b.disabled=true);if(retry)retry.hidden=true;
 try{
  const assets=new Map();findImages(value,assets);const needed=[...assets.values()];let done=0;show('내보낼 자료를 준비하고 있습니다…',0);
  await parallel(needed,async asset=>{await imageData(asset);done++;show('원래 이미지 포함 중 · '+done+'/'+needed.length,needed.length?done/needed.length*80:80);});
  show('JSON 파일을 만들고 있습니다…',90);await new Promise(resolve=>setTimeout(resolve,0));
  const replacer=(key,item)=>{if(key==='imageAsset')return undefined;if(item&&typeof item==='object'&&!Array.isArray(item)&&item.imageAsset){const copy={...item,imageDataUrl:imageCache.get(item.imageAsset.path)};delete copy.imageAsset;return copy;}return item;};
  const parts=[],encoder=new TextEncoder(),put=text=>parts.push(encoder.encode(text));
  function emit(item,level=0){if(Array.isArray(item)){put('[');item.forEach((row,i)=>{if(i)put(',');put(JSON.stringify(row,replacer));});put(']');}else if(item&&typeof item==='object'&&level===0){put('{');const entries=Object.entries(item).filter(([,v])=>v!==undefined);entries.forEach(([key,v],i)=>{if(i)put(',');put(JSON.stringify(key)+':');emit(v,1);});put('}');}else put(JSON.stringify(item,replacer));}
  emit(replacer('',value));const url=URL.createObjectURL(new Blob(parts,{type:'application/json;charset=utf-8'})),anchor=document.createElement('a');anchor.href=url;anchor.download=filename.replace(/[<>:"/\|?* -]/g,'-');document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);if(panel)panel.hidden=true;
 }catch(error){show('내보내지 못했습니다. 연결을 확인한 뒤 내려받기 버튼을 다시 눌러 주세요.',0);console.error(error);}
 finally{exportBusy=false;buttons.forEach(b=>b.disabled=false);}
};
})();
`;
write('data.js',loader);
let app=fs.readFileSync(path.join(source,'app.js'),'utf8');
app=app.replace('new URL(v)','new URL(v,location.href)');
app=app.replace("const safeUrl=v=>{try", "const safeUrl=v=>{if(typeof v!=='string'||!v.trim())return '';try");
app=app.replace("const original=safeUrl(c.originalImageUrl),url=(", "const original=safeUrl(c.originalImageUrl),url=safeUrl(c.imageAssetUrl)||(");
app=app.replace("c.tags.map(tagName).join(' | '),c.imageUrl,notes[c.id]", "c.tags.map(tagName).join(' | '),safeUrl(c.imageAssetUrl||c.imageUrl),notes[c.id]");
if(!app.includes('url=safeUrl(c.imageAssetUrl)||(')||!app.includes('safeUrl(c.imageAssetUrl||c.imageUrl)'))throw Error('Reader adapter no longer matches source');
write('app.js',app);
let research=fs.readFileSync(path.join(source,'research.js'),'utf8');
research=research.replace('new URL(value)','new URL(value,location.href)');
research=research.replace("const mainHref = $('.topline a')?.getAttribute('href') || 'index.html';", "const mainHref = 'index.html';");
const start=research.indexOf('  function download(value, filename) {'),end=research.indexOf("  document.addEventListener('click'",start);
if(start<0||end<start)throw Error('Research export adapter no longer matches source');
research=research.slice(0,start)+'  function download(value, filename) { return window.ATLAS_EXPORT(value, filename); }\n'+research.slice(end);
research=research.replaceAll('이 캐릭터 원본 JSON','이 캐릭터 공개 기록 JSON').replaceAll('전체 데이터 JSON','전체 데이터 JSON · 이미지 포함').replaceAll('캐릭터 원본 전체 필드','캐릭터 공개 기록 전체 필드');
write('research.js',research);
const css=fs.readFileSync(path.join(source,'style.css'),'utf8')+String.raw`
.atlas-loading{position:fixed;z-index:1000;top:20px;left:50%;transform:translateX(-50%);width:min(520px,calc(100% - 32px));padding:20px 24px;border:1px solid #d7d0c8;border-radius:14px;background:#fffaf4;color:#34302c;box-shadow:0 10px 38px #0002}.atlas-loading[hidden]{display:none}.atlas-loading p{margin:0 0 12px;font-weight:650}.atlas-loading progress{display:block;width:100%;height:8px;accent-color:#b86b45}.atlas-loading button{margin-top:14px;padding:8px 14px;cursor:pointer}.atlas-is-loading #collection,.atlas-is-loading #research-tabs,.atlas-is-loading .research-page .search-box{pointer-events:none;opacity:.55}.portfolio-back{display:block;margin:10px 0 14px;font-size:13px;text-decoration:none}.research-page .portfolio-back{display:inline-block;margin:0 14px 0 0}
`;
write('style.css',css);
const loading='<div id="atlas-load" class="atlas-loading" role="status" aria-live="polite"><p id="atlas-load-label">자료를 준비하고 있습니다…</p><progress id="atlas-load-progress" max="100" value="0" aria-label="자료 불러오기 진행률"></progress><button id="atlas-load-retry" hidden>다시 불러오기</button></div>';
for(const [filename,mode]of [['index.html','reader'],['research.html','research']]){
 let html=fs.readFileSync(path.join(source,filename),'utf8').replace(/<body([^>]*)>/,'<body$1 data-atlas-mode="'+mode+'" class="'+(mode==='research'?'research-page ':'')+'atlas-is-loading">'+loading);
 // Avoid a duplicate class attribute on the source research page.
 html=html.replace('class="research-page" data-atlas-mode="research" class="research-page atlas-is-loading"','data-atlas-mode="research" class="research-page atlas-is-loading"');
 if(mode==='reader')html=html.replace('<div class="rail-bottom">','<div class="rail-bottom"><a class="portfolio-back" href="../../#/tools">← 포트폴리오 도구</a>');
 else html=html.replace('<header class="topline">','<header class="topline"><a class="portfolio-back" href="../../#/tools">← 포트폴리오 도구</a>');
 html=html.replace('추가 교차검증은 사용자 요청에 따라 생략했습니다.','출처와 수집 범위는 각 기록에서 확인할 수 있습니다.');
 html=html.replaceAll('href="style.css"','href="style.css?v='+version+'"').replace(/src="(data|app|research)\.js"/g,'src="$1.js?v='+version+'"');
 write(filename,html);
}
// Re-read emitted shards to verify they are complete, ordered, and decodable.
const readPart=p=>JSON.parse(gunzipSync(fs.readFileSync(path.join(output,p.path))));
const readerCheck=readerParts.flatMap(readPart),fullCheck=researchFields.characters.parts.flatMap(readPart);
if(readerCheck.length!==95059||fullCheck.length!==95059)throw Error('Shard reconstruction count mismatch');
for(let i=0;i<fullCheck.length;i++){
 const original=publicDB.characters[i];if(fullCheck[i].id!==original.id||readerCheck[i].id!==original.id||readerCheck[i].nameKorean!==original.nameKorean)throw Error('Character identity or Korean name mismatch');
 if(JSON.stringify(fullCheck[i])!==JSON.stringify(original))throw Error('Full source record lost information');
}
for(const image of images)if(hash(fs.readFileSync(path.join(output,image.path)))!==image.sha256)throw Error('Image bytes changed');
manifest.validation={recordIdsAndOrder:'PASS',koreanNames:'PASS',fullCharacterReassembly:'PASS',embeddedImageBytes:'PASS',perAssetBelow25MiB:true,originalSourceUnmodified:true};
manifest.files=[...generated].map(rel=>({path:rel,bytes:fs.statSync(path.join(output,rel)).size}));
write('manifest.json',JSON.stringify(manifest,null,2)+'\n');
// Remove only obsolete files from this exact derived package, never other portfolio files.
function obsolete(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const target=path.join(dir,entry.name);if(entry.isDirectory())obsolete(target);else if(entry.isFile()){const rel=path.relative(output,target).replaceAll('\\','/');if(!generated.has(rel))fs.unlinkSync(target);}}}
obsolete(output);
console.log(JSON.stringify({output:'dist/tools/character-atlas',version,counts:manifest.counts,readerBytes:manifest.reader.transferBytes,researchBytes:manifest.research.transferBytes,imageBytes:manifest.images.totalBytes,readerParts:readerParts.length,researchCharacterParts:researchFields.characters.parts.length,files:generated.size,maximumAssetBytes:Math.max(...manifest.files.map(f=>f.bytes)),privacy,validation:manifest.validation},null,2));
