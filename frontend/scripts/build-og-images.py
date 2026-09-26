"""Render social cards from existing brand vectors and the site's Chivo font.

From frontend, after npm ci:
  python3 -m venv /tmp/jdiobe-og
  /tmp/jdiobe-og/bin/pip install pillow fonttools brotli
  /tmp/jdiobe-og/bin/python scripts/build-og-images.py

Committed PNGs are served directly; Python is not needed in production.
"""
from io import BytesIO
from pathlib import Path
import json
import subprocess
import tempfile

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'public/images/og'
SMOKE, INK, ORANGE = '#f5f5f5', '#3a3b47', '#fe5c00'
SCALE = 2


def font_bytes(weight):
    font = TTFont(ROOT / 'app/fonts/Chivo-Variable.woff2')
    font = instantiateVariableFont(font, {'wght': weight}, inplace=True)
    font.flavor = None
    stream = BytesIO()
    font.save(stream)
    return stream.getvalue()


FONTS = {weight: font_bytes(weight) for weight in (400, 700, 900)}


def font(size, weight=400):
    return ImageFont.truetype(BytesIO(FONTS[weight]), round(size * SCALE))


def wrap(text, face, width):
    lines = ['']
    for word in text.split():
        candidate = f'{lines[-1]} {word}'.strip()
        if face.getlength(candidate) > width * SCALE and lines[-1]:
            lines.append(word)
        else:
            lines[-1] = candidate
    return lines


def render(card, logo, mark):
    image = Image.new('RGB', (1200 * SCALE, 630 * SCALE), SMOKE)
    draw = ImageDraw.Draw(image)

    def rect(box, color):
        draw.rectangle(tuple(round(v * SCALE) for v in box), fill=color)

    def text(x, y, value, size, color=INK, weight=400):
        draw.text((x * SCALE, y * SCALE), value, font=font(size, weight), fill=color, anchor='lt')

    rect((848, 0, 1200, 630), ORANGE)
    # A restrained technical grid and orbital geometry frame the original mark.
    for x in range(872, 1201, 48):
        for y in range(28, 631, 48):
            draw.ellipse((x*SCALE, y*SCALE, (x+2)*SCALE, (y+2)*SCALE), fill='#df5100')
    for radius in (140, 200, 260):
        draw.ellipse(tuple(v*SCALE for v in (1024-radius, 290-radius, 1024+radius, 290+radius)), outline='#e65300', width=2)
    rect((0, 0, 847.5, 630), SMOKE)
    image.paste(logo, (64*SCALE, 55*SCALE), logo)
    image.paste(mark, (918*SCALE, 176*SCALE), mark)
    text(904, 478, 'STEM STARTS', 23, '#1c1d23', 900)
    text(904, 511, 'WITH OPPORTUNITY.', 20, '#1c1d23', 900)

    text(64, 185, card['label'], 16, '#c2410c', 700)
    size = 76
    while True:
        face = font(size, 900)
        lines = wrap(card['title'], face, 720)
        if len(lines) * size * 1.07 <= 255:
            break
        size -= 1
    for index, line in enumerate(lines):
        text(60, 231 + index * size * 1.07, line, size, INK, 900)
    rect((64, 506, 140, 513), ORANGE)
    text(64, 548, 'UGANDA  /  SOUTH SUDAN', 17, INK, 700)
    text(64, 580, 'jdiobestem.org', 17)
    return image.resize((1200, 630), Image.Resampling.LANCZOS)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    cards = json.loads((ROOT / 'scripts/og-cards.json').read_text())
    with tempfile.TemporaryDirectory() as temp:
        # Sharp preserves the exact vector paths of the existing brand assets.
        subprocess.run(['node', '-e', '''
const fs = require('node:fs');
const sharp = require('sharp');
const out = process.argv[1];
(async () => {
  await sharp('public/icons/full logo.svg').resize(720).png().toFile(out + '/logo.png');
  const mark = fs.readFileSync('public/icons/icon logo.svg', 'utf8').replaceAll('#fe5c00', '#1c1d23');
  await sharp(Buffer.from(mark)).resize(424).png().toFile(out + '/mark.png');
})().catch(error => { console.error(error); process.exit(1); });
''', temp], cwd=ROOT, check=True)
        logo = Image.open(Path(temp) / 'logo.png').convert('RGBA')
        mark = Image.open(Path(temp) / 'mark.png').convert('RGBA')
        for slug, card in cards.items():
            render(card, logo, mark).save(OUTPUT / f'{slug}.png', optimize=True)
    print(f'Rendered {len(cards)} cards at 1200 × 630 in {OUTPUT}')


if __name__ == '__main__':
    main()
