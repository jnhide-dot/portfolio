// Imported damage data and modeled attack timing have separate provenance.
const bossLibrary=document.createElement('div');bossLibrary.className='boss-library';
bossLibrary.innerHTML='<label for="boss_source">보스 자료 선택</label><select id="boss_source"><option value="">직접 입력 / 기존 패턴 모델</option></select><p class="note">S1~S43 · 스탯과 공격 자료를 불러옵니다. 실제 공격 순서가 있는 모델은 별도로 표시합니다.</p><div id="bossFacts" hidden></div>';
battlePanel.querySelector('h2').after(bossLibrary);basicKeys.push('boss_source');
let bossOptionsReady=false;
function initBossOptions(){if(bossOptionsReady||!catalog?.bosses)return;const old=$('boss_source').value;for(const b of [...catalog.bosses].reverse()){const opt=document.createElement('option');opt.value=b.id;opt.textContent=`S${b.raid} · ${b.name} · ${b.code}${b.pattern_model==='spider'?' · 영상 근사':' · 주기 미검증'}`;$('boss_source').append(opt)}$('boss_source').value=old;for(const b of [...catalog.bosses].reverse()){const o=document.createElement('option');o.value=b.id;o.textContent=`S${b.raid} · ${b.name} · ${b.model_summary.label}`;$('nativePatternChoice').append(o)}$('nativePatternChoice').value=old||'s40';bossOptionsReady=true}
function selectedBoss(){return catalog?.bosses?.find(b=>b.id===$('boss_source').value)}
function applyBossStats(b){for(const k of ['atk','def','code'])$(k).value=b[k]}
function sampleAttacks(b){return b.skills.filter(s=>s.spec&&!s.interceptable&&!s.conditional).slice(0,6)}
function applyBossAttackSet(){
 const b=selectedBoss();if(!b)return;const attacks=sampleAttacks(b);
 if(!attacks.length){$('boss').value='dummy';sync();dirty();return}
 applyBossStats(b);$('boss').value='custom';$('patterns').replaceChildren();patternId=0;
 // Deliberately labeled synthetic test sequence, NOT an inferred AI timeline.
 const every=Math.max(30,attacks.length*8);
 attacks.forEach((s,i)=>addPattern({name:s.name,start:8+i*8,every,interval:.3,...s.spec}));
 sync();dirty();
}
function drawBossFacts(){
 initBossOptions();const b=selectedBoss(),box=$('bossFacts');box.hidden=!b;if(!b)return;
 const fmt=n=>Number(n).toLocaleString('ko-KR'),dummy=$('boss').value==='dummy';
 const changed=['atk','def','code'].some(k=>String($(k).value)!==String(b[k]));
 const attacks=sampleAttacks(b);
 box.innerHTML=`<div class="boss-fact-title"><strong>S${b.raid} · ${esc(b.name)}</strong><span class="boss-state">${changed?'스탯 수정됨':'자료 스탯 적용'}</span></div><div class="boss-fact-grid"><span>자료 레벨<b>${b.level}</b></span><span>속성<b>${esc(b.code)}</b></span><span>공격력<b>${fmt(b.atk)}</b></span><span>방어력<b>${fmt(b.def)}</b></span></div>
 <div class="boss-attack-status ${dummy?'warn':''}"><strong>${dummy?'피격 OFF · 보스가 공격하지 않습니다':'피격 ON · 자료 기반 공격 시험'}</strong><p>${dummy?'힐·생존 비교에는 공격을 적용하세요.':'원본 계수와 지원 가능한 표적을 변환한 시험입니다. 피해량은 실전 미검증입니다. 아래 첫 공격·반복 간격·연타 간격은 시험값이며 실제 보스 순서가 아닙니다.'}</p></div>
 <div class="actions">${b.pattern_model==='spider'?'<button type="button" data-boss-model>영상 기반 S40 패턴 적용 · 180초</button>':''}${attacks.length?`<button type="button" data-boss-set>자료 공격 ${attacks.length}종 불러오기</button>`:''}<button type="button" data-boss-dummy>스탯만 · 무피격</button></div>
 <p class="note">공격 묶음: 첫 8초부터 8초씩 순차 배치 / 각 공격 ${Math.max(30,attacks.length*8)}초마다 반복 / 연타 0.3초. 모두 편집 가능한 임시 시험값입니다. 요격 가능·확인된 조건부 공격은 묶음에서 제외합니다. 그 외 발동 조건은 미검증입니다.</p>
 ${b.pattern_model==='spider'?'<p class="note">S40 패턴 모델은 별도 Lv400 스탯·영상 기반 순서와 성공/실패 분기를 사용합니다. 일부 기믹 수치는 추정값입니다.</p>':''}
 <details class="boss-skill-list"><summary>공격 스킬 ${b.skills.length}개 · 파츠 ${b.parts.length}개 보기</summary><p class="note">개별 공격을 추가할 수 있습니다(최대 6개). 테이블 타수는 실제 발사체 수와 다를 수 있습니다. 요격·저지·부가 효과는 반복 공격 시험에 반영하지 않습니다.</p>${b.skills.map(s=>`<div class="boss-skill"><strong>${esc(s.name)}</strong><p>${esc(s.description)}</p>${s.spec?`<small>계수 ${s.spec.coeff}% · ${esc({all:'아군 전체','random:1':'무작위 1명','top_atk:1':'공격력 1위'}[s.spec.target])} · 테이블 타수 ${s.spec.hits}${s.spec.pierce?' · 관통':''}${s.interceptable?' · 요격 미반영 / 전부 피격':''}${s.conditional?' · 저지·취소 조건 미반영':''}</small><button type="button" data-boss-skill="${s.id}">이 공격 추가</button>`:`<small>${esc((s.issues||['기믹·특수 표적: 정보 열람만 지원']).join(' / '))}</small>`}</div>`).join('')}${b.parts.length?'<h4>파츠 정보 · 반복 시험에는 미적용</h4>'+b.parts.map(p=>`<p class="note">${esc(p.name)} · HP ${p.hp==null?'미확인':fmt(p.hp)}</p>`).join(''):''}</details><p class="note">반복 시험에서는 거리 변화·코어 노출 변화·파츠·레벨 상승·특수 기믹을 자동 재현하지 않습니다.</p><div class="boss-source-note"><a href="${b.source}" target="_blank" rel="noopener noreferrer">출처: Enikk</a> · ${b.collected} 수집 · ${esc(b.source_name)}</div>`;
}
$('boss_source').onchange=()=>{const b=selectedBoss();if(b){applyBossStats(b);applyBossAttackSet()}else{sync();dirty()}};
$('bossFacts').onclick=e=>{
 if(e.target.closest('[data-boss-model]')){$('boss').value='spider';$('duration').value=180;sync();dirty();return}
 if(e.target.closest('[data-boss-set]')){applyBossAttackSet();return}
 if(e.target.closest('[data-boss-dummy]')){$('boss').value='dummy';sync();dirty();return}
 const button=e.target.closest('[data-boss-skill]');if(!button)return;
 const s=selectedBoss()?.skills.find(s=>s.id===Number(button.dataset.bossSkill));if(!s?.spec)return;
 if($('patterns').children.length>=6){$('patternHelp').textContent='최대 6개까지 추가할 수 있습니다. 기존 공격을 하나 삭제하세요.';return}
 $('boss').value='custom';addPattern({name:s.name,start:8,every:30,interval:.3,...s.spec});sync();dirty();
};

