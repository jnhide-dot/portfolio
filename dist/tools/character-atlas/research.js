window.ATLAS_READY.then(() => {
  'use strict';
  const DB = window.ATLAS;
  const $ = selector => document.querySelector(selector);
  const content = $('#research-content');
  const pagination = $('#research-pagination');
  const query = $('#research-query');
  const SIZE = 30;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const array = value => Array.isArray(value) ? value : value == null ? [] : [value];
  const text = value => typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
  const fmt = value => Number(value || 0).toLocaleString('ko-KR');
  const safeUrl = value => {
    if (typeof value !== 'string' || !value.trim()) return '';
    try { const url = new URL(value,location.href); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
    catch { return ''; }
  };
  const link = (url, label) => {
    const safe = safeUrl(url);
    return safe ? '<a href="' + esc(safe) + '" target="_blank" rel="noopener noreferrer">' + esc(label || safe) + ' ↗</a>' : '<span>' + esc(label || '주소 미등록') + '</span>';
  };
  const name = character => character.nameKorean || character.name || character.id;
  const workName = work => DB.labels?.works?.[work] || work;
  const workLabel = work => workName(work.name || work.work || work.title || work.id || '제목 미상');
  const all = array(DB.characters);
  const byId = new Map(all.map(c => [c.id, c]));
  const mainHref = 'index.html';
  const sectionNames = {sources:'캐릭터 출처', anime:'애니 작품 원장', game:'게임 작품 원장', taxonomy:'속성 사전 출처', reports:'수집·검토 기록'};
  const coverageNames = {nonCharacters:'캐릭터가 아닌 문서 제외 기록',guardianRoster:'가디언테일즈 수록 영웅·보관 유닛',guardianImages:'가디언테일즈 기본 일러스트 정리',nameLocalization:'한국어 캐릭터 이름 보완 기록',imageQuality:'이미지 해상도 개선 기록',anime:'애니 수집 범위', game:'초기 게임 수집 범위', gameSupplement:'초기 게임 보완 기록', taxonomy:'속성 분류 근거', corpus:'초기 데이터 구조 점검', imageAudit:'기존 이미지 기술 표본 점검', enrichment:'속성 서술 해석 기록', integration:'통합 데이터 구조 검사', mobileGames:'모바일 게임 수집 범위', animeIndependent:'기존 애니 원장 대조', animeSupplement:'MAL 애니 출연진 보완', gameOriginExclusions:'게임 원작 기준 제외 기록', localization:'한국어 이름·작품명 표기 정책', additionalReview:'추가 교차검증 생략 안내'};
  const reports = [
    {id:'meta', title:'데이터 기준과 버전', kind:'기본 정보', data:DB.meta || {}},
    ...Object.entries(DB.coverage || {}).map(([key, data]) => ({id:'coverage-' + key, title:coverageNames[key] || data?.title || key, kind:'수집·범위 기록', data})),
    ...array(DB.reviews).map((data, i) => ({id:'review-' + i, title:data.title || '기존 검토 기록 ' + (i + 1), kind:'기존 검토 기록', data})),
    {id:'excluded-anime', title:'애니 캐릭터 제외·보류 원장', kind:'범위 기록', data:array(DB.excludedAnimeCharacters)},
    {id:'excluded-game', title:'게임 제외·범위 변경 원장', kind:'범위 기록', data:array(DB.excludedGames)}
  ];
  const reviewIndex = new Map();
  array(DB.reviews).forEach(report => array(report.records).forEach(record => {
    const id = record.id || record.characterId;
    if (!id) return;
    if (!reviewIndex.has(id)) reviewIndex.set(id, []);
    reviewIndex.get(id).push({report, record});
  }));
  const sourceSearch = new Map(all.map(c => [c.id, [c.id, name(c), c.name, c.nameOriginal, ...array(c.aliases), ...array(c.searchTerms), ...array(c.works), ...array(c.works).map(workName), ...array(c.sources).map(s => [s.title, s.url].join(' '))].join(' ').toLocaleLowerCase()]));
  const state = {section:'sources', query:'', page:1, character:null};
  let filteredRows = [], lazyItems = new Map(), lazyId = 0, searchTimer;
  content.setAttribute('aria-live', 'polite');

  function list(values) {
    const rows = array(values).filter(value => value != null && value !== '');
    return rows.length ? '<ul>' + rows.map(value => '<li>' + esc(text(value)) + '</li>').join('') + '</ul>' : '';
  }
  function field(label, value) {
    return value == null || value === '' ? '' : '<dt>' + esc(label) + '</dt><dd>' + esc(text(value)) + '</dd>';
  }
  function sources(values) {
    const items = array(values).map(item => typeof item === 'string' ? {url:item} : item).filter(Boolean);
    return items.length ? '<ul class="sources">' + items.map(item => '<li>' + link(item.url || item.sourceUrl, item.title || item.name || item.url || item.sourceUrl) + (item.supports ? '<small>기록 대상: ' + esc(text(item.supports)) + '</small>' : '') + (item.evidence ? '<small>' + esc(text(item.evidence)) + '</small>' : '') + (item.accessedAt || item.observedAt ? '<small>열람·관측: ' + esc(item.accessedAt || item.observedAt) + '</small>' : '') + '</li>').join('') + '</ul>' : '<p>등록된 출처가 없습니다.</p>';
  }
  function lazy(title, value, filename) {
    const id = String(++lazyId);
    lazyItems.set(id, {value, filename});
    return '<details data-lazy="' + id + '"><summary>' + esc(title) + '</summary><div data-lazy-body></div></details>';
  }
  function actions(detail) {
    return '<div class="data-actions">' + (detail ? '<button data-export="character">이 캐릭터 공개 기록 JSON</button>' : '<button data-export="filtered">현재 검색 결과 JSON</button>') + '<button data-export="all">전체 데이터 JSON · 이미지 포함</button></div>';
  }
  function characterLink(id, label) {
    const params = new URLSearchParams({character:id});
    return '<a href="#' + esc(params.toString()) + '">' + esc(label || name(byId.get(id) || {id})) + '</a>';
  }
  function characterRows(rows) {
    return '<div class="table-wrap"><table class="records"><thead><tr><th>이름·원문</th><th>작품</th><th>수집 출처</th><th>기록 상태</th></tr></thead><tbody>' + rows.map(c => '<tr><td>' + characterLink(c.id, name(c)) + '<br><small>' + esc(c.nameOriginal || c.name) + '</small></td><td>' + esc(array(c.works).slice(0, 3).map(workName).join(' · ')) + (array(c.works).length > 3 ? '<br><small>외 ' + fmt(c.works.length - 3) + '작품</small>' : '') + '</td><td>' + esc(c.media === 'anime' ? '애니' : '게임') + ' · 출처 ' + fmt(array(c.sources).length) + '개</td><td>' + esc(c.verification?.status || '별도 상태 미등록') + (reviewIndex.has(c.id) ? '<br><small>기존 검토 기록 ' + fmt(reviewIndex.get(c.id).length) + '개</small>' : '') + '</td></tr>').join('') + '</tbody></table></div>';
  }
  function characterDetail(c) {
    const reviews = reviewIndex.get(c.id) || [];
    const original = [...new Set([c.name, c.nameOriginal].filter(Boolean))];
    const imageUrl = safeUrl(c.imageUrl);
    const tags = array(c.tags);
    const duplicates = array(c.potentialDuplicateIds);
    return '<article class="source-card"><button data-back>← 출처 목록</button><h2>' + esc(name(c)) + '</h2><p>' + esc(array(c.works).map(workName).join(' · ')) + '</p><p><a href="' + esc(mainHref) + '#' + (c.media === 'game' ? 'game' : 'anime') + '">캐릭터 도감으로 →</a></p>' + actions(true) + '<div class="detail-info"><dl>' + field('레코드 ID', c.id) + field('원문 이름', original.join(' / ')) + field('별칭', array(c.aliases).join(' · ')) + field('한국어 표기', c.localizationStatus) + field('성별', c.gender) + field('기록 단위', c.recordKind || c.recordType) + field('이름·정체성 처리', c.identityResolution) + field('관측 분기', array(c.periods).join(' · ')) + field('분기 기준', c.periodBasis) + '</dl></div><h3>이미지 출처</h3>' + (imageUrl ? '<p>' + link(imageUrl, '현재 이미지 주소') + '</p>' : '<p>이미지 주소가 등록되지 않았습니다.</p>') + sources(c.imageSourceUrl ? [{url:c.imageSourceUrl, title:'이미지를 가져온 출처 페이지'}] : []) + (c.originalImageUrl ? '<p>' + link(c.originalImageUrl, '이전 썸네일 · 로드 실패 시 대체 이미지') + '</p>' : '') + (c.sourceImageUrl ? '<p>' + link(c.sourceImageUrl, '처음 수집한 이미지 주소') + '</p>' : '') + (c.imageDerivation ? '<p>' + esc(text(c.imageDerivation)) + '</p>' : '') + '<h3>모에속성 근거</h3>' + (tags.length ? tags.map(tag => typeof tag === 'string' ? '<div class="detail-tag"><b>' + esc(tag) + '</b><p>개별 근거 미등록</p></div>' : '<div class="detail-tag"><b>' + esc(tag.name) + '</b><small>' + esc(tag.status || '검토 필요') + '</small><p>' + esc(tag.category || '') + '</p><p>' + esc(text(tag.evidence) || '개별 근거 미등록') + '</p>' + (tag.sourceUrl ? link(tag.sourceUrl, '속성 근거 출처') : '') + (tag.reviewer ? '<p>기록자: ' + esc(tag.reviewer) + '</p>' : '') + '</div>').join('') : '<p>등록된 속성이 없습니다. 속성이 없다는 판정은 아닙니다.</p>') + '<h3>수집 출처</h3>' + sources(c.sources) + '<h3>기록 상태와 한계</h3><p>' + esc(c.verification?.status || '별도 상태 미등록') + '</p>' + list(c.verification?.notes) + (c.notes ? '<p>' + esc(text(c.notes)) + '</p>' : '') + (duplicates.length ? '<div class="notice">동일 인물일 수 있는 다른 레코드 ' + fmt(duplicates.length) + '개가 남아 있습니다. 확정 병합하지 않았습니다.</div>' + lazy('중복 후보 ID 보기', duplicates, c.id + '-duplicate-candidates.json') : '') + '<h3>기존 검토 기록</h3><p>아래 기록에서 확인한 항목과 범위를 읽어 주세요. 모든 사실·이미지·속성에 대한 검증 완료를 뜻하지 않습니다.</p>' + (reviews.length ? reviews.map(({report, record}) => '<div class="report-card"><b>' + esc(report.title || '검토 기록') + '</b><p>' + esc(record.status || '') + ' · ' + esc(record.reviewer || report.reviewer || '기록자 미등록') + '</p>' + list(record.checks) + list(record.notes) + sources(record.sources) + lazy('해당 검토의 원본 기록', {title:report.title, methodology:report.methodology || report.method, scope:report.scope, limitations:report.limitations, record}, c.id + '-review.json') + '</div>').join('') : '<p>이 레코드에 연결된 별도 검토 기록이 없습니다.</p>') + lazy('출연 작품·분기 근거', {works:c.works, workPeriods:c.workPeriods, workPeriodBasis:c.workPeriodBasis, workDetails:c.workDetails, appearances:c.appearances}, c.id + '-works.json') + lazy('캐릭터 공개 기록 전체 필드', c, c.id + '.json') + '</article>';
  }
  function workRows(rows, section) {
    return rows.map(w => {
      const title = workLabel(w);
      const rawTitle = w.name || w.work || w.title || '';
      const count = section === 'anime' ? w.includedCharacters : w.records;
      const raw = w.rawCoverage || {};
      const status = w.excludedReason ? '대상 제외·보류: ' + w.excludedReason : section === 'anime' ? w.castComplete === true ? '출처 출연진 수집 완료' : w.castComplete === false ? '출처 출연진 수집 미완료' : '완료 여부 미등록' : w.status || '상태 미등록';
      return '<article class="source-card"><h2>' + esc(title) + '</h2>' + (title !== rawTitle || w.nameOriginal ? '<p>' + esc([rawTitle, w.nameOriginal].filter(Boolean).join(' / ')) + '</p>' : '') + '<p>' + esc([w.period, w.format, count != null ? fmt(count) + '개 수록 레코드' : null, w.images != null ? fmt(w.images) + '개 이미지 주소' : null].filter(Boolean).join(' · ')) + '</p><p>' + esc(status) + '</p>' + (w.note || raw.scope ? '<p>' + esc(w.note || raw.scope) + '</p>' : '') + sources([{url:w.sourceUrl || raw.sourceUrl, title:'작품·명단 출처'}, ...(w.castSourceUrl ? [{url:w.castSourceUrl, title:'출연진 명단'}] : [])].filter(s => s.url)) + list(raw.limitations) + lazy('이 작품의 원장 원본', w, 'work-' + (w.id || w.key || rawTitle) + '.json') + '</article>';
    }).join('');
  }
  function taxonomyRows(rows) {
    return rows.map(term => '<article class="source-card"><h2>' + esc(term.name) + '</h2><p>' + esc(term.category) + (array(term.aliases).length ? ' · ' + esc(term.aliases.join(' / ')) : '') + '</p><p>' + esc(term.description) + '</p><h3>부여 기준</h3><p>' + esc(term.assignmentRule || '개별 기준 미등록') + '</p><h3>분류 출처</h3><p>' + esc(term.sourceStatus || '확인 상태 미등록') + '</p>' + (term.sourceUrl ? '<p>' + link(term.sourceUrl, '분류 참고 문서') + '</p>' : '') + lazy('속성 원본 필드', term, 'taxonomy-' + term.id + '.json') + '</article>').join('');
  }
  function reportRows(rows) {
    return rows.map(report => {
      const data = report.data || {};
      const notes = [data.snapshotNote, data.status, data.scope, data.methodology || data.method, ...array(data.limitations || data.limits || data.caveats)].filter(Boolean);
      const count = Array.isArray(data) ? data.length : Array.isArray(data.records) ? data.records.length : null;
      return '<article class="report-card"><h2>' + esc(report.title) + '</h2><p>' + esc([report.kind, data.date || data.asOf || data.checkedAt || data.accessedAt, data.reviewer || data.researcher, count != null ? fmt(count) + '개 기록' : null].filter(Boolean).join(' · ')) + '</p>' + list(notes) + lazy('보고서 원본 펼치기', data, report.id + '.json') + '</article>';
    }).join('');
  }
  function searchRows() {
    const terms = state.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matches = value => terms.every(term => value.includes(term));
    if (state.section === 'sources') return all.filter(c => matches(sourceSearch.get(c.id)));
    if (state.section === 'anime' || state.section === 'game') return array(state.section === 'anime' ? DB.animeWorks : DB.gameWorks).filter(w => matches([workLabel(w), w.id, w.malId, w.name, w.nameOriginal, w.romaji, w.work, w.title, ...array(w.synonyms), ...array(w.workAliases), w.period, w.format, w.sourceUrl, w.status, w.excludedReason, w.note].join(' ').toLocaleLowerCase()));
    if (state.section === 'taxonomy') return array(DB.taxonomy).filter(t => matches([t.id, t.name, t.category, t.description, t.sourceUrl, t.sourceStatus, ...array(t.aliases)].join(' ').toLocaleLowerCase()));
    return reports.filter(r => matches([r.title, r.kind, r.data?.reviewer, r.data?.researcher, text(r.data?.scope), text(r.data?.methodology || r.data?.method), text(r.data?.limitations), r.data?.status].join(' ').toLocaleLowerCase()));
  }
  function updateHash() {
    const params = new URLSearchParams({section:state.section});
    if (state.query) params.set('q', state.query);
    if (state.page > 1) params.set('page', String(state.page));
    if (state.character) params.set('character', state.character);
    history.replaceState(null, '', '#' + params.toString());
  }
  function render() {
    lazyItems = new Map();
    lazyId = 0;
    document.querySelectorAll('#research-tabs button').forEach(button => {
      const active = button.dataset.section === state.section;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
    query.value = state.query;
    query.placeholder = {sources:'캐릭터·작품·출처 검색', anime:'애니 제목·분기·작품 ID 검색', game:'게임 제목·출처 검색', taxonomy:'속성·분류·출처 검색', reports:'보고서 제목·범위·기록자 검색'}[state.section];
    if (state.character) {
      const c = byId.get(state.character);
      content.innerHTML = c ? characterDetail(c) : '<div class="empty">해당 캐릭터 레코드를 찾을 수 없습니다.<br><button data-back>출처 목록으로</button></div>';
      pagination.innerHTML = '';
      document.title = (c ? name(c) + ' 출처' : '레코드 없음') + ' · 캐릭터 아틀라스';
      return;
    }
    filteredRows = searchRows();
    const pages = Math.max(1, Math.ceil(filteredRows.length / SIZE));
    state.page = Math.min(pages, Math.max(1, state.page));
    const rows = filteredRows.slice((state.page - 1) * SIZE, state.page * SIZE);
    const notes = {sources:'캐릭터·카드·폼 등 수집 레코드 단위입니다. 원문과 한국어 보조 이름을 함께 검색합니다.', anime:'출처의 작품·출연진 수집 범위를 기록합니다. 출연진 명단이 비어 있는 작품도 원장에 남습니다.', game:'출처 목록을 수집한 범위입니다. 동일 인물의 카드·폼과 조사 미완료 작품이 포함될 수 있습니다.', taxonomy:'참고 문서의 분류와 편집한 설명·부여 기준을 구분합니다. 개별 캐릭터의 속성 확정 여부는 캐릭터 출처에서 확인하세요.', reports:'이미 작성된 수집·검토 기록입니다. 추가 교차검증은 사용자 요청에 따라 생략했습니다. 큰 보고서의 원문은 펼칠 때 표시합니다.'};
    content.innerHTML = '<section class="section-banner"><b>' + esc(sectionNames[state.section]) + ' · ' + fmt(filteredRows.length) + '개</b><p>' + esc(notes[state.section]) + '</p></section>' + actions(false) + (rows.length ? state.section === 'sources' ? characterRows(rows) : state.section === 'anime' || state.section === 'game' ? workRows(rows, state.section) : state.section === 'taxonomy' ? taxonomyRows(rows) : reportRows(rows) : '<div class="empty">검색 결과가 없습니다. 검색어를 바꿔 보세요.</div>');
    pagination.innerHTML = '<button data-page="' + (state.page - 1) + '" ' + (state.page === 1 ? 'disabled' : '') + '>← 이전</button><span>' + fmt(state.page) + ' / ' + fmt(pages) + '</span><button data-page="' + (state.page + 1) + '" ' + (state.page === pages ? 'disabled' : '') + '>다음 →</button>';
    document.title = sectionNames[state.section] + ' · 캐릭터 아틀라스';
  }
  function readHash() {
    clearTimeout(searchTimer);
    const hash = location.hash.slice(1);
    const params = new URLSearchParams(hash.includes('=') ? hash : 'section=' + hash);
    const section = params.get('section');
    state.section = Object.hasOwn(sectionNames, section) ? section : 'sources';
    state.character = params.get('character') || null;
    if (state.character) state.section = 'sources';
    state.query = params.get('q') || '';
    const page = Number(params.get('page'));
    state.page = Number.isSafeInteger(page) && page > 0 ? page : 1;
    render();
  }
  function download(value, filename) { return window.ATLAS_EXPORT(value, filename); }
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.section && Object.hasOwn(sectionNames, button.dataset.section)) {
      clearTimeout(searchTimer);
      Object.assign(state, {section:button.dataset.section, query:'', page:1, character:null});
      updateHash(); render();
    } else if (button.hasAttribute('data-back')) {
      state.character = null; updateHash(); render();
    } else if (button.dataset.page) {
      const page = Number(button.dataset.page);
      if (Number.isSafeInteger(page) && page > 0) { state.page = page; render(); updateHash(); content.scrollIntoView({behavior:'smooth', block:'start'}); }
    } else if (button.dataset.export === 'all') {
      download(DB, 'character-atlas.json');
    } else if (button.dataset.export === 'character' && byId.has(state.character)) {
      download(byId.get(state.character), state.character + '.json');
    } else if (button.dataset.export === 'filtered') {
      const rows = searchRows();
      download({exportedAt:new Date().toISOString(), dataAsOf:DB.meta?.asOf, section:state.section, query:state.query, count:rows.length, records:state.section === 'reports' ? rows.map(r => ({title:r.title, data:r.data})) : rows}, 'atlas-' + state.section + '-results.json');
    } else if (button.dataset.downloadLazy) {
      const item = lazyItems.get(button.dataset.downloadLazy);
      if (item) download(item.value, item.filename);
    }
  });
  content.addEventListener('toggle', event => {
    const details = event.target;
    if (details.tagName !== 'DETAILS' || !details.open || !details.dataset.lazy || details.dataset.loaded) return;
    const item = lazyItems.get(details.dataset.lazy);
    if (!item) return;
    const body = details.querySelector('[data-lazy-body]');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.downloadLazy = details.dataset.lazy;
    button.textContent = '이 기록 JSON 내려받기';
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(item.value, null, 2) ?? '등록된 데이터가 없습니다.';
    body.append(button, pre);
    details.dataset.loaded = 'true';
  }, true);
  query.addEventListener('input', () => {
    state.query = query.value;
    state.page = 1;
    state.character = null;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { updateHash(); render(); }, 160);
  });
  window.addEventListener('hashchange', readHash);
  readHash();
}).catch(error => {
  const content = document.querySelector('#research-content');
  if (content) content.textContent = '자료를 열지 못했습니다: ' + (error?.message || String(error));
  console.error(error);
});
