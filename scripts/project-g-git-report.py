from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[1]
repo = 'C:/Users/user/ProjectG'
def git(*args):
    return subprocess.check_output(['git', '-c', 'safe.directory='+repo, '-C', repo, *args], encoding='utf-8')
head = git('rev-parse', 'HEAD').strip()
branch = git('branch', '--show-current').strip()
records = git('log', 'HEAD', '--author=^Jnhide <eohsik@gmail.com>$', '--format=%H|%ad|%s', '--date=short', '--no-merges').strip().splitlines()
merges = git('log', 'HEAD', '--author=^Jnhide <eohsik@gmail.com>$', '--format=%H|%ad|%s', '--date=short', '--merges').strip().splitlines()
out = ['## 집계 기준', f'- 저장소: [ProjectG](https://github.com/ghyourme/ProjectG)', f'- 확인 브랜치: `{branch}`', f'- 기준 커밋: `{head}`', '- 작성자: Jnhide (Git author 기준)', f'- 일반 커밋: {len(records)}개', f'- 병합 커밋: {len(merges)}개 (수정 내역에서 별도 분리)', '- 아래 설명은 커밋 메시지 원문이며, 파일 목록은 각 커밋의 실제 변경 내역이다.', '- 커밋 기록은 작업 근거이며 전체 코드의 단독 작성 여부나 현재 버그 해결 상태를 뜻하지 않는다.', '', '## 커밋·수정 내역']
for record in records:
    sha, date, title = record.split('|', 2)
    files = git('diff-tree', '--no-commit-id', '--name-status', '-r', sha).strip().splitlines()
    out += ['', f'### {date} · {title}', f'커밋 {sha[:7]}', '']
    for line in files:
        status, path = line.split('\t', 1)
        out.append(f'- `{status}` · `{path}`')
out += ['', '## 병합 기록']
for record in merges:
    sha, date, title = record.split('|', 2)
    out.append(f'- {date} · {sha[:7]} · {title}')
out += ['', 'A: 추가 · M: 수정 · D: 삭제 · R: 이름/경로 변경', '']
target = root / 'dist/files/project-g/project-g-development.md'
target.write_text('\n'.join(out), encoding='utf-8')
print(f'{len(records)} commits, {len(merges)} merges; report: {target.name}')
