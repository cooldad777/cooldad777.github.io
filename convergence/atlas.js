(async()=>{'use strict';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=(text)=>String(text??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmtM=n=>n>=1000?(n/1000).toFixed(1).replace(/\.0$/,'')+'B':n+'M';

let atlasData,eschData,expData,newsData;
try{
  const [a,e,x,n]=await Promise.all([
    fetch('worldviews.json',{cache:'no-store'}),
    fetch('eschatology.json',{cache:'no-store'}),
    fetch('exponential.json',{cache:'no-store'}),
    fetch('news.json',{cache:'no-store'})
  ]);
  if(!a.ok||!e.ok||!x.ok||!n.ok) throw new Error('data');
  [atlasData,eschData,expData,newsData]=await Promise.all([a.json(),e.json(),x.json(),n.json()]);
}catch(err){
  document.querySelector('main').insertAdjacentHTML('afterbegin','<div class="conv-wrap" style="padding-top:100px"><p>Convergence data could not load. Refresh the page.</p></div>');
  return;
}

/* ---------- Mode shell ---------- */
const modeButtons=$$('.mode-button');
const modePanels=$$('[data-mode-panel]');
const validModes=new Set(modeButtons.map(b=>b.dataset.mode));
const initialHash=location.hash.replace(/^#/,'');
let mode=validModes.has(initialHash)?initialHash:'atlas';

function syncHash(){
  history.replaceState(null,'','#'+mode);
}
function setMode(next,{scroll=false}={}){
  if(!validModes.has(next)) return;
  mode=next;
  modeButtons.forEach(btn=>{
    const active=btn.dataset.mode===mode;
    btn.classList.toggle('is-active',active);
    btn.setAttribute('aria-selected',active?'true':'false');
  });
  modePanels.forEach(panel=>{
    const active=panel.dataset.modePanel===mode;
    panel.hidden=!active;
    panel.classList.toggle('is-active',active);
    if(active&&!reduce){
      panel.classList.remove('is-entering');
      void panel.offsetWidth;
      panel.classList.add('is-entering');
    }
  });
  syncHash();
  if(scroll){
    document.getElementById('convergence-modes')?.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  }
}
modeButtons.forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.mode,{scroll:true})));
setMode(mode);

/* ---------- Atlas ---------- */
const root=atlasData.root;
const byId=new Map();
function index(node,parent=null){
  node.parent=parent;
  byId.set(node.id,node);
  (node.children||[]).forEach(c=>index(c,node));
}
index(root);
const palette={
  christianity:'#8ea98f',
  islam:'#78a288',
  unaffiliated:'#a6afb8',
  hinduism:'#d4a15e',
  buddhism:'#91b3c5',
  'other-religions':'#b69a78',
  judaism:'#6f91b7'
};
let atlasPath=[root,byId.get('christianity'),byId.get('protestant')];

function lineage(node){
  const arr=[];let cur=node;
  while(cur){arr.unshift(cur);cur=cur.parent;}
  return arr;
}
function selectAtlas(node){
  atlasPath=lineage(node);
  renderAtlas();
  requestAnimationFrame(()=>{
    const cols=$('#branch-columns');
    if(cols) cols.scrollTo({left:cols.scrollWidth,behavior:reduce?'auto':'smooth'});
  });
}
function sourceFor(node){
  if(node.share_world!=null || (node.parent&&node.parent.id==='world')) return atlasData.topLevelSource;
  if(node.pop_year===2010 || (node.parent&&node.parent.id==='christianity')) return atlasData.christianSource;
  return null;
}
function statHtml(node){
  const bits=[];
  if(node.pop_m!=null) bits.push('<span>~'+fmtM(node.pop_m)+'</span>');
  if(node.share_world!=null) bits.push('<span>'+node.share_world+'% of world · '+node.pop_year+'</span>');
  if(node.share_parent!=null) bits.push('<span>'+node.share_parent+'% of Christians · '+node.pop_year+'</span>');
  if(!bits.length) bits.push('<span>taxonomy · not population-scaled</span>');
  return bits.join('');
}
function renderPopulation(){
  const bar=$('#population-bar'),legend=$('#population-legend');
  if(!bar||!legend) return;
  bar.innerHTML='';legend.innerHTML='';
  (root.children||[]).forEach(node=>{
    const share=node.share_world||0.2;
    const color=palette[node.id]||'#9ca9a1';
    const seg=document.createElement('button');
    seg.type='button';
    seg.className='population-segment'+(atlasPath.some(p=>p.id===node.id)?' is-active':'');
    seg.style.flex=String(share)+' 1 0';
    seg.style.background=color;
    seg.title=node.name+' · '+share+'%';
    seg.innerHTML=share>=4.5?'<span>'+esc(node.name)+'<br>'+share+'%</span>':'';
    seg.onclick=()=>selectAtlas(node);
    bar.appendChild(seg);

    const key=document.createElement('button');
    key.type='button';
    key.className='population-key';
    key.style.setProperty('--key',color);
    key.innerHTML='<i></i><strong>'+esc(node.name)+'</strong> '+share+'%';
    key.onclick=()=>selectAtlas(node);
    legend.appendChild(key);
  });
  $('#source-summary').innerHTML='Top-level shares use <a href="'+atlasData.topLevelSource.url+'" target="_blank" rel="noopener">Pew Research Center’s 2020 global estimates</a>. Population scale and branch taxonomy are deliberately separated.';
}
function renderBreadcrumbs(){
  const box=$('#breadcrumbs');if(!box)return;
  box.innerHTML='';
  atlasPath.forEach((node,i)=>{
    if(i){const sep=document.createElement('span');sep.className='crumb-sep';sep.textContent='›';box.appendChild(sep);}
    const b=document.createElement('button');b.type='button';b.className='crumb';b.textContent=node.name;b.onclick=()=>selectAtlas(node);box.appendChild(b);
  });
}
function childLabel(node){
  if(node.share_world!=null) return node.share_world+'% of world';
  if(node.share_parent!=null) return node.share_parent+'% of Christians';
  if(node.children&&node.children.length) return node.children.length+' branches';
  return node.kind||'branch';
}
function renderColumns(){
  const shell=$('#branch-columns');if(!shell)return;
  shell.innerHTML='';
  const cols=[{parent:root,label:'World',children:root.children||[]}];
  for(let i=1;i<atlasPath.length;i++){
    const parent=atlasPath[i];
    if(parent.children&&parent.children.length) cols.push({parent,label:parent.name,children:parent.children});
  }
  cols.forEach((col,idx)=>{
    const div=document.createElement('section');div.className='branch-column';
    const selectedNext=atlasPath[idx+1];
    div.innerHTML='<div class="column-head"><span>'+(idx===0?'Major identities':'Inside')+'</span><h3>'+esc(col.label)+'</h3></div><div class="branch-list"></div>';
    const list=$('.branch-list',div);
    if(!col.children.length){
      list.innerHTML='<p class="branch-empty">No deeper branch is mapped yet.</p>';
    }else{
      col.children.forEach(node=>{
        const b=document.createElement('button');b.type='button';
        b.className='branch-node'+(selectedNext&&selectedNext.id===node.id?' is-selected':'')+(node.featured?' is-featured':'');
        const pct=node.share_world!=null?node.share_world:(node.share_parent!=null?node.share_parent:null);
        b.innerHTML='<strong>'+esc(node.name)+'</strong><small>'+esc(childLabel(node))+'</small>'+
          (pct!=null?'<div class="mini-bar"><b style="width:'+Math.min(100,pct)+'%"></b></div>':'')+
          ((node.children&&node.children.length)?'<span class="chev">›</span>':'');
        b.onclick=()=>selectAtlas(node);list.appendChild(b);
      });
    }
    shell.appendChild(div);
  });
}
function renderDetail(){
  const node=atlasPath[atlasPath.length-1],src=sourceFor(node),box=$('#node-detail');if(!box)return;
  box.innerHTML=
    '<div><span class="detail-meta">'+esc(node.kind||'node')+'</span><h3>'+esc(node.name)+'</h3><div class="detail-stat">'+statHtml(node)+'</div></div>'+
    '<div><p>'+esc((node.summary||node.description)||'')+'</p>'+
      (node.children&&node.children.length?'<p style="margin-top:10px">'+node.children.length+' mapped branches. Select one to continue.</p>':'')+
      (src?'<p class="detail-source">Population source: <a href="'+src.url+'" target="_blank" rel="noopener">'+esc(src.label)+'</a>. '+esc(src.note)+'</p>':'<p class="detail-source">This level is a structural orientation map, not a population estimate.</p>')+
    '</div>';
}
function renderAtlas(){renderPopulation();renderBreadcrumbs();renderColumns();renderDetail();}
$('#world-reset')?.addEventListener('click',()=>{atlasPath=[root];renderAtlas();});
$('#christian-jump')?.addEventListener('click',()=>{atlasPath=[root,byId.get('christianity'),byId.get('protestant')];renderAtlas();requestAnimationFrame(()=>$('#branch-columns')?.scrollTo({left:$('#branch-columns').scrollWidth,behavior:reduce?'auto':'smooth'}));});
renderAtlas();

/* ---------- Eschatology ---------- */
let eschFamily='christian';
let eschSelected=eschData.christianPerspectives[0]?.id;
function eschCollection(){
  return eschFamily==='christian'?eschData.christianPerspectives:eschData.otherHorizons;
}
function renderChristianCore(){
  const c=eschData.christianCore,box=$('#christian-core');if(!box)return;
  box.innerHTML='<div><p class="conv-kicker">Shared core</p><h3>'+esc(c.title)+'</h3></div>'+
    '<div><p>'+esc(c.summary)+'</p><div class="core-refs">'+c.refs.map(r=>'<span>'+esc(r)+'</span>').join('')+'</div></div>';
}
function renderEschList(){
  const list=$('#esch-list');if(!list)return;
  list.innerHTML='';
  eschCollection().forEach(item=>{
    const b=document.createElement('button');b.type='button';
    b.className='perspective-button'+(item.id===eschSelected?' is-active':'');
    b.innerHTML='<strong>'+esc(item.name)+'</strong><small>'+esc(item.commonIn||item.family||'future horizon')+'</small>';
    b.onclick=()=>{eschSelected=item.id;renderEschList();renderEschStage();};
    list.appendChild(b);
  });
}
function renderEschStage(){
  const item=eschCollection().find(x=>x.id===eschSelected)||eschCollection()[0];
  if(!item)return;
  eschSelected=item.id;
  const stage=$('#esch-stage');if(!stage)return;
  stage.innerHTML=
    '<span class="stage-label">'+esc(item.family||'future horizon')+'</span>'+
    '<h3>'+esc(item.name)+'</h3>'+
    '<p class="stage-intro">'+esc(item.emphasis)+'</p>'+
    '<div class="future-flow">'+item.sequence.map(step=>'<div class="future-step"><strong>'+esc(step)+'</strong></div>').join('')+'</div>'+
    '<div class="stage-duo">'+
      '<article class="stage-card"><span>Where technology may resonate</span><p>'+esc(item.techResonance)+'</p></article>'+
      '<article class="stage-card guardrail"><span>Guardrail</span><p>'+esc(item.guardrail)+'</p></article>'+
    '</div>'+
    '<div class="stage-refs">'+(item.refs||[]).map(r=>'<span class="ref-chip">'+esc(r)+'</span>').join('')+'</div>';
}
$$('.family-button').forEach(btn=>btn.addEventListener('click',()=>{
  eschFamily=btn.dataset.family;
  $$('.family-button').forEach(x=>{const active=x===btn;x.classList.toggle('is-active',active);x.setAttribute('aria-selected',active?'true':'false');});
  eschSelected=eschCollection()[0]?.id;
  renderEschList();renderEschStage();
}));
renderChristianCore();renderEschList();renderEschStage();

/* ---------- Exponential ---------- */
let expSelected=expData.topics[0]?.id;
function renderSignalRibbon(){
  const ribbon=$('#signal-ribbon');if(!ribbon)return;
  ribbon.innerHTML='';
  expData.topics.forEach(topic=>{
    const b=document.createElement('button');b.type='button';
    b.className='signal-button'+(topic.id===expSelected?' is-active':'');
    b.innerHTML='<strong>'+esc(topic.name)+'</strong><small>'+esc(topic.adjacent.join(' · '))+'</small>';
    b.onclick=()=>{expSelected=topic.id;renderSignalRibbon();renderSignalStage();};
    ribbon.appendChild(b);
  });
}
function adjacentPositions(items){
  const defaults=[[50,14],[79,25],[87,55],[70,82],[30,82],[13,55],[21,25],[50,90]];
  return items.map((x,i)=>({label:x,pos:defaults[i%defaults.length]}));
}
function renderSignalStage(){
  const topic=expData.topics.find(t=>t.id===expSelected)||expData.topics[0];
  if(!topic)return;
  expSelected=topic.id;
  const stage=$('#signal-stage');if(!stage)return;
  const cloud=adjacentPositions(topic.adjacent);
  stage.innerHTML=
    '<article class="signal-focus">'+
      '<p class="conv-kicker">Signal</p><h3>'+esc(topic.name)+'</h3><p>'+esc(topic.signal)+'</p>'+
      '<div class="signal-meta">'+
        '<div class="signal-row"><span>Why it matters</span><p>'+esc(topic.whyItMatters)+'</p></div>'+
        '<div class="signal-row"><span>Interpretive resonance</span><div class="resonance-tags">'+topic.resonance.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div></div>'+
        '<div class="signal-row"><span>Guardrail</span><p>'+esc(topic.guardrail)+'</p></div>'+
      '</div>'+
    '</article>'+
    '<div class="signal-network" aria-label="Adjacent topics around '+esc(topic.name)+'">'+
      '<div class="signal-center"><strong>'+esc(topic.name)+'</strong></div>'+
      '<div class="adjacent-cloud">'+cloud.map(x=>'<span class="adjacent-chip" style="left:'+x.pos[0]+'%;top:'+x.pos[1]+'%">'+esc(x.label)+'</span>').join('')+'</div>'+
    '</div>';
}
renderSignalRibbon();renderSignalStage();

/* ---------- Live ---------- */
let newsFilter='all';
let newsSelected=newsData.items[0]?.id;
const themeNames={
  agents:'AI agents',
  attachment:'AI attachment',
  surveillance:'Surveillance / wearables',
  'identity-money':'Identity / money',
  robotics:'Robotics',
  war:'Autonomous defense',
  bio:'AI + biotech',
  compute:'Compute / infrastructure',
  synthetic:'Synthetic media',
  space:'Space'
};
function filteredNews(){
  return newsFilter==='all'?newsData.items:newsData.items.filter(item=>item.themes.includes(newsFilter));
}
function renderNewsFilters(){
  const box=$('#news-filters');if(!box)return;
  const themes=[...new Set(newsData.items.flatMap(i=>i.themes))];
  const opts=[['all','All'],...themes.map(t=>[t,themeNames[t]||t])];
  box.innerHTML='';
  opts.forEach(([id,label])=>{
    const b=document.createElement('button');b.type='button';
    b.className='news-filter'+(newsFilter===id?' is-active':'');
    b.textContent=label;
    b.onclick=()=>{newsFilter=id;const list=filteredNews();if(!list.some(x=>x.id===newsSelected))newsSelected=list[0]?.id;renderNewsFilters();renderNewsList();renderNewsStage();};
    box.appendChild(b);
  });
}
function renderNewsList(){
  const list=$('#news-list');if(!list)return;
  list.innerHTML='';
  filteredNews().forEach(item=>{
    const b=document.createElement('button');b.type='button';
    b.className='news-item'+(item.id===newsSelected?' is-active':'');
    b.innerHTML='<span class="news-date">'+esc(item.date)+' · '+esc(item.source)+'</span><strong>'+esc(item.title)+'</strong><div class="theme-line">'+item.themes.map(t=>'<span>'+esc(themeNames[t]||t)+'</span>').join('')+'</div>';
    b.onclick=()=>{newsSelected=item.id;renderNewsList();renderNewsStage();};
    list.appendChild(b);
  });
}
function renderNewsStage(){
  const item=newsData.items.find(i=>i.id===newsSelected)||filteredNews()[0];
  const stage=$('#news-stage');if(!stage)return;
  if(!item){stage.innerHTML='<p>No stories in this filter yet.</p>';return;}
  newsSelected=item.id;
  stage.innerHTML=
    '<div class="source-line"><span>'+esc(item.date)+'</span><span>·</span><span>'+esc(item.source)+'</span><span>·</span><span>'+item.themes.map(t=>esc(themeNames[t]||t)).join(' + ')+'</span></div>'+
    '<h3>'+esc(item.title)+'</h3>'+
    '<a href="'+esc(item.url)+'" target="_blank" rel="noopener">Read original report ↗</a>'+
    '<div class="fact-signal">'+
      '<div class="fact-box"><span>Reported fact</span><p>'+esc(item.fact)+'</p></div>'+
      '<div class="fact-box"><span>Exponential signal</span><p>'+esc(item.signal)+'</p></div>'+
    '</div>'+
    '<div class="read-stack">'+item.reads.map(r=>'<article class="read-card"><strong>'+esc(r.lens)+'</strong><p>'+esc(r.text)+'</p></article>').join('')+'</div>'+
    '<div class="live-guard"><strong>Rule:</strong> a current event may create resonance. It does not, by itself, settle doctrine, prove a prophecy, or establish a date.</div>';
}
$('#news-meta').textContent='Curated '+newsData.curated_at+' · '+newsData.items.length+' signals · no automatic prophetic interpretation.';
renderNewsFilters();renderNewsList();renderNewsStage();

})();