"""Correct the established English work titles in the PDF lecture.

Usage: python fix_english_lecture.py PDF FONTS_DIR
FONTS_DIR needs full Calibri.ttf, Poppins-Regular.ttf and Poppins-Italic.ttf.
The script edits the PDF in place and is safe to rerun after the correction.
"""
from pathlib import Path
import sys
import pymupdf as fitz

pdf = Path(sys.argv[1])
fontdir = Path(sys.argv[2])
fonts = {
    'Calibri': fontdir / 'Calibri.ttf',
    'Poppins-Regular': fontdir / 'Poppins-Regular.ttf',
    'Poppins-Italic': fontdir / 'Poppins-Italic.ttf',
}
for path in fonts.values():
    if not path.is_file():
        raise FileNotFoundError(path)

doc = fitz.open(pdf)
if 'Treaty on the Light' not in doc[3].get_text():
    if 'Treatise on Light' in doc[3].get_text():
        print('English lecture titles already corrected')
        sys.exit(0)
    raise ValueError('This is not the expected source lecture PDF')

# Page, exact original span, replacement, font. Preserve the year and bullet
# glyphs on the timeline; remove its wrapped "Method" continuation separately.
changes = [
    (1, ': publishes his Treaty on the Light', ': begins The World', 'Calibri'),
    (1, ' : publishes his Discourse on the ', ' : publishes Discourse on Method', 'Calibri'),
    (1, 'Method', '', 'Calibri'),
    (1, ' : publishes his Principles of philosophy', ' : publishes his Principles of Philosophy', 'Calibri'),
    (3, 'Treaty on the Light', 'Treatise on Light', 'Poppins-Italic'),
    (3, ') »', ') »', 'Poppins-Regular'),
    (5, 'DISCOURSE ON THE METHOD', 'DISCOURSE ON METHOD', 'Calibri'),
    (9, 'DISCOURSE ON THE METHOD, PART THREE', 'DISCOURSE ON METHOD, PART THREE', 'Calibri'),
]
spans = {}
for page_number in {item[0] for item in changes}:
    page = doc[page_number]
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            for span in line['spans']:
                spans.setdefault((page_number, span['text']), []).append(span)

for page_number, old, _, _ in changes:
    found = spans.get((page_number, old), [])
    if len(found) != 1:
        raise ValueError(f'Expected one span on slide {page_number + 1}: {old!r}, got {len(found)}')
    box = fitz.Rect(found[0]['bbox'])
    box.x0 -= .2
    box.x1 += .2
    doc[page_number].add_redact_annot(box, fill=False)
for page_number in {item[0] for item in changes}:
    doc[page_number].apply_redactions(images=0, graphics=0)

for page_number, old, new, family in changes:
    if not new or (page_number == 3 and old == ') »'):
        continue
    span = spans[(page_number, old)][0]
    x, y = span['origin']
    if page_number in {5, 9}:
        width = fitz.Font(fontfile=str(fonts[family])).text_length(new, fontsize=span['size'])
        x = 905.7 - width
    color = span['color']
    rgb = ((color >> 16 & 255) / 255, (color >> 8 & 255) / 255, (color & 255) / 255)
    doc[page_number].insert_text((x, y), new, fontsize=span['size'],
                                  fontfile=str(fonts[family]), fontname='Corrected' + family.replace('-', ''),
                                  color=rgb)

# The closing punctuation moves with the shorter title, retaining the quotation.
closing = spans[(3, ') »')][0]
italic = spans[(3, 'Treaty on the Light')][0]
width = fitz.Font(fontfile=str(fonts['Poppins-Italic'])).text_length('Treatise on Light', fontsize=italic['size'])
doc[3].insert_text((italic['origin'][0] + width, closing['origin'][1]), ') »',
                   fontsize=closing['size'], fontfile=str(fonts['Poppins-Regular']),
                   fontname='CorrectedPoppinsRegular', color=(1, 1, 1))
doc.set_language('en')
output = pdf.with_suffix('.tmp.pdf')
doc.save(output, garbage=4, deflate=True)
doc.close()
output.replace(pdf)
print('Corrected work titles on slides 2, 4, 6 and 10')
