from pathlib import Path
import json,pymupdf as f
work=Path(__file__).resolve().parent
path=work.parents[1]/'Resources/writing/eu-korea-fta-presentation-fr.pdf'
d=f.open(path);fontfile=work/'fonts/Rockwell.ttf';font=f.Font(fontfile=str(fontfile))
for item in json.loads((work/'wordart.json').read_text()):
 p=d[item['page']];rect=f.Rect(item['bbox']);t=item['text'];size=item['size']
 p.add_redact_annot(rect,fill=False);p.apply_redactions(images=0,graphics=1)
 while font.text_length(t,fontsize=size)>rect.width-15:size-=.25
 size=min(size,rect.height/(font.ascender-font.descender))
 x0=rect.x0+(rect.width-font.text_length(t,fontsize=size))/2 if item['centered'] else rect.x0+7.2
 baseline=rect.y0+(rect.height-size*(font.ascender-font.descender))/2+size*font.ascender
 p.insert_text((x0,baseline+2),t,fontsize=size,fontfile=str(fontfile),fontname='wordartfr',color=(.76,.77,.78),fill=(.76,.77,.78))
 p.insert_text((x0,baseline),t,fontsize=size,fontfile=str(fontfile),fontname='wordartfr',color=(.89,.25,.2),fill=(1,1,1),render_mode=2,border_width=.025)
out=path.with_suffix('.tmp.pdf');d.save(out,garbage=4,deflate=True);d.close();out.replace(path)
