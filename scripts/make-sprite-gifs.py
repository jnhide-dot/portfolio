from pathlib import Path
from PIL import Image
import re
import sys

root = Path(__file__).resolve().parents[1]
folder = root / 'dist/files/project-g'
jobs = [(f'project-g-alice-{i}', 8) for i in (3, 4, 5)]
jobs += [(f'project-g-aaron-{i}', 8) for i in (2, 3, 4, 5)]
jobs += [(f'project-g-luna-{i}', 8) for i in range(2, 9)]
jobs += [('project-g-alice-death', 8)]
monster_jobs = [(f'project-g-monster-{kind}-{i}', 8)
                for kind, total in [('knight', 4), ('archer', 4), ('wizard', 4), ('boss', 7), ('merchant', 4)]
                for i in range(1, total + 1)]
jobs = monster_jobs if '--monsters-only' in sys.argv else jobs + monster_jobs
for name, count in jobs:
    source = folder / (name + '.png')
    if name == 'project-g-alice-death':
        source = Path('C:/Users/user/ProjectG/Assets/04.Images/Alice/Alice_death.png')
    sheet = Image.open(source).convert('RGBA')
    size = sheet.height
    frames = []
    for i in range(count):
        frame = sheet.crop((i*size, 0, (i+1)*size, size))
        # A fixed canvas and disposal prevent trails between transparent frames.
        frame.thumbnail((320, 320), Image.Resampling.LANCZOS)
        alpha = frame.getchannel('A')
        indexed = frame.convert('RGB').quantize(colors=255)
        indexed.paste(255, mask=alpha.point(lambda a: 255 if a < 128 else 0))
        indexed.info['transparency'] = 255
        frames.append(indexed)
    durations = [100] * count
    if name.endswith('death') or name in ('project-g-aaron-5', 'project-g-luna-6', 'project-g-monster-knight-4', 'project-g-monster-archer-4', 'project-g-monster-wizard-4', 'project-g-monster-boss-7', 'project-g-monster-merchant-4'):
        durations[-1] = 900
    frames[0].save(folder / (name+'.gif'), save_all=True, append_images=frames[1:], duration=durations, loop=0, disposal=2, transparency=255, optimize=False)
    for doc in folder.glob('*.md'):
        text = doc.read_text(encoding='utf-8')
        updated = text.replace(name+'.png', name+'.gif')
        if updated != text:
            doc.write_text(updated, encoding='utf-8')
    print(name, count)
alice = folder / 'project-g-alice.md'
text = alice.read_text(encoding='utf-8')
text = re.sub(r'!\[\]\(file://[\s\S]*?%7D%7D\)', '![](files/project-g/project-g-alice-death.gif)', text)
alice.write_text(text, encoding='utf-8')
