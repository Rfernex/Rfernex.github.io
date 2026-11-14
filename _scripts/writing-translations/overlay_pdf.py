from pathlib import Path
import pymupdf as f,json,sys,html
root=Path(__file__).resolve().parents[2]
work=Path(__file__).resolve().parent
slug=sys.argv[1];lang=sys.argv[2] if len(sys.argv)>2 else 'en'
rows=json.loads((work/f'{slug}.blocks.json').read_text())
tr=json.loads((root/'translation-work/translations'/f'{slug}.{lang}.json').read_text())
d=f.open(root/'Resources/writing'/f'{slug}.pdf')
fonts='/usr/local/texlive/2026/texmf-dist/fonts/opentype/public/lm'
css='''@font-face{font-family:source;src:url(lmroman10-regular.otf)}
@font-face{font-family:source;src:url(lmroman10-bold.otf);font-weight:bold}
@font-face{font-family:source;src:url(lmroman10-italic.otf);font-style:italic}
*{margin:0;padding:0} sup{font-size:70%}'''
scales=[]
for pi,p in enumerate(d):
 items=[r for r in rows if r['page']==pi and r['id'] in tr]
 for r in items:p.add_redact_annot(f.Rect(r['bbox']),fill=False)
 p.apply_redactions(images=0,graphics=0)
 for r in items:
  rect=f.Rect(r['bbox']);rect.y0-=.8;rect.y1+=1
  # Preserve full-width body text and the source's centred heading/caption.
  center=rect.x0>100 and rect.width<500
  if center:rect.x0=45;rect.x1=p.rect.width-45
  family='source';weight='bold' if 'Bold' in r['font'] or 'cmbx' in r['font'] else 'normal'
  style='italic' if 'Italic' in r['font'] or 'cmti' in r['font'] else 'normal'
  color=f'#{r["color"]:06x}'
  align='center' if center else ('justify' if len(tr[r['id']])>200 else 'left')
  content=f'<div style="font-family:{family};font-size:{r["size"]}pt;line-height:1.13;color:{color};font-weight:{weight};font-style:{style};text-align:{align}">{tr[r["id"]]}</div>'
  spare,scale=p.insert_htmlbox(rect,content,css=css,archive=f.Archive(fonts),scale_low=.78)
  if spare<0:raise RuntimeError(f'Cannot fit {slug} {r["id"]}')
  scales.append((r['id'],round(scale,3)))
meta=d.metadata;meta['title']=meta.get('title','')+f' ({lang.upper()})';d.set_metadata(meta)
d.set_language(lang)
out=root/'Resources/writing'/f'{slug}-{lang}.pdf';d.save(out,garbage=4,deflate=True)
print(slug, 'scales',scales)
