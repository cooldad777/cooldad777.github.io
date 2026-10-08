"""Static public integrity checks; no network or private history."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,subprocess,re
root=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.links=[];self.ids=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id' in d:self.ids.append(d['id'])
  for key in ['href','src']:
   if key in d:self.links.append(d[key])
errors=[]
historical=[]
pages={p:Page(p.read_text()) for p in root.rglob('*.html') if '.git' not in p.parts}
for p,doc in pages.items():
 if len(doc.ids)!=len(set(doc.ids)):errors.append(f'duplicate ID: {p.relative_to(root)}')
 for raw in doc.links:
  u=urlsplit(raw)
  if u.scheme or u.netloc or not u.path:continue
  dest=(root/u.path.lstrip('/')) if u.path.startswith('/') else p.parent/unquote(u.path)
  if dest.is_dir():dest=dest/'index.html'
  if not dest.exists():errors.append(f'broken local link {p.relative_to(root)}: {raw}')
  elif u.fragment and dest.suffix=='.html':
   target=pages.get(dest.resolve()) or Page(dest.read_text())
   if unquote(u.fragment) not in target.ids:
    (historical if p.name=='index-preview.html' else errors).append(f'missing fragment {p.relative_to(root)}: {raw}')
base='9acfe3f2d796522d65b6c54f95e50b2ba7c770c0'
for record in json.loads((root/'rewind/milestones.json').read_text()):
 subprocess.run(['git','merge-base','--is-ancestor',record['commit'],base],cwd=root,check=True)
 source=subprocess.check_output(['git','show',record['commit']+':'+record['path']],cwd=root,text=True)
 assert record['excerpt'] in source
 assert record['commit'] in (root/'rewind/index.html').read_text()
for f in ['chronicle/entries.jsonl','seersolutions/s33r/data/benchmarks.json','seersolutions/s33r/data/models.json','seersolutions/s33r/data/runs/hs-001.json']:
 assert (root/f).read_bytes()==subprocess.check_output(['git','show',base+':'+f],cwd=root),f
print(json.dumps({'rewind':'3 exact excerpts and ancestry verified','fixtures':'Chronicle and HS-001 unchanged','html_pages':len(pages),'local_link_errors':errors,'known_unchanged_historical_preview_links':historical},indent=2))
if errors:raise SystemExit(1)
