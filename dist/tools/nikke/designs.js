// Stateful designs remain distinct from the editable, flat-effect custom model.
const circusId='leona-circus-20261102';
const isCircus=()=>custom.preset===circusId;
const designBar=document.createElement('div');designBar.className='setup-actions';
designBar.innerHTML='<button id="chooseCircus">레오나 이격 · 확정안 불러오기</button><button id="chooseFree">직접 스킬 구성하기</button>';
$('customPanel').before(designBar);
function preferOtherB2(t){if(t.members.includes(CUSTOM)&&t.members.some(n=>n!==CUSTOM&&String(metaFor(n)?.stage)==='2')&&!t.curtain_cycles?.length){t.no_burst=CUSTOM;t.every3=''}}
function loadCircus(){custom=clone(catalog.presets.find(p=>p.preset===circusId));teams.forEach(preferOtherB2);drawCustom();drawTeams();dirty()}
$('chooseCircus').onclick=()=>{saveUndo();loadCircus()};
$('chooseFree').onclick=()=>{saveUndo();custom={name:'새 시험 캐릭터',base:'레오나',stage:'2',cooldown:20,effects:[{stat:'atk_pct',value:20,trigger:'full_burst_start',target:'all_allies',duration:10,n:5}]};teams.forEach(t=>delete t.curtain_cycles);drawCustom();drawTeams();dirty()};
const readBeforeDesign=readCustom;
readCustom=function(){return isCircus()?clone(custom):readBeforeDesign()};
const drawBeforeDesign=drawCustom;
drawCustom=function(){
 drawBeforeDesign();
 const on=isCircus();['customName','customBase','customStage','customCooldown','addEffect'].forEach(id=>$(id).disabled=on);
 document.querySelector('.effect-templates').hidden=on;
 if(!on)return;
 $('effects').innerHTML=`<div class="compact-details"><h3>레오나 이격 · 커튼콜 — 스킬 10 기준</h3>
 <p><b>일반 공격</b> · 원본 레오나의 샷건·능력치·코드·장비 사용 / BⅡ · 20초</p>
 <h3>스포트라이트</h3><p>전투 시작 1중첩, 최대 3. 풀버스트 종료마다 +1. 커튼콜을 쓴 풀버스트 종료 시 1중첩으로 초기화.</p>
 <p>샷건 아군 전체: 중첩당 시전자 공격력의 <b>5%</b> 증가.<br>3초마다 저체력 아군 2명: 시전자 최대 체력의 <b>4.12 / 5.15 / 6.18%</b> 회복.</p>
 <h3>쇼타임 · 풀버스트 진입</h3>
 <p>누적 진입 1 / 2 / 3회 이상: 버스트 쿨타임 <b>1.82 / 4.02 / 6.62초</b> 감소. 스포트라이트 초기화와 별개로 유지.</p>
 <p>공격력 높은 샷건 아군 2명:<br>2중첩 이상 — <b>펠릿 +5 · 명중률 20%</b>, 10초.<br>3중첩 — <b>재장전 속도 20%</b>, 15초.</p>
 <h3>커튼콜 · 버스트</h3><p>샷건 아군 전체 공격 대미지: 중첩당 <b>19%</b>, 최대 57%, 10초.<br>조준선에 가까운 적 1기: 중첩당 <b>201.60%</b> 직접 피해, 최대 <b>604.80%</b>.</p>
 <p>시전 시 3중첩이면 해당 풀버스트 진입 시 샷건 아군 탄창을 현재 최대치까지 충전하고 재장전 중이면 사격 재개. 최대 장탄 수 증가는 없음.</p>
 <p class="note">확정안을 그대로 실행하는 모델입니다. 직접 피해는 1~10레벨 성장표가 있으며 여기서는 10레벨을 적용합니다. 회복의 실전 충분성은 검증되지 않았습니다.</p></div>`;
};
// A named picker entry loads the same canonical data as the custom tab.
const pickerBeforeDesign=drawPicker;
drawPicker=function(){
 pickerBeforeDesign();if(!ui.picker||!catalog.presets)return;
 const [i,j]=ui.picker,q=$('pickerQuery').value.replace(/\s/g,'').toLowerCase();
 if(q&&!('레오나이격커튼콜서커스확정안'.includes(q)))return;
 if($('pickerStage').value&&$('pickerStage').value!=='2'||$('pickerWeapon').value&&$('pickerWeapon').value!=='SG')return;
 const used=teams[i].members.includes(CUSTOM)&&teams[i].members[j]!==CUSTOM;
 $('pickerList').insertAdjacentHTML('afterbegin',`<button class="picker-choice custom" data-design="${circusId}" ${used?'disabled':''}><span class="burst-badge stage-2">B2</span><strong>레오나 이격 · 커튼콜</strong><small>SG · 확정 설계안 · 스포트라이트 / 쇼타임</small></button>`);
};
$('pickerList').addEventListener('click',e=>{const b=e.target.closest('[data-design]');if(!b)return;saveUndo();const [i,j]=ui.picker;custom=clone(catalog.presets.find(p=>p.preset===b.dataset.design));teams[i].members[j]=CUSTOM;for(const key of ['no_burst','every3'])if(!teams[i].members.includes(teams[i][key]))teams[i][key]='';preferOtherB2(teams[i]);dialog.close();drawCustom();drawTeams();dirty()});
const controlsBeforeDesign=controls;
controls=function(i){const html=controlsBeforeDesign(i);if(!isCircus()||!teams[i].members.includes(CUSTOM))return html;return html+`<label for="curtain-${i}">커튼콜 사용 회차 · 선택 사항</label><input id="curtain-${i}" data-curtain="${i}" value="${esc((teams[i].curtain_cycles||[]).join(', '))}" placeholder="예: 13 또는 3, 6, 13" pattern="\\s*(?:[1-9][0-9]?(?:\\s*,\\s*[1-9][0-9]?)*|100)?\\s*"><p class="note">풀버스트 회차 기준. 입력한 회차에 레오나를, 나머지 회차에 다른 B2를 배정합니다. 빈칸이면 기존 자리 우선 / 제외 설정을 따릅니다. 마지막 회차는 전투 결과를 보고 지정하세요.</p>`};
$('teamEditors').addEventListener('change',e=>{if(e.target.dataset.curtain===undefined)return;const i=Number(e.target.dataset.curtain),text=e.target.value.trim();if(!e.target.checkValidity()){e.target.reportValidity();return}teams[i].curtain_cycles=text?text.split(',').map(x=>Number(x.trim())):[];if(text){teams[i].every3='';if(teams[i].no_burst===CUSTOM)teams[i].no_burst=''}drawTeams();document.querySelectorAll('.team-tools')[i].open=true;dirty()});
const teamsBeforeDesign=drawTeams;
drawTeams=function(){for(const t of teams)if(!isCircus()||!t.members.includes(CUSTOM))delete t.curtain_cycles;teamsBeforeDesign();document.querySelectorAll('.team-tools').forEach((d,i)=>{if(teams[i].curtain_cycles?.length)d.querySelector('summary').textContent+=' / 커튼콜: '+teams[i].curtain_cycles.join(', ')+'회'})};
const drawTeamsBeforePolicy=drawTeams;
drawTeams=function(){drawTeamsBeforePolicy();if(!isCircus())return;document.querySelectorAll('.squad').forEach((card,i)=>{const t=teams[i];if(!t.members.includes(CUSTOM))return;const others=t.members.filter(n=>n!==CUSTOM&&String(metaFor(n)?.stage)==='2');const normal=others.length&&t.no_burst===CUSTOM;const cycles=t.curtain_cycles||[];const text=cycles.length?'커튼콜: '+cycles.join(', ')+'회에 사용. 나머지는 다른 B2가 담당합니다.':normal?'스택 유지 운용: 다른 B2가 버스트를 사용합니다. 마무리 커튼콜은 아래에서 회차를 지정하세요.':'주의: 커튼콜을 반복 사용하면 스택이 1로 초기화되어 펠릿·명중·재장전 버프를 얻지 못할 수 있습니다.';card.insertAdjacentHTML('beforeend',`<div class="${normal||cycles.length?'note':'team-alert'}"><b>${esc(text)}</b>${others.length?`<div class="actions"><button type="button" data-other-b2="${i}">평소 ${esc(metaFor(others[0])?.name)} 버스트 사용</button></div>`:''}</div>`)});};
$('teamEditors').addEventListener('click',e=>{const b=e.target.closest('[data-other-b2]');if(!b)return;saveUndo();const t=teams[Number(b.dataset.otherB2)];t.curtain_cycles=[];preferOtherB2(t);drawTeams();dirty()});
const renderBeforeDesign=render;
render=function(r){renderBeforeDesign(r);$('designTrace')?.remove();const panel=document.createElement('details');panel.id='designTrace';panel.className='compact-details';panel.innerHTML='<summary>레오나 이격 · 스택 / 커튼콜 적용 기록</summary>';for(const [i,x] of [r.baseline,r.prototype].entries()){if(!x.design_audit)continue;panel.insertAdjacentHTML('beforeend',`<h3>${'AB'[i]} 편성</h3><div style="max-height:320px;overflow:auto"><table><thead><tr><th>시간</th><th>적용</th></tr></thead><tbody>${x.design_audit.filter(e=>e.event!=='cdr_ramp_activation').map(e=>`<tr><td>${e.t.toFixed(2)}초</td><td>${e.event==='showtime'?'쇼타임 · '+e.stack+'중첩':e.event==='spotlight_end'?'종료 · '+e.before+' → '+e.after+'중첩'+(e.curtain?' (커튼콜 초기화)':''):e.event==='refill'?'샷건 급탄 · '+Object.keys(e.after).map(n=>`${esc(n)} ${e.after[n].ammo}/${e.after[n].max_ammo}`).join(' / '):'커튼콜 · '+e.stack+'중첩 / 공격 대미지 '+e.atk_dmg+'% / 직접 피해 '+e.coefficient.toFixed(2)+'%'}</td></tr>`).join('')}</tbody></table></div>`)}if(panel.children.length>1)$('resultTeams').parentElement.after(panel)};
if(catalog&&teams.length){drawCustom();drawTeams()}
