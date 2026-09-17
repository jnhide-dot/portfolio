"""Read authorized handover sources into an ignored, local render intermediate."""
import csv
import hashlib
import json
import sys
from pathlib import Path

source = Path(sys.argv[1])
scratch = Path('.sites-runtime/project-md-previews')
scratch.mkdir(parents=True, exist_ok=True)
items = []
for folder, category, ext in [('개발가이드', '개발가이드', '*.md'), ('코딩 설계도', '코딩 설계도', '*.md'), ('CSV(데이터_테이블)모음집', 'CSV', '*.csv'), ('', '인계 안내', '*.md')]:
    for file in sorted((source / folder).glob(ext)):
        relative = file.relative_to(source).as_posix()
        item = dict(id='md-' + hashlib.sha256(relative.encode()).hexdigest()[:12], title=file.name, category=category)
        text = file.read_text(encoding='utf-8-sig')
        if file.suffix == '.csv':
            # csv.reader keeps quoted multiline fields and literal string values.
            with file.open(encoding='utf-8-sig', newline='') as handle:
                item['rows'] = list(csv.reader(handle))
        else:
            item['markdown'] = text
        items.append(item)
(scratch / 'sources.json').write_text(json.dumps(items, ensure_ascii=False), encoding='utf-8')
print(f'Prepared {len(items)} sources in ignored local scratch directory')