function applyNativeModel(){
 initBossOptions();const b=catalog.bosses.find(b=>b.id===$('nativePatternChoice').value);if(!b)return;
 $('boss').value=b.pattern_model;$('boss_source').value=b.pattern_model==='spider'?'':b.id;
 applyBossStats(b);$('duration').value=Math.min(180,b.battle_time||180);sync();dirty();
}
function drawNativeModel(){
 if(!['spider','library'].includes($('boss').value))return;
 const id=$('boss').value==='spider'?'s40':$('boss_source').value;
 $('nativePatternChoice').value=id;const b=catalog.bosses.find(b=>b.id===id);if(!b)return;
 const m=b.model_summary;
 $('bossNote').textContent=`S${b.raid} ${b.name} · ${m.label} · 보스 Lv${m.level}`;
 $('enemyFields').hidden=true;$('patternHelp').textContent='보스를 선택하면 미검증 공격 시험으로 A/B를 계산합니다. 개별 수치를 바꾸려면 직접 설정을 사용하세요.';
 $('nativePatternDetails').innerHTML=`<div class="boss-attack-status warn"><strong>실전 피해 미검증 · 생존·힐 판단에 사용 불가</strong><p>현재는 누락·오변환을 수정한 자료 공격 시험입니다. 실제 공격 시각·타수·피격량 측정은 완료되지 않았습니다.</p></div><div class="boss-attack-status"><strong>${esc(b.name)} · ${esc(m.label)}</strong><p>${m.kind==='video'?'공격 순서·저지 성공/실패·파츠·소환을 모델에서 적용합니다.':'보스 스탯과 '+m.attacks.length+'종의 공격을 전투 시간 동안 자동 실행합니다.'}</p></div><p class="note">${esc(m.timing_basis)}</p>${m.attacks.length?'<h3>적용 공격</h3>'+m.attacks.map(a=>`<div class="boss-skill"><strong>${esc(a.name)}</strong><small>${a.spec.coeff}% · ${esc({all:'전체','random:1':'무작위 1명','top_atk:1':'공격력 1위'}[a.spec.target])} · ${a.spec.hits}타${a.interceptable?' · 요격 없이 피격':''}</small></div>`).join(''):''}<details><summary>적용 범위 · 제외한 효과${m.excluded.length?' '+m.excluded.length+'개':''}</summary>${m.limitations.map(x=>`<p class="note">${esc(x)}</p>`).join('')}${m.excluded.map(x=>`<p class="note">${esc(x.name)} — ${esc(x.reason)}</p>`).join('')}</details>`;
 $('runSummary').textContent=`S${b.raid} ${b.name} · ${m.label} · ${$('duration').value}초`;
}
$('nativePatternChoice').onchange=applyNativeModel;
document.querySelectorAll('[data-scenario]').forEach(button=>button.onclick=()=>{
 if(button.dataset.scenario==='library'){
  initBossOptions();if($('boss_source').value)$('nativePatternChoice').value=$('boss_source').value;
  applyNativeModel();
 }else{$('boss').value=button.dataset.scenario;sync();dirty()}
});

