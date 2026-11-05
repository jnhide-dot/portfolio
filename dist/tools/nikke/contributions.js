(function(){
 function contributions(run,metric){
  const rows=(run.members||[]).map(m=>({name:m.name,value:metric==='damage'?Math.max(0,Number(m.damage)||0):0}));
  const byName=new Map(rows.map(r=>[r.name,r]));
  if(metric!=='damage')for(const event of run.heals||[]){
   const name=event.caster||'시전자 미확인';
   if(!byName.has(name)){const row={name,value:0};rows.push(row);byName.set(name,row)}
   byName.get(name).value+=Math.max(0,Number(event[metric])||0);
  }
  const total=rows.reduce((sum,r)=>sum+r.value,0);
  return {total,rows:rows.map(r=>({...r,share:total?r.value/total*100:0}))};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={contributions};
 if(typeof document==='undefined')return;

 let chartMetric='damage',chartResult=null;
 function amount(n){return n>=1e8?(n/1e8).toFixed(2)+'억':n>=1e4?(n/1e4).toFixed(1)+'만':num(n)}
 const section=document.createElement('section');section.className='panel contribution-panel';section.id='contributionPanel';
 section.innerHTML='<div class="contribution-heading"><h2>캐릭터별 딜·힐 지분</h2><div class="contribution-tabs" role="group" aria-label="지분 그래프 종류"><button type="button" data-contribution="damage" aria-pressed="true">딜 지분</button><button type="button" data-contribution="effective" aria-pressed="false">유효 힐 지분</button><button type="button" data-contribution="overheal" aria-pressed="false">초과 힐 지분</button></div></div><p id="contributionNote" class="note"></p><div id="contributionCharts" class="contribution-charts"></div>';
 $('stats').closest('section').after(section);
 const context=document.createElement('div');context.className='run-context';context.id='runContext';$('stats').before(context);

 function drawContributions(){
  if(!chartResult)return;
  const title={damage:'딜',effective:'유효 힐',overheal:'초과 힐'}[chartMetric];
  const note={damage:'각 편성의 총 대미지 중 캐릭터가 직접 낸 비율입니다. 공격 버프로 늘어난 아군의 딜은 버프 시전자 지분으로 따로 집계하지 않습니다.',effective:'직접 회복으로 실제 채운 체력을 시전자별로 합산합니다. 초과 회복·최대 체력 증가·보호막·흡혈은 제외합니다.',overheal:'직접 회복 중 체력이 가득 차 적용되지 못한 양입니다. 실제 생존 기여를 뜻하지 않습니다.'}[chartMetric];
  $('contributionNote').textContent=note+' 막대는 A/B 모두 0~100% 기준이며, 총량은 별도로 비교하세요.';
  document.querySelectorAll('[data-contribution]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.contribution===chartMetric)));
  $('contributionCharts').innerHTML=[chartResult.baseline,chartResult.prototype].map((run,i)=>{
   const data=contributions(run,chartMetric);
   return `<div class="contribution-team"><div class="contribution-team-heading"><h3>${i?'B · 비교 편성':'A · 기준 편성'}</h3><span>총 ${title} <b>${esc(amount(data.total))}</b></span></div>${data.total===0?`<p class="contribution-empty">${chartMetric==='damage'?'기록된 대미지가 없습니다.':chartMetric==='effective'?'기록된 유효 직접 회복이 없습니다.':'기록된 초과 직접 회복이 없습니다.'}</p>`:''}<div class="contribution-axis"><span>0%</span><span>50%</span><span>100%</span></div>${data.rows.map((row,j)=>{
    const trial=!!run.display_names?.[row.name],name=display(run,row.name),url=trial?null:charByName(row.name)?.portrait;
    return `<div class="contribution-row"><div class="contribution-character">${url?`<img src="${esc(url)}" alt="" loading="lazy" width="34" height="34">`:`<span class="contribution-avatar">${trial?'시험':'·'}</span>`}<span>${esc(name)}</span></div><div class="contribution-meter" role="img" aria-label="${esc(name)} ${title} ${num(row.value)}, 지분 ${row.share.toFixed(1)}%"><div class="contribution-track"><span style="width:${row.share}%;background:${colors[j%colors.length]}"></span></div><div class="contribution-value"><span>${esc(amount(row.value))}</span><b>${row.share.toFixed(1)}%</b></div></div></div>`;
   }).join('')}</div>`;
  }).join('');
 }
 section.addEventListener('click',e=>{const b=e.target.closest('[data-contribution]');if(b){chartMetric=b.dataset.contribution;drawContributions()}});

 function drawRunContext(r){
  const chars=[...(r.baseline.resolved_squad||[]),...(r.prototype.resolved_squad||[])];
  const levels=[...new Set(chars.map(c=>c.level).filter(n=>n!=null))];
  const skills=[...new Set(chars.map(c=>c.skill_levels?[1,2,3].map(n=>c.skill_levels[n]).join('/'):'미확인'))];
  const p=r.settings,b=r.boss_reference||catalog.bosses?.find(b=>b.id===p.boss_source),enemy=r.baseline.boss||{};
  let label,detail;
  if(p.boss==='spider'){
   label='S40 사치스러운 거미 · 패턴 근사 모델';
   detail='보스 Lv400 스탯과 영상 기반 패턴을 적용합니다. 일부 저지·좌표·소환 수치는 추정값이며 실제 전투와 차이가 있습니다.';
  }else if(p.boss==='library'&&b){
   label=`S${b.raid} ${b.name} · 자료 공격 시험 / 실전 미검증`;
   detail=`보스 Lv${b.level} 스탯·공격 자료를 적용합니다. 공격 순서·주기는 가정값이며 요격 가능 공격도 전부 피격합니다. 저지·파츠·소환 등 미구현 기믹은 제외합니다.`;
   $('resultTag').textContent=label;
  }else if(b){
   label=`S${b.raid} ${b.name} · ${p.boss==='dummy'?'자료 스탯 / 무피격':'자료 기반 공격 시험'}`;
   detail=`가져온 자료는 보스 Lv${b.level} 모의전 기준입니다. ${p.boss==='dummy'?'보스는 공격하지 않습니다.':'공격 순서·주기는 직접 설정한 시험값입니다.'} 파츠·코어·특수 기믹·전투 중 레벨 상승은 재현하지 않습니다.`;
  }else{
   label=p.boss==='dummy'?'직접 설정 · 무피격 비교':'가상 보스 · 반복 공격 시험';
   detail='직접 입력한 공격력·방어력·속성으로 계산합니다. 특정 실전 보스를 그대로 재현한 결과가 아닙니다.';
  }
  const incoming=[r.baseline,r.prototype].map((run,i)=>{const hits=run.squad_hits||[];return `${i?'B':'A'} 피격 ${hits.length}건 · 체력 피해 ${amount(hits.reduce((v,h)=>v+(h.hp||0),0))}`}).join(' / ');
  const randomNote=document.createElement('p');randomNote.className='note';randomNote.id='randomResultNote';
  randomNote.textContent=p.rng_mode==='random'?`확률 적용 · 1회 결과 · A/B 공통 난수 번호 ${p.seed}. 같은 번호로 재현할 수 있습니다. 편성별 추첨 순서는 달라질 수 있으므로 여러 번호의 결과를 함께 비교하세요.`:'평균값 비교 · 치명타·코어·확률 발동을 평균화한 근사 결과입니다. 무작위 피격 대상도 고정되므로 생존 편차를 보여주지 않습니다.';
  $('runContext').innerHTML=`<div class="run-spec-chips"><span>니케 <b>${levels.length?'Lv'+levels.join(' / Lv'):'레벨 미확인'}</b></span><span>스킬 <b>${esc(skills.join(' · ')||'미확인')}</b></span><span>전투 <b>${p.duration}초</b></span></div><strong>${esc(label)}</strong><p>${esc(detail)}</p><p><b>${esc(incoming)}</b></p>${!(r.baseline.squad_hits||[]).length&&!(r.prototype.squad_hits||[]).length?'<p class="warn">피격 기록이 없습니다. 이 결과로 회복의 필요성을 판단할 수 없습니다.</p>':''}<small>계산에 적용된 보스: 공격력 ${num(enemy.atk??p.atk)} · 방어력 ${num(enemy.def??p.def)} · ${esc(enemy.code??p.code)}</small>`;
  $('runContext').append(randomNote);
  if(p.boss!=='dummy'){
   const validity=document.createElement('p');validity.className='warn';
   validity.textContent=r.incoming_validation?.message||'보스 피격량은 실전 미검증입니다. 이 결과의 생존 여부·회복량으로 힐 필요성을 판단할 수 없습니다.';
   $('runContext').append(validity);
  }
 }
 const renderBeforeContributions=render;
 render=function(r){renderBeforeContributions(r);chartResult=r;drawRunContext(r);drawContributions()};
 if(lastResult){chartResult=lastResult;drawRunContext(lastResult);drawContributions()}
})();

