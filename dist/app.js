const {docs,attachments,playlist,images,playlistImages=[],foundationImages=[]}=window.PORTFOLIO;
const main=document.querySelector('main'),nav=document.querySelector('#nav');
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=d=>'#/docs/'+d.id;
const gameImage=g=>playlistImages.find(i=>i.game===g.id)||images.find(i=>g.title.includes(i.match));
const isSubculture=g=>[...(g.genres||[]),...(g.tags||[])].some(t=>/^서브컬[처쳐]$/.test(t));
const imageForDoc=d=>images.find(i=>i.doc===d.id);
const imageTag=(i,cls='',eager=false)=>i?'<img class="'+cls+'" src="'+E(i.url)+'" alt="'+E(i.title)+' 공식 이미지" '+(eager?'fetchpriority="high"':'loading="lazy"')+'>':'';
const mobile=matchMedia('(max-width:800px)');
const spirit={id:'spirit',title:'프로젝트 스피릿'};
const menuGroups=[
  {id:'about',title:'About Me',items:[]},
  {id:'portfolio',title:'포트폴리오',items:[spirit]},
  {id:'projects',title:'프로젝트',items:docs.filter(d=>d.type)},
  {id:'playlist',title:'플레이리스트',items:playlist}
];
nav.innerHTML=menuGroups.map(g=>g.id==='about'?'<div class="nav-group"><a class="nav-trigger" data-section="about" href="#/about">About Me</a></div>':'<div class="nav-group"><button class="nav-trigger" data-section="'+g.id+'" aria-expanded="false" aria-controls="submenu-'+g.id+'">'+g.title+'<svg class="nav-chevron" viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="nav-dropdown" id="submenu-'+g.id+'" hidden><div class="dropdown-heading"><strong>'+g.title+'</strong><a href="#/'+g.id+'">전체 보기 →</a></div><div class="dropdown-links">'+g.items.map(d=>'<a href="'+(g.id==='about'?'#/about/'+d.id:g.id==='playlist'?'#/games/'+d.id:g.id==='portfolio'?'#/portfolio/spirit':link(d))+'">'+E(d.title)+(g.id==='projects'?'<small>'+E(d.type)+'</small>':'')+'</a>').join('')+'</div></div></div>').join('');
let hoverOpened=false;
function closeSubmenus(){nav.querySelectorAll('button.nav-trigger').forEach(b=>b.setAttribute('aria-expanded','false'));nav.querySelectorAll('.nav-dropdown').forEach(p=>p.hidden=true);hoverOpened=false;}
function openSubmenu(button){closeSubmenus();button.setAttribute('aria-expanded','true');document.getElementById(button.getAttribute('aria-controls')).hidden=false;}
nav.querySelectorAll('.nav-group').forEach(group=>{
  const button=group.querySelector('button');if(!button)return;
  group.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!mobile.matches&&button.getAttribute('aria-expanded')!=='true'){openSubmenu(button);hoverOpened=true;}});
  button.onclick=()=>{if(hoverOpened&&button.getAttribute('aria-expanded')==='true'){hoverOpened=false;return;}button.getAttribute('aria-expanded')==='true'?closeSubmenus():openSubmenu(button);};
  button.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();openSubmenu(button);group.querySelector('.nav-dropdown a').focus();}});
});
document.querySelector('.site-header').addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!mobile.matches)closeSubmenus();});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
document.querySelector('.site-header').addEventListener('focusout',e=>{if(!e.currentTarget.contains(e.relatedTarget))closeSubmenus();});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
function closeMenu(){closeSubmenus();nav.classList.remove('open');document.querySelector('#menu').setAttribute('aria-expanded','false');document.querySelector('#menu').setAttribute('aria-label','메뉴 열기');nav.inert=mobile.matches;}
mobile.addEventListener('change',closeMenu);
document.querySelector('#menu').onclick=()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);nav.inert=!open&&mobile.matches;document.querySelector('#menu').setAttribute('aria-expanded',open);document.querySelector('#menu').setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const trigger=nav.querySelector('.nav-trigger[aria-expanded="true"]');if(trigger){closeSubmenus();trigger.focus();}else if(mobile.matches&&nav.classList.contains('open')){closeMenu();document.querySelector('#menu').focus();}}});
const row=d=>'<a class="doc-row" href="'+link(d)+'"><span class="row-num">'+d.number+'</span><div><div class="row-title">'+d.title+'</div><div class="row-desc">'+d.description+'</div></div><div class="row-meta"><span class="badge">'+d.status+'</span><span class="arrow">↗</span></div></a>';
const projects=()=>'<div class="project-grid">'+docs.filter(d=>d.type).map(d=>'<a class="project-card" href="'+link(d)+'"><small>'+d.type+'</small><span class="project-index">'+d.number+'</span><h3>'+d.title+'</h3><p>'+d.description+'</p><span class="view">프로젝트 보기 →</span></a>').join('')+'</div>';
function gameCard(g){const i=gameImage(g);return '<a class="game-card '+(i?'with-image':'')+'" href="#/games/'+g.id+'"><div class="game-cover">'+(i?imageTag(i):'<span class="game-monogram">'+E(g.title.slice(0,2))+'</span>')+(isSubculture(g)?'<span class="game-tag">서브컬처</span>':'')+'<span class="game-cover-title">'+E(g.title)+'</span></div><div class="game-card-info"><span>'+E(g.status||'기록 확인 중')+'</span><span>'+E(g.proficiency||g.genres[0]||'')+'</span></div></a>';}
function home(){
main.className='home-main';
main.innerHTML='<section class="showcase-hero"><div class="hero-panels">'+images.map((i,n)=>'<a class="hero-panel" href="'+E(i.homepage)+'" target="_blank" rel="noopener noreferrer" style="--image-position:'+E(i.position||'50%')+'">'+imageTag(i,'',n===0)+'<span class="hero-game-name">'+E(i.title)+'<b>↗</b></span></a>').join('')+'</div><div class="hero-heading"><p>JNHIDE / GAME DESIGN</p><h1>전투 시스템.<br>캐릭터. 플레이.</h1></div><div class="hero-bottom"><span>분석에서 기획으로</span><a href="#/projects">프로젝트 보기 <b>→</b></a><a href="#/playlist">플레이리스트 <b>→</b></a></div></section><section class="home-section"><div class="section-title"><div><p class="eyebrow">PORTFOLIO</p><h2>포트폴리오</h2></div><a href="#/portfolio">전체 보기 ↗</a></div>'+spiritCard()+'</section><section class="home-section"><div class="section-title"><div><p class="eyebrow">PROJECTS</p><h2>프로젝트 기록</h2></div><a href="#/projects">전체 보기 ↗</a></div>'+projects()+'</section><section class="playlist-banner"><div><p class="eyebrow">PLAYLIST</p><h2>플레이리스트</h2><p>'+playlist.length+'개의 게임, 플레이 기록과 전투 경험.</p><a class="solid-link" href="#/playlist">플레이리스트 보기 →</a></div><div class="playlist-name-wall">'+playlist.slice(0,12).map(g=>'<a href="#/games/'+g.id+'">'+E(g.title)+'</a>').join('')+'</div></section>';
}
function spiritCard(){return '<div class="project-grid"><a class="project-card" href="#/portfolio/spirit"><small>포트폴리오</small><h3>프로젝트 스피릿</h3><p>전투 분석 · 시스템 · 캐릭터</p><span class="view">포트폴리오 보기 →</span></a></div>';}
function combatCards(){const d=docs.find(d=>d.id==='action-foundations');return '<div class="feature-grid combat-grid"><a class="feature-card" href="'+link(d)+'"><div class="feature-image foundation-triptych">'+foundationImages.map(i=>'<div>'+imageTag(i)+'<span>'+E(i.title)+'</span></div>').join('')+'</div><div class="feature-meta"><span>'+d.number+' / 전투 분석</span><span>↗</span></div><h3>'+E(d.title)+'</h3><p>'+E(d.description)+'</p></a>'+images.map(i=>{const d=docs.find(d=>d.id===i.doc);return '<a class="feature-card" href="'+link(d)+'"><div class="feature-image">'+imageTag(i)+'</div><div class="feature-meta"><span>'+d.number+' / 전투 분석</span><span>↗</span></div><h3>'+E(i.title)+'</h3><p>'+d.description+'</p></a>';}).join('')+'</div>';}
function portfolioPage(detail){
main.className='collection-main';document.title=(detail?'프로젝트 스피릿':'포트폴리오')+' — Jnhide';
main.innerHTML=(detail?'<a class="back-link" href="#/portfolio">← 포트폴리오</a>':'')+'<header class="collection-head"><p class="eyebrow">PORTFOLIO</p><h1>'+(detail?'프로젝트 스피릿':'포트폴리오')+'</h1></header>'+(detail?['전투 분석','비교·제안'].map(group=>'<section><div class="section-title"><h2>'+(group==='전투 분석'?'전투 분석':'시스템·캐릭터')+'</h2></div>'+(group==='전투 분석'?combatCards():docs.filter(d=>d.group===group).map(row).join(''))+'</section>').join(''):spiritCard());
}
const toolInfo={
 'Notion':['notion.svg','https://www.notion.com/'],
 'Jira':['jira.svg','https://www.atlassian.com/software/jira'],
 'Word':['word.svg','https://www.microsoft.com/microsoft-365/word'],
 'Excel':['excel.svg','https://www.microsoft.com/microsoft-365/excel'],
 'PowerPoint':['powerpoint.svg','https://www.microsoft.com/microsoft-365/powerpoint'],
 'Figma':['figma.svg','https://www.figma.com/'],
 'Photoshop':['photoshop.svg','https://www.adobe.com/products/photoshop.html'],
 'Premiere':['premiere.svg','https://www.adobe.com/products/premiere.html'],
 'Unity':['unity.svg','https://unity.com/'],
 'Python':['python.svg','https://www.python.org/'],
 'Lua Script':['lua.svg','https://www.lua.org/'],
 'GitHub':['github.png','https://github.com/'],
 'Fork':['fork.png','https://fork.dev/'],
 'Antigravity':['antigravity.png','https://antigravity.google/'],
 'Claude':['claude.svg','https://claude.ai/'],
 'GPT':['openai.svg','https://chatgpt.com/'],
 'Gemini':['googlegemini.svg','https://gemini.google.com/']
};
function toolCard(name){
 const [icon,url]=toolInfo[name];
 return '<li><a class="tool-link" href="'+E(url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+E(name)+' 공식 사이트 (새 탭)"><span class="tool-icon"><img src="images/tools/'+E(icon)+'" width="32" height="32" alt="" loading="lazy"></span><span class="tool-name">'+E(name)+'</span><span class="tool-external" aria-hidden="true">↗</span></a></li>';
}
function aboutSection(id){
const skills=id==='qualifications-tools';main.className='collection-main';document.title=(skills?'자격증·사용 가능한 툴':'프로필·연혁')+' — Jnhide';
const groups=[['문서·협업',['Notion','Jira','Word','Excel','PowerPoint']],['디자인·영상',['Figma','Photoshop','Premiere']],['개발',['Unity','Python','Lua Script','GitHub','Fork']],['AI',['Antigravity','Claude','GPT','Gemini']]];
main.innerHTML='<header class="collection-head"><p class="eyebrow">ABOUT</p><h1>'+(skills?'자격증·사용 가능한 툴':'프로필·연혁')+'</h1><p class="intro">어 식 · 전투 시스템 · 캐릭터 전투 기획</p></header>'+(skills?'<section class="about-section"><h2>자격증</h2><dl class="game-facts"><div><dt>자격</dt><dd>MOS Master</dd></div><div><dt>어학</dt><dd>JLPT N3</dd></div></dl></section><section class="about-section"><h2>사용 가능한 툴</h2><div class="about-tool-grid">'+groups.map(([title,items])=>'<section><h3>'+title+'</h3><ul>'+items.map(toolCard).join('')+'</ul></section>').join('')+'</div></section>':'<section class="about-section"><h2>프로필</h2><dl class="game-facts"><div><dt>이름</dt><dd>어 식</dd></div><div><dt>분야</dt><dd>전투 시스템 · 캐릭터 전투 기획</dd></div><div><dt>전공</dt><dd>컴퓨터공학</dd></div></dl></section><section class="about-section"><h2>연혁</h2><dl class="game-facts"><div><dt>전공</dt><dd>컴퓨터공학</dd></div><div><dt>1년</dt><dd>자연어 처리 학부연구생</dd></div><div><dt>약 2개월</dt><dd>캐릭터 전투 시스템 기획 · 기획 연수생 5인 팀</dd></div><div><dt>2026.07.21–09.09</dt><dd>PM·팀장 프로젝트 · 종료·인계 완료</dd></div></dl></section>');
}
function aboutPage(){
aboutSection('profile-history');const profile=main.innerHTML;
aboutSection('qualifications-tools');const skills=main.innerHTML.replace(/<header class="collection-head">[\s\S]*?<\/header>/,'');
main.innerHTML=profile.replace('<h1>프로필·연혁</h1>','<h1>About Me</h1>')+skills;document.title='About Me — Jnhide';
}
function collection(kind){
const types={analysis:['COMBAT ANALYSIS','전투 분석','공통 전투 구조와 게임별 고유 시스템.',docs.filter(d=>d.group==='전투 분석')],design:['SYSTEM & CHARACTER','시스템·캐릭터','비교 분석에서 전투 시스템과 초기 캐릭터 제안으로.',docs.filter(d=>d.group==='비교·제안')],projects:['PROJECTS','프로젝트','개인 프로젝트, 첫 팀 프로젝트, 기업 협약 프로젝트.',[]]};
const [eyebrow,title,desc,items]=types[kind];main.className='collection-main';main.innerHTML='<header class="collection-head"><p class="eyebrow">'+eyebrow+'</p><h1>'+title+'</h1><p class="intro">'+desc+'</p></header>'+(kind==='projects'?projects():items.map(row).join(''));document.title=title+' — Jnhide';
}
function documentPage(d){
main.className='reader-main';
main.innerHTML='<a class="back-link" href="#/'+(d.type?'projects':'portfolio/spirit')+'">← '+(d.type?'프로젝트':'프로젝트 스피릿')+'</a><header class="document-head"><p class="eyebrow">'+(d.type?'PROJECT':'DOCUMENT')+' '+d.number+'</p><h1>'+d.title+'</h1><p class="intro">'+d.description+'</p><div class="doc-info"><span class="badge">'+d.status+'</span><span>Jnhide</span></div></header><div class="doc-layout"><article class="article">'+d.body+'</article><aside class="toc" aria-label="이 문서의 목차"><strong>목차</strong></aside></div><section class="attachments"><h2>첨부 자료</h2><div id="assets"></div></section><nav class="doc-pager" aria-label="이전 다음 문서">'+(docs.indexOf(d)>0?'<a href="'+link(docs[docs.indexOf(d)-1])+'">← 이전 문서</a>':'<a href="#/portfolio/spirit">← 프로젝트 스피릿</a>')+(docs.indexOf(d)<docs.length-1?'<a href="'+link(docs[docs.indexOf(d)+1])+'">다음 문서 →</a>':'<a href="#/projects">프로젝트 →</a>')+'</nav>';
main.querySelectorAll('.article h2').forEach((h,i)=>{h.id='section-'+i;const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;a.onclick=e=>{e.preventDefault();h.scrollIntoView({behavior:'smooth'});};main.querySelector('.toc').append(a);});
const files=attachments.filter(a=>a.document===d.id&&!a.hidden);document.querySelector('#assets').innerHTML=files.length?files.map(a=>'<a class="attachment" href="'+E(a.source||(a.body?'#/artifacts/'+a.id:a.url))+'"'+(a.body&&!a.source?'':' target="_blank" rel="noopener"')+'><small>'+E(a.type)+'</small>'+E(a.title)+' ↗'+(a.type==='이미지'?'<img src="'+E(a.url)+'" alt="'+E(a.title)+'" loading="lazy">':'')+'</a>').join(''):'<p class="empty-assets">아직 등록된 첨부 자료가 없습니다.</p>';document.title=d.title+' — Jnhide';
}
function artifactPage(a){
const parent=docs.find(d=>d.id===a.document);
main.className='reader-main';document.title=a.title+' — Jnhide';
main.innerHTML='<a class="back-link" href="'+link(parent)+'">← '+E(parent.title)+'</a><header class="document-head"><p class="eyebrow">'+E(parent.title)+'</p><h1>'+E(a.title)+'</h1></header><div class="doc-layout"><article class="article">'+a.body+'</article><aside class="toc" aria-label="이 문서의 목차"><strong>목차</strong></aside></div>';
main.querySelectorAll('.article h2').forEach((h,i)=>{h.id='section-'+i;const anchor=document.createElement('a');anchor.href='#'+h.id;anchor.textContent=h.textContent;anchor.onclick=e=>{e.preventDefault();h.scrollIntoView({behavior:'smooth'});};main.querySelector('.toc').append(anchor);});
}
function playlistPage(){
main.className='collection-main playlist-main';document.title='플레이리스트 — Jnhide';
main.innerHTML='<header class="collection-head"><p class="eyebrow">PLAYLIST</p><h1>플레이리스트</h1><p class="intro">플레이한 게임과 진행도, 주력 콘텐츠를 기록합니다.</p></header><div class="playlist-toolbar"><div class="filter-buttons" role="group" aria-label="플레이 기록 필터"><button class="selected" aria-pressed="true" data-filter="all">전체 <span>'+playlist.length+'</span></button><button aria-pressed="false" data-filter="subculture">서브컬처</button><button aria-pressed="false" data-filter="playing">플레이 중</button><button aria-pressed="false" data-filter="analysis">분석 연결</button></div><label class="game-search"><span>게임 검색</span><input id="game-search" type="search" placeholder="게임명 검색" autocomplete="off"></label></div><p class="record-caption">노션에 기록된 상태 기준 · 2026.09.14</p><div class="games-grid" id="games"></div>';
let filter='all';const paint=()=>{const q=document.querySelector('#game-search').value.trim().toLowerCase();const filtered=playlist.filter(g=>(filter==='all'||(filter==='subculture'?isSubculture(g):filter==='playing'?g.status.includes('플레이'):!!g.relatedDoc))&&g.title.toLowerCase().includes(q));document.querySelector('#games').innerHTML=filtered.length?filtered.map(gameCard).join(''):'<p class="empty-assets">검색한 게임이 없습니다.</p>';};main.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;main.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',x===b);});paint();});document.querySelector('#game-search').oninput=paint;paint();
}
function gamePage(g){
main.className='game-detail-main';const i=gameImage(g);const related=docs.find(d=>d.id===g.relatedDoc);document.title=g.title+' · 플레이리스트 — Jnhide';
main.innerHTML='<a class="back-link" href="#/playlist">← 플레이리스트</a><header class="game-detail-head '+(i?'has-art':'')+'">'+imageTag(i)+'<div><p class="eyebrow">PLAYLIST</p><h1>'+E(g.title)+'</h1><p>'+E([...new Set([...g.genres,...(g.tags||[])])].join(' · '))+'</p></div></header><div class="game-content"><section><div class="section-title"><h2>플레이 기록</h2><a class="edit-record" href="https://github.com/jnhide-dot/portfolio/edit/main/content/playlist/'+g.id+'.json" target="_blank" rel="noopener">기록 편집 ↗</a></div><p class="record-caption">노션 기록 기준 · '+E(g.snapshot)+' / 이전 기록은 실제 현재 상태와 다를 수 있습니다.</p><dl class="game-facts">'+[['기록 상태',g.status],['진행도',g.progress],['숙련도',g.proficiency],['플랫폼',g.platforms.join(' · ')],['플레이 시간',g.hours===null?'':g.hours+'시간']].map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+E(v||'미기록')+'</dd></div>').join('')+'</dl><h2>주력 플레이</h2><p>'+E(g.mainPlay||'아직 작성한 기록이 없습니다.')+'</p><h2>주요 콘텐츠</h2><p>'+E(g.mainContent||'아직 작성한 기록이 없습니다.')+'</p><h2>플레이 인사이트</h2><p>'+E(g.insight||'아직 작성한 기록이 없습니다.')+'</p></section><aside class="related-analysis"><p class="eyebrow">RELATED</p><h2>연결된 분석</h2>'+(related?'<a href="'+link(related)+'">'+related.title+' ↗</a>':'<p>아직 연결된 분석이 없습니다.</p>')+'</aside></div>';
}
function render(){
closeMenu();const parts=(location.hash||'#/').slice(2).split('/');const kind=parts[0],id=parts[1];const doc=docs.find(d=>d.id===id),game=playlist.find(g=>g.id===id);const section=kind==='docs'?(doc?.type?'projects':'portfolio'):kind==='games'?'playlist':['analysis','design'].includes(kind)?'portfolio':kind||'about';nav.querySelectorAll('.nav-trigger').forEach(b=>b.classList.toggle('current',b.dataset.section===section));nav.querySelectorAll('a').forEach(a=>{a.hash===(location.hash||'#/')?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current');});
if(!kind){document.title='Jnhide — 전투 시스템·캐릭터 기획';home();}
else if(kind==='about')aboutPage(id);
else if(kind==='portfolio'&&(!id||id==='spirit'))portfolioPage(id==='spirit');
else if(['analysis','design'].includes(kind))portfolioPage(true);
else if(kind==='projects')collection(kind);
else if(kind==='docs'&&doc)documentPage(doc);
else if(kind==='artifacts'&&attachments.some(a=>a.id===id&&a.body))artifactPage(attachments.find(a=>a.id===id));
else if(kind==='playlist')playlistPage();
else if(kind==='games'&&game)gamePage(game);
else if(kind==='credits'){main.className='collection-main';main.innerHTML='<p class="eyebrow">IMAGE CREDITS</p><h1>이미지 출처</h1><p class="intro">게임 이미지는 각 권리자에게 저작권이 있으며, 게임 분석과 플레이 기록을 소개하기 위해 사용했습니다.</p>'+[...images,...playlistImages,...foundationImages].map(i=>'<div class="credit-row"><h2>'+E(i.title)+'</h2><p>'+E(i.copyright)+'</p>'+(i.source?'<a href="'+E(i.source)+'" target="_blank" rel="noopener">공식 이미지 출처 ↗</a>':'<p>'+E(i.sourceNote||'')+'</p>')+'</div>').join('');document.title='이미지 출처 — Jnhide';}
else{main.className='collection-main';main.innerHTML='<h1>페이지를 찾을 수 없습니다.</h1><a href="#/">메인으로 →</a>';}
window.scrollTo(0,0);
}
window.addEventListener('hashchange',()=>{if(location.hash==='#main'){main.focus();return;}render();main.focus({preventScroll:true});});render();
