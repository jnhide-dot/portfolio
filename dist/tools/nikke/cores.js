const corePanel=document.createElement('section');corePanel.className='panel';
corePanel.innerHTML='<h2>보스 코어</h2><div id="coreEvidence"></div><label for="core_mode">계산에 적용할 코어 조건</label><select id="core_mode"><option value="reference">보스 자료 기준 · 미확인 시 효과 제외</option><option value="none">코어 효과 제외해서 비교</option><option value="manual">크기·노출 구간 직접 설정 · 가정 시험</option></select><div id="coreManual"><label for="core_px">코어 크기 (엔진 px)</label><input id="core_px" type="number" step="1" min="1" max="1000" value="0"><label for="coreWindowText">노출 구간 (초) · 빈칸이면 전투 내내</label><input id="coreWindowText" type="text" placeholder="예: 20-45, 80-110"><p class="note">크기는 일반 스크린샷 픽셀과 자동으로 일치하지 않습니다. 보스별 실측값이 없으므로 직접 입력은 가정값으로 기록됩니다. 구간 밖은 코어 효과가 꺼집니다.</p></div><p id="coreApplied" class="team-alert"></p>';
battlePanel.after(corePanel);basicKeys.push('core_mode','core_px');
function coreBoss(){const id=$('boss').value==='spider'?'s40':$('boss_source').value;return catalog?.bosses?.find(b=>b.id===id)}
function coreRanges(){const s=$('coreWindowText').value.trim();if(!s)return [];return s.split(',').map(part=>{const m=part.trim().match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);return m?[Number(m[1]),Number(m[2])]:[NaN,NaN]})}
function validateCoreRanges(){const ranges=coreRanges();const valid=ranges.length<=20&&ranges.every(([a,b])=>Number.isFinite(a)&&Number.isFinite(b)&&a>=0&&a<b&&b<=180);$('coreWindowText').setCustomValidity(valid?'':'0~180초 범위에서 시작-종료를 입력하세요. 예: 20-45, 80-110');return valid}
function drawCore(){
 const b=coreBoss(),c=b?.core,manual=$('core_mode').value==='manual';
 $('coreManual').hidden=!manual;$('core_px').disabled=!manual;$('coreWindowText').disabled=!manual;
 $('coreEvidence').innerHTML=c?`<p><b>S${b.raid} ${esc(b.name)} · ${esc(c.label)}</b></p><p class="note">${esc(c.note)}</p><p>크기: <b>${c.size_px===null?'미측정':c.size_px+'px'}</b> · 노출 구간: <b>${c.status==='absent'?'없음':'미측정'}</b></p><p class="note">${c.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`).join(' · ')}</p>`:'<p>보스를 선택하면 해당 회차의 코어 자료와 확인 상태를 표시합니다.</p>';
 $('coreApplied').textContent=manual?`적용: 사용자 가정 ${$('core_px').value}px · ${$('coreWindowText').value.trim()||'전투 내내 노출'}`:$('core_mode').value==='none'?'적용: 코어 효과 제외':c?.status==='absent'?'적용: 참고 자료의 코어 없음 조건':'적용: 크기·노출 구간 미확인 → 코어 효과 제외한 가정. 실제 보스에 코어가 없다는 뜻은 아닙니다.';
 validateCoreRanges();
}
for(const id of ['core_mode','core_px','coreWindowText'])$(id).addEventListener('input',()=>{drawCore();dirty()});
const syncBeforeCore=sync;sync=function(){syncBeforeCore();drawCore()};
const settingsBeforeCore=settings;settings=function(){const p=settingsBeforeCore();p.core_windows=p.core_mode==='manual'?coreRanges():[];return p};
const configBeforeCore=applyConfig;applyConfig=function(p){configBeforeCore(p);$('coreWindowText').value=(p.core_windows||[]).map(w=>w.join('-')).join(', ');drawCore()};
const resetBeforeCore=resetBattle;resetBattle=function(){resetBeforeCore();$('coreWindowText').value='';drawCore()};
const renderBeforeCore=render;render=function(r){renderBeforeCore(r);$('resultCore')?.remove();const c=r.core_conditions;if(!c)return;const d=document.createElement('div');d.id='resultCore';d.className='team-alert';d.textContent='A/B 공통 코어 조건 — '+c.message+(c.windows.length?' · '+c.windows.map(w=>`${w.start}~${w.end}초`).join(', '):'');$('damageBars').before(d)};
if(catalog&&defaults){drawCore()}
