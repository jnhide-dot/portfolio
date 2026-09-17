"""Publish watermarked WebP pages, never source text or intermediate PDFs."""
import json
from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont

scratch = Path('.sites-runtime/project-md-previews')
sources = json.loads((scratch / 'sources.json').read_text(encoding='utf-8'))
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 31)
small = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
manifest = []
for index, source in enumerate(sources):
    pdf = pdfium.PdfDocument(str(scratch / (source['id'] + '.pdf')))
    folder = Path('dist/files/project-md/previews') / source['id']
    folder.mkdir(parents=True, exist_ok=True)
    for n in range(len(pdf)):
        page = pdf[n]
        bitmap = page.render(scale=2)
        image = bitmap.to_pil().convert('RGBA')
        watermark = Image.new('RGBA', image.size)
        draw = ImageDraw.Draw(watermark)
        for y in range(180, image.height-90, 320):
            for x in range(30, image.width, 500):
                draw.text((x, y), 'JNHIDE / PORTFOLIO', fill=(38,73,125,35), font=font)
        draw.text((52, image.height-48), 'JNHIDE / PORTFOLIO PREVIEW', fill=(38,73,125,190), font=small)
        draw.text((image.width-140, image.height-48), f'{n+1} / {len(pdf)}', fill=(38,73,125,190), font=small)
        image = Image.alpha_composite(image, watermark).convert('RGB')
        image.save(folder / f'{n+1:04}.webp', 'WEBP', quality=84, method=4)
        bitmap.close()
        page.close()
    manifest.append({k:source[k] for k in ['id','title','category']} | {'pages':len(pdf)})
    pdf.close()
    if index % 10 == 0 or index == len(sources)-1:
        print(f'Rasterized {index+1}/{len(sources)}', flush=True)
Path('content/project-md-previews.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Published {len(manifest)} files / {sum(item["pages"] for item in manifest)} image pages')
