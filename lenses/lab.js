(async()=>{'use strict';

const $=(sel,root=document)=>root.querySelector(sel);
const $$=(sel,root=document)=>[...root.querySelectorAll(sel)];

const scenarios=[
  {
    title:'When should we delegate judgment?',
    short:'Judgment',
    text:'Imagine an AI recommends a consequential action. It is fast and persuasive. What needs to be true before a person should act?'
  },
  {
    title:'What happens when a tool feels like a companion?',
    short:'Companionship',
    text:'Imagine a system that remembers you, adapts to your language, and is always available. Does it expand your capacity for life outside the interaction, or begin to compete with it?'
  },
  {
    title:'Who holds power over our knowledge?',
    short:'Knowledge',
    text:'Imagine an institution building a model from knowledge produced by many people and communities. Who may authorize its use, who benefits, and who can contest it?'
  },
  {
    title:'What do we believe about the future?',
    short:'Future',
    text:'Imagine someone says a new technology will deliver salvation, catastrophe, or a predicted transformation. Which parts are observations, forecasts, interpretations, or beliefs?'
  }
];

const els={
  topicList:$('#topic-list'),
  lensList:$('#lens-list'),
  stackPills:$('#stack-pills'),
  title:$('#question-title'),
  text:$('#question-text'),
  mapQuestion:$('#map-question'),
  mapNodes:$('#map-nodes'),
  mapLines:$('#map-lines'),
  mapDetail:$('#map-detail'),
  compare:$('#compare-grid'),
  matrix:$('#matrix-body'),
  sharedTags:$('#shared-tags'),
  sharedCopy:$('#shared-copy'),
  different:$('#different-copy'),
  boundary:$('#boundary-copy'),
  sourceGrid:$('#source-grid'),
  shareStatus:$('#share-status'),
  notes:{
    evidence:$('#note-evidence'),
    value:$('#note-value'),
    open:$('#note-open')
  },
  noteStatus:$('#note-status')
};

let lenses=[];
try{
  const res=await fetch('lenses.json',{cache:'no-store'});
  if(!res.ok) throw new Error('Could not load lenses');
  lenses=await res.json();
}catch(err){
  $('.lab-stage').innerHTML='<p>The interactive lens data could not load. Refresh the page or use the source list in the page description.</p>';
  return;
}

const lensById=new Map(lenses.map(l=>[l.id,l]));
const validIds=new Set(lenses.map(l=>l.id));
const params=new URLSearchParams(location.hash.slice(1));
const state={
  topic:['0','1','2','3'].includes(params.get('q'))?Number(params.get('q')):0,
  selected:(params.get('l')||'catholic,empirical,care').split(',').filter(id=>validIds.has(id)).slice(0,4),
  view:['map','compare','matrix'].includes(params.get('v'))?params.get('v'):(matchMedia('(max-width: 760px)').matches?'compare':'map'),
  focus:null
};
if(!state.selected.length) state.selected=['catholic','empirical'];
state.focus=state.selected[0];

function esc(text){
  return String(text).replace(/[&<>"']/g,ch=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[ch]);
}
function activeLenses(){return state.selected.map(id=>lensById.get(id)).filter(Boolean);}
function syncHash(){
  history.replaceState(null,'','#'+new URLSearchParams({
    q:String(state.topic),
    l:state.selected.join(','),
    v:state.view
  }));
}
function topicQuestion(lens){
  return lens.questions[state.topic]||lens.questions[0];
}

function renderTopics(){
  els.topicList.innerHTML='';
  scenarios.forEach((s,i)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='control-button topic-button'+(i===state.topic?' is-active':'');
    b.dataset.topic=String(i);
    b.setAttribute('aria-pressed',i===state.topic?'true':'false');
    b.innerHTML='<strong>'+esc(s.short)+'</strong><small>'+esc(s.title)+'</small>';
    b.addEventListener('click',()=>{state.topic=i;render();});
    els.topicList.appendChild(b);
  });
}

function renderLensControls(){
  els.lensList.innerHTML='';
  lenses.forEach(lens=>{
    const active=state.selected.includes(lens.id);
    const b=document.createElement('button');
    b.type='button';
    b.className='control-button lens-button'+(active?' is-active':'');
    b.style.setProperty('--lens-accent',lens.accent||'#557b68');
    b.dataset.lens=lens.id;
    b.setAttribute('aria-pressed',active?'true':'false');
    b.innerHTML='<span class="lens-dot" aria-hidden="true"></span><span>'+esc(lens.short||lens.name)+'</span><span class="check" aria-hidden="true"></span>';
    b.addEventListener('click',()=>toggleLens(lens.id));
    els.lensList.appendChild(b);
  });
}

function toggleLens(id){
  const active=state.selected.includes(id);
  if(active){
    if(state.selected.length===1){
      els.shareStatus.textContent='Keep at least one lens in the stack.';
      return;
    }
    state.selected=state.selected.filter(x=>x!==id);
    if(state.focus===id) state.focus=state.selected[0];
  }else{
    if(state.selected.length>=4){
      els.shareStatus.textContent='Four lenses is the current limit. Remove one to add another.';
      return;
    }
    state.selected=[...state.selected,id];
    state.focus=id;
  }
  render();
}

function renderQuestion(){
  const sc=scenarios[state.topic];
  els.title.textContent=sc.title;
  els.text.textContent=sc.text;
  els.mapQuestion.textContent=sc.short;
  els.stackPills.innerHTML='';
  activeLenses().forEach(l=>{
    const span=document.createElement('span');
    span.className='stack-pill';
    span.textContent=l.short||l.name;
    els.stackPills.appendChild(span);
  });
}

function mapPositions(count){
  if(count===1) return [[50,18]];
  if(count===2) return [[26,23],[74,23]];
  if(count===3) return [[22,22],[78,22],[50,77]];
  return [[20,22],[80,22],[22,74],[78,74]];
}
function mapPointPercentToSvg(x,y){return {x:x*10,y:y*6.1};}

function renderMap(){
  const selected=activeLenses();
  const positions=mapPositions(selected.length);
  els.mapNodes.innerHTML='';
  els.mapLines.innerHTML='';

  selected.forEach((lens,i)=>{
    const [x,y]=positions[i];
    const center={x:500,y:305};
    const point=mapPointPercentToSvg(x,y);
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',String(center.x));
    line.setAttribute('y1',String(center.y));
    line.setAttribute('x2',String(point.x));
    line.setAttribute('y2',String(point.y));
    els.mapLines.appendChild(line);

    const node=document.createElement('button');
    node.type='button';
    node.className='lens-node'+(state.focus===lens.id?' is-focused':'');
    node.style.left=x+'%';
    node.style.top=y+'%';
    node.style.setProperty('--lens-accent',lens.accent||'#557b68');
    node.setAttribute('aria-label','Focus '+lens.name);
    node.innerHTML='<span class="node-type">'+esc(lens.type)+'</span><strong>'+esc(lens.short||lens.name)+'</strong><p>'+esc(topicQuestion(lens))+'</p>';
    node.addEventListener('click',()=>{state.focus=lens.id;renderMap();});
    els.mapNodes.appendChild(node);
  });

  const focused=lensById.get(state.focus)||selected[0];
  if(focused){
    els.mapDetail.innerHTML=
      '<div><span class="detail-label">Focused lens</span><h3>'+esc(focused.name)+'</h3></div>'+
      '<div><span class="detail-label">Question this lens brings</span><p>'+esc(topicQuestion(focused))+'</p></div>';
  }
}

function cardMarkup(lens){
  return '<article class="lens-card" style="--lens-accent:'+esc(lens.accent||'#557b68')+'">'+
    '<span class="lens-type">'+esc(lens.type)+'</span>'+
    '<h3>'+esc(lens.name)+'</h3>'+
    '<p class="lens-question">'+esc(topicQuestion(lens))+'</p>'+
    '<dl>'+
      '<dt>Source in brief</dt><dd>'+esc(lens.summary)+'</dd>'+
      '<dt>What it illuminates</dt><dd>'+esc(lens.illuminates)+'</dd>'+
      '<dt>Boundary / blind spot</dt><dd>'+esc(lens.limit)+'</dd>'+
    '</dl>'+
    '<a href="'+esc(lens.url)+'" target="_blank" rel="noopener noreferrer">Read '+esc(lens.source)+' ↗</a>'+
  '</article>';
}
function renderCompare(){
  els.compare.innerHTML=activeLenses().map(cardMarkup).join('');
}
function renderMatrix(){
  els.matrix.innerHTML=activeLenses().map(lens=>
    '<tr>'+
      '<td>'+esc(lens.short||lens.name)+'</td>'+
      '<td>'+esc(topicQuestion(lens))+'</td>'+
      '<td>'+esc(lens.illuminates)+'</td>'+
      '<td>'+esc(lens.limit)+'</td>'+
    '</tr>'
  ).join('');
}

function renderSynthesis(){
  const selected=activeLenses();
  const counts=new Map();
  selected.forEach(l=>(l.focus||[]).forEach(tag=>counts.set(tag,(counts.get(tag)||0)+1)));
  const repeated=[...counts.entries()].filter(([,n])=>n>1).sort((a,b)=>b[1]-a[1]).map(([tag])=>tag);
  const fallback=[...counts.keys()].slice(0,4);
  const tags=(repeated.length?repeated:fallback).slice(0,5);

  els.sharedTags.innerHTML=tags.map(t=>'<span class="focus-tag">'+esc(t)+'</span>').join('');
  els.sharedCopy.textContent=repeated.length
    ? 'More than one selected lens returns to these concerns. That is overlap, not proof that the traditions mean the same thing by them.'
    : 'This stack has little repeated vocabulary. That is useful: the selected lenses are pulling the question in genuinely different directions.';

  const questions=selected.map(l=>(l.short||l.name)+': '+topicQuestion(l));
  els.different.textContent=questions.join(' · ');

  const limits=selected.map(l=>(l.short||l.name)+' — '+l.limit);
  els.boundary.textContent=limits.join(' · ');
}

function renderSources(){
  els.sourceGrid.innerHTML=lenses.map(l=>
    '<article class="source-item">'+
      '<a href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer">'+esc(l.source)+' ↗</a>'+
      '<small>'+esc(l.type)+'</small>'+
      '<p>'+esc(l.summary)+'</p>'+
    '</article>'
  ).join('');
}

function renderView(){
  $$('[data-view-panel]').forEach(panel=>{
    panel.hidden=panel.dataset.viewPanel!==state.view;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','view-tab-'+panel.dataset.viewPanel);
  });
  $$('.view-button').forEach(btn=>{
    const active=btn.dataset.view===state.view;
    btn.classList.toggle('is-active',active);
    btn.setAttribute('aria-selected',active?'true':'false');btn.tabIndex=active?0:-1;btn.id='view-tab-'+btn.dataset.view;btn.setAttribute('aria-controls',btn.dataset.view+'-view');
  });
}

function render(){
  if(!state.selected.includes(state.focus)) state.focus=state.selected[0];
  renderTopics();
  renderLensControls();
  renderQuestion();
  renderMap();
  renderCompare();
  renderMatrix();
  renderSynthesis();
  renderView();
  syncHash();
  els.shareStatus.textContent='';
}

const viewButtons=$$('.view-button');viewButtons.forEach((btn,i)=>{
  btn.addEventListener('keydown',e=>{let j;if(e.key==='ArrowRight')j=(i+1)%viewButtons.length;else if(e.key==='ArrowLeft')j=(i+viewButtons.length-1)%viewButtons.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=viewButtons.length-1;else return;e.preventDefault();state.view=viewButtons[j].dataset.view;renderView();syncHash();viewButtons[j].focus()});
  btn.addEventListener('click',()=>{
    state.view=btn.dataset.view;
    renderView();
    syncHash();
  });
});

$('#copy-link').addEventListener('click',async()=>{
  syncHash();
  try{
    await navigator.clipboard.writeText(location.href);
    els.shareStatus.textContent='View link copied.';
  }catch{
    els.shareStatus.textContent='Copy the URL from the address bar.';
  }
});
$('#reset-view').addEventListener('click',()=>{
  state.topic=0;
  state.selected=['catholic','empirical','care'];
  state.view='map';
  state.focus='catholic';
  render();
});

const noteKey='seer-convergence-reflection-v2';
function notePayload(){
  return {
    evidence:els.notes.evidence.value,
    value:els.notes.value.value,
    open:els.notes.open.value
  };
}
try{
  const saved=JSON.parse(localStorage.getItem(noteKey)||'null');
  if(saved){
    els.notes.evidence.value=saved.evidence||'';
    els.notes.value.value=saved.value||'';
    els.notes.open.value=saved.open||'';
    els.noteStatus.textContent='Restored a note saved on this browser.';
  }
}catch{}

$('#save-note').addEventListener('click',()=>{
  try{
    localStorage.setItem(noteKey,JSON.stringify(notePayload()));
    els.noteStatus.textContent='Saved on this browser only.';
  }catch{
    els.noteStatus.textContent='Browser storage is unavailable. Download the note instead.';
  }
});
$('#clear-note').addEventListener('click',()=>{
  Object.values(els.notes).forEach(el=>el.value='');
  try{localStorage.removeItem(noteKey);}catch{}
  els.noteStatus.textContent='Note cleared.';
});
$('#export-note').addEventListener('click',()=>{
  const selected=activeLenses();
  const payload=notePayload();
  const text=[
    '# Convergence reflection',
    '',
    '## Question',
    scenarios[state.topic].title,
    '',
    '## Lens stack',
    selected.map(l=>'- '+l.name).join('\n'),
    '',
    '## Evidence I would need',
    payload.evidence,
    '',
    '## A value I would protect',
    payload.value,
    '',
    '## What remains open',
    payload.open,
    '',
    '## View',
    location.href
  ].join('\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/markdown'}));
  const a=document.createElement('a');
  a.href=url;
  a.download='convergence-reflection.md';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),800);
  els.noteStatus.textContent='Download prepared.';
});

renderSources();
render();
})();