"""Package the local simulator for static hosting, using an explicit public-file allowlist."""
from pathlib import Path
import hashlib
import json
import shutil
import sys
import zipfile

SITE = Path(__file__).resolve().parents[1]
SOURCE = SITE.parent / 'research/leona-simulator'
APP = SOURCE / 'app'
OUT = SITE / 'dist/tools/nikke'
OUT.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(APP))
import worker, loadout, boss_catalog

catalog = loadout.catalog()
catalog['bosses'] = boss_catalog.catalog()
portraits = json.loads((APP / 'portraits.json').read_text(encoding='utf-8'))
for char in catalog['characters']:
    portrait = portraits.get(char['name'])
    char['portrait'] = '.' + portrait if portrait else None
for name, obj in [('catalog.json', catalog), ('defaults.json', worker.DEFAULTS)]:
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False), encoding='utf-8')
for name in ['ux.css', 'ux.js', 'bosses.js', 'contributions.js', 'designs.js', 'cores.js']:
    text = (APP / name).read_text(encoding='utf-8')
    text = text.replace('결과 저장 완료', '계산 완료 · 결과 내보내기로 내려받기')
    (OUT / name).write_text(text, encoding='utf-8')
shutil.copytree(APP / 'portraits', OUT / 'portraits', dirs_exist_ok=True)
shutil.copyfile(SOURCE / 'nikke-calc/LICENSE', OUT / 'LICENSE.txt')
html = (APP / 'index.html').read_text(encoding='utf-8')
for name in ['ux.css', 'ux.js', 'bosses.js', 'contributions.js', 'designs.js', 'cores.js']:
    html = html.replace('"/' + name + '"', '"./' + name + '"')
html = html.replace('href="/license"', 'href="./LICENSE.txt"')
html = html.replace('실행 결과와 도출 조건은 이 컴퓨터의 research/leona-simulator/runs에 저장됩니다.',
    '계산은 이 브라우저 안에서 실행됩니다. 결과는 ‘결과 내보내기’으로 내려받으세요. 캐릭터 이미지 © SHIFT UP.')
html = html.replace('</head>', '<link rel="stylesheet" href="./web.css"><script src="./browser-api.js"></script></head>')
html = html.replace('<body>', '<body><nav class="portfolio-return"><a href="../../#/tools">← 도구 목록</a><span>JNHIDE · NIKKE 편성 실험실</span></nav><div class="browser-runtime"><span id="runtimeStatus" role="status">설정을 선택하고 비교를 실행하세요. 첫 실행 시 계산기를 불러옵니다.</span><button id="cancelCalculation" hidden>계산 취소</button></div>')
html = html.replace('서버 연결 또는 캐릭터 목록을 확인할 수 없습니다.', '캐릭터 자료를 불러오지 못했습니다. 새로고침해 주세요.')
(OUT / 'index.html').write_text(html, encoding='utf-8')

files = [APP / n for n in ['worker.py', 'loadout.py', 'leona_circus.py', 'boss_catalog.py', 'boss_core.py']]
files += sorted((APP / 'boss-data').glob('*.json'))
files += [SOURCE / 'design/leona-circus-approved-20261102.json']
engine = SOURCE / 'nikke-calc'
for folder, pattern in [('calculator', '*.py'), ('runner', '*.py'), ('data', '*.json')]:
    files += sorted((engine / folder).rglob(pattern))
files += [engine / 'LICENSE']
with zipfile.ZipFile(OUT / 'engine.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in files:
        archive.write(file, file.relative_to(SOURCE).as_posix())
manifest = {'engine_commit': '23164e4a88fe46af609cc99b0de38a98313a5f4d',
    'files': {f.relative_to(SOURCE).as_posix(): hashlib.sha256(f.read_bytes()).hexdigest() for f in files}}
(OUT / 'engine-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(f'Packaged {len(files)} runtime files; {len(catalog["characters"])} characters; engine.zip {(OUT / "engine.zip").stat().st_size:,} bytes')
