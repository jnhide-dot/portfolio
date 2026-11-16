/* Approved portfolio presentation. Document data and route behavior stay in app.js. */
(()=>{
  const templates=window.PORTFOLIO_TEMPLATES;
  const {docs,playlist,playlistImages=[],images}=window.PORTFOLIO;
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=name=>'<img class="eh-icon" src="images/ui/'+({portfolio:'docs'}[name]||name)+'.svg" width="24" height="24" alt="" aria-hidden="true">';
  const cover=d=>templates['cover-'+d.deck]||'';
  const documentCards=()=>'<div class="eh-document-grid">'+docs.filter(d=>d.primary).map(d=>'<a class="eh-document" href="#/docs/'+escape(d.id)+'">'+cover(d)+'<div class="eh-document-copy"><small>'+escape(d.number)+' / '+escape(d.group)+'</small><h3>'+escape(d.title)+'</h3><p>'+escape(d.description)+'</p><span class="eh-card-link">문서 보기 <span>→</span></span></div></a>').join('')+'</div>';
  const projectArt=id=>templates['project-'+id]||'';
  const projectCards=()=>'<div class="eh-project-grid">'+docs.filter(d=>d.type).map(d=>'<a class="eh-project" href="#/docs/'+escape(d.id)+'">'+projectArt(d.id)+'<div class="eh-project-meta"><small>'+escape(d.type)+'</small><span>'+escape(d.number)+'</span></div><h3>'+escape(d.title)+'</h3><p>'+escape(d.description)+'</p><span class="eh-card-link">프로젝트 보기 <span>→</span></span></a>').join('')+'</div>';
  const localGames={'game-7cbbf5fb':'wuwa','game-6af3b85e':'genshin','game-a1eedd5b':'zzz'};
  function homeGame(g){const art=localGames[g.id]?{url:'images/portfolio-20261002/'+localGames[g.id]+'.jpg'}:playlistImages.find(i=>i.game===g.id)||images.find(i=>g.title.includes(i.match));return '<a class="pv-game-card" href="#/games/'+escape(g.id)+'">'+(art?'<div class="pv-game-art pv-has-art"><img src="'+escape(art.url)+'" alt="" loading="lazy"></div>':'')+'<div class="pv-game-copy"><h3>'+escape(g.title)+'</h3></div></a>';}
  function home(){return templates.home.replace('{{documents}}',documentCards()).replace('{{projects}}',projectCards()).replace('{{games}}',playlist.slice(0,12).map(homeGame).join('')).replace('{{gameCount}}',playlist.length);}
  function decorate(main,kind,id){
    const documentId=kind==='docs'?id:kind==='artifacts'?window.PORTFOLIO.attachments.find(a=>a.id===id)?.document:kind==='previews'?'project-md':null;
    if(documentId)main.dataset.document=documentId;else delete main.dataset.document;
    if(kind==='about'){
      const section=main.querySelector('.about-section');
      if(section&&!section.querySelector('.pv-about-art')){section.classList.add('about-profile-art');section.insertAdjacentHTML('beforeend',templates['about-art']);}
    }
    if(kind==='docs'&&docs.find(d=>d.id===id)?.type){
      main.querySelector('.document-head')?.insertAdjacentHTML('afterend','<div class="pv-detail-cover">'+projectArt(id)+'</div>');
    }
    if(kind==='playlist'){
      main.querySelector('.collection-head')?.insertAdjacentHTML('beforeend','<div class="theme-play-charm"><img src="images/fandom/aria.webp" width="116" height="116" alt="젠레스 존 제로 아리아"><span>사랑에 열반해♪</span></div>');
    }
    if(kind==='tools'){
      const lab=main.querySelector('.lab-card-visual');
      if(lab)lab.insertAdjacentHTML('afterbegin','<img class="theme-tool-preview" src="images/tool-previews/nikke-squad-art.png" alt="홀로그램 전술판 위 캐릭터와 편성 교체를 표현한 일러스트" loading="lazy">');
      const atlas=main.querySelector('.atlas-card .lab-card-visual');
      if(atlas)atlas.insertAdjacentHTML('afterbegin','<img class="theme-tool-preview" src="images/tool-previews/character-atlas-art.png" alt="도감에서 펼쳐지는 캐릭터 카드와 탐색을 상징하는 돋보기 일러스트" loading="lazy">');
    }
    if(kind==='credits')main.insertAdjacentHTML('beforeend','<div class="credit-row"><h2>캐릭터 SD 스티커</h2><p>© Kuro Games · © HoYoverse. 팬덤 장식에 사용한 캐릭터 이미지는 각 권리자에게 저작권이 있습니다.</p><a href="https://github.com/nikunj3011/Wuthering-Waves-Stickers" target="_blank" rel="noopener">명조 이미지 보관 출처 ↗</a> · <a href="https://github.com/nikunj3011/ZZZ-stickers" target="_blank" rel="noopener">젠레스 존 제로 이미지 보관 출처 ↗</a> · <a href="https://github.com/Ace4896/hsr-stickers-whatsapp" target="_blank" rel="noopener">붕괴: 스타레일 이미지 보관 출처 ↗</a></div>');
  }
  document.addEventListener('error',event=>{
    const image=event.target;
    if(image instanceof HTMLImageElement&&image.closest('.pv-game-art'))image.closest('.pv-game-art').hidden=true;
  },true);
  window.PORTFOLIO_THEME={icon,home,documentCards,projectCards,decorate};
})();
