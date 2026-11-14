from pathlib import Path
import pymupdf as f,json,sys,html
root=Path(__file__).resolve().parents[2]
work=Path(__file__).resolve().parent
slug=sys.argv[1];lang=sys.argv[2] if len(sys.argv)>2 else 'en'
rows=json.loads((work/f'{slug}.blocks.json').read_text()); byid={r['id']:r for r in rows}
tr=json.loads((root/'translation-work/translations'/f'{slug}.{lang}.json').read_text())
d=f.open(root/'Resources/writing'/f'{slug}.pdf');fontdir=work/'fonts'
# PowerPoint exports text shadows as separate raster images. Remove only those
# shadows, never the charts, photographs, logos or pictograms.
shadow_rects={}
if slug == 'eu-korea-fta-presentation':
 shadow_ids=[17,19,20,21,22,23,24,25,27,29,30,*range(49,62),96,116,117,136,138,140,141,142,143,144,146,147,151,153,154,155,156,157,158,182,183,187,188,189,190,191,*range(197,207),*range(240,250),*range(258,264),291,292,*range(327,339)]
 for xref in shadow_ids:
  for page in d:
   if any(im[0]==xref for im in page.get_images()):
    shadow_rects.setdefault(page.number,[]).extend(page.get_image_rects(xref))
    page.delete_image(xref)
    break

# Repeated running heads retain their original position and styling.
if slug.startswith('internationalisation'):
 common={'Propos général':'General overview','Chapitre 1 : de 1868 à 2000':'Chapter 1: 1868 to 2000','Chapitre 2 : Mondialisation':'Chapter 2: Globalisation','Chapitre 3 : Le Défi Japonais':"Chapter 3: Japan’s Challenge",'Bibliographie':'Bibliography'}
 for r in rows:
  if r['text'].strip() in common and r['id'] not in tr:tr[r['id']]=common[r['text'].strip()]
css='*{margin:0;padding:0} p{margin-bottom:.5em} sup{font-size:70%}'
fontmap={}
for i,font in enumerate(sorted(set(r['font'] for r in rows))):
 path=fontdir/(font+'.ttf')
 if path.exists():
  family='font'+str(i);fontmap[font]=family;css+=f'@font-face{{font-family:{family};src:url("{path.name}")}}'
scales=[]; failures=[]
for pi,p in enumerate(d):
 items=[]
 for key,value in tr.items():
  ids=key.split('+')
  if byid[ids[0]]['page']!=pi:continue
  rr=[byid[i] for i in ids];rect=f.Rect(rr[0]['bbox'])
  for r in rr[1:]:rect|=f.Rect(r['bbox'])
  opts=value if isinstance(value,dict) else {'text':value};r=rr[0].copy()
  # Stat blocks contain a large number plus smaller explanatory copy; leave the number as printed.
  if slug.startswith('internationalisation') and key in ['4:4','14:4']:
   b=next(b for b in p.get_text('dict')['blocks'] if b['number']==int(key.split(':')[1])); lines=b['lines'][1:]
   spans=[s for l in lines for s in l['spans']];rect=f.Rect(lines[0]['bbox'])
   for l in lines[1:]:rect|=f.Rect(l['bbox'])
   r['size']=spans[0]['size'];r['font']=spans[0]['font'];r['color']=spans[0]['color']
   opts={'text':'By comparison, China has<br>at least 7 (source: TWUR 2023)' if key=='4:4' else 'In 2023, the Kishida government set a new<br>target of 400,000 students by 2033'}
  for q in rr:
   p.add_redact_annot(rect if key in ['4:4','14:4'] and slug.startswith('internationalisation') else f.Rect(q['bbox']),fill=False)
  items.append((key,r,rect,opts))
 p.apply_redactions(images=0,graphics=0)
 for key,r,rect,opts in items:
  rect.y0-=.5;rect.y1+=1
  if 'bbox' in opts:rect=f.Rect(opts['bbox'])
  family=fontmap.get(opts.get('font',r['font']),'sans-serif');size=opts.get('size',r['size']);color=f'#{r["color"]:06x}'
  align=opts.get('align','justify' if len(opts['text'])>350 else 'left')
  if slug.startswith('internationalisation') and key in ['2:0','3:1','3:5','4:0','5:0','6:1','6:3+6:4','12:1','12:3+12:4','19:1','19:3+19:4','24:1']:align='center'
  content=f'<div style="font-family:{family};font-size:{size}pt;line-height:1.13;color:{color};text-align:{align}">{opts["text"]}</div>'
  if any(sh.intersects(rect) and sh.contains(f.Point(rect.x0+rect.width/2,rect.y0+rect.height/2)) for sh in shadow_rects.get(pi,[])):
   shadow_content=content.replace('color:'+color,'color:#c3c5c6')
   p.insert_htmlbox(rect+f.Rect(0,2,0,2),shadow_content,css=css,archive=f.Archive(str(fontdir)),scale_low=.72)
  spare,scale=p.insert_htmlbox(rect,content,css=css,archive=f.Archive(str(fontdir)),scale_low=.72)
  if spare<0:failures.append(key)
  scales.append((key,round(scale,3)))
if failures:raise RuntimeError(f'Cannot fit {slug}: {failures}')
meta=d.metadata;meta['title']=meta.get('title','')+f' ({lang.upper()})';d.set_metadata(meta);d.set_language(lang)
out=root/'Resources/writing'/f'{slug}-{lang}.pdf';d.save(out,garbage=4,deflate=True)
print(slug,'scales below .9:',[x for x in scales if x[1]<.9]);(work/f'{slug}.fit.json').write_text(json.dumps(scales))