const syncBeforeBossLibrary=sync;
sync=function(){if($('boss').value==='spider')$('boss_source').value='';syncBeforeBossLibrary();bossLibrary.hidden=['spider','library'].includes($('boss').value);drawBossFacts();drawNativeModel();if(selectedBoss()&&$('boss').value==='custom')$('patternHelp').textContent='자료에서 가져온 공격입니다. 시각과 반복 간격은 시험값입니다. 실제 패턴으로 검증하려면 영상 기반 모델을 사용하세요.'};
const savedBeforeBossLibrary=drawSaved;drawSaved=function(){initBossOptions();savedBeforeBossLibrary();drawBossFacts()};
const configBeforeBossLibrary=applyConfig;applyConfig=function(p){initBossOptions();configBeforeBossLibrary(p);drawBossFacts()};
for(const k of ['atk','def','code','distance'])$(k).addEventListener('change',drawBossFacts);
const renderBeforeBossLibrary=render;
render=function(r){renderBeforeBossLibrary(r);if(r.settings.boss_source&&r.settings.boss!=='library'){const b=r.boss_reference||catalog.bosses.find(b=>b.id===r.settings.boss_source);$('resultTag').textContent=`S${b.raid} ${b.name} · ${r.settings.boss==='dummy'?'스탯 적용 / 무피격':'자료 기반 공격 시험'}`;const li=document.createElement('li');li.className='note';li.textContent='자료 기반 반복 공격 시험입니다. 실제 패턴 순서·거리 변화·파츠·코어 노출 변화·레벨 상승·기믹 재현은 포함하지 않습니다.';$('warnings').prepend(li)}};
if(catalog){initBossOptions();drawBossFacts();drawNativeModel()}
