(async()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s);
const fmtM=n=>n>=1000?(n/1000).toFixed(1).replace(/\.0$/,'')+'B':n+'M';
const palette={
  christianity:'#8ea98f',
  islam:'#78a288',
  unaffiliated:'#a6afb8',
  hinduism:'#d4a15e',
  buddhism:'#91b3c5',
  'other-religions':'#b69a78',
  judaism:'#6f91b7'
};
let data;
try{
  const r=await fetch('worldviews.json',{cache:'no-store'});
  if(!r.ok) throw new Error('load');
  data=await r.json();
}catch{
  $('#atlas').innerHTML='<div class="conv-wrap"><p>The worldview data could not load. Refresh the page.</p></div>';
  return;
}
const root=data.root;
const byId=new Map();
function index(node,parent=null){
  node.parent=parent;
  byId.set(node.id,node);
  (node.children||[]).forEach(c=>index(c,node));
}
index(root);

let path=[root,byId.get('christianity'),byId.get('protestant')];

function lineage(node){
  const arr=[];
  let cur=node;
  while(cur){arr.unshift(cur);cur=cur.parent;}
  return arr;
}
function select(node){
  path=lineage(node);
  render();
  requestAnimationFrame(()=>{
    const cols=$('#branch-columns');
    if(cols) cols.scrollTo({left:cols.scrollWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });
}
function sourceFor(node){
  if(node.share_world!=null || (node.parent&&node.parent.id==='world')) return data.topLevelSource;
  if(node.pop_year===2010 || (node.parent&&node.parent.id==='christianity')) return data.christianSource;
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
  const kids=root.children||[];
  const bar=$('#population-bar');
  const legend=$('#population-legend');
  bar.innerHTML='';
  legend.innerHTML='';
  kids.forEach(node=>{
    const share=node.share_world||0.2;
    const color=palette[node.id]||'#9ca9a1';
    const seg=document.createElement('button');
    seg.type='button';
    seg.className='population-segment'+(path.some(p=>p.id===node.id)?' is-active':'');
    seg.style.flex=String(share)+' 1 0';
    seg.style.background=color;
    seg.title=node.name+' · '+share+'%';
    seg.innerHTML=share>=4.5?'<span>'+node.name+'<br>'+share+'%</span>':'';
    seg.onclick=()=>select(node);
    bar.appendChild(seg);

    const key=document.createElement('button');
    key.type='button';
    key.className='population-key';
    key.style.setProperty('--key',color);
    key.innerHTML='<i></i><strong>'+node.name+'</strong> '+share+'%';
    key.onclick=()=>select(node);
    legend.appendChild(key);
  });
  $('#source-summary').innerHTML='Top-level shares use <a href="'+data.topLevelSource.url+'" target="_blank" rel="noopener">Pew Research Center’s 2020 global estimates</a>. Christians were 28.8% of the world, Muslims 25.6%, the unaffiliated 24.2%, Hindus 14.9%, Buddhists 4.1%, other religions 2.2%, and Jews about 0.2%.';
}
function renderBreadcrumbs(){
  const box=$('#breadcrumbs');
  box.innerHTML='';
  path.forEach((node,i)=>{
    if(i){const sep=document.createElement('span');sep.className='crumb-sep';sep.textContent='›';box.appendChild(sep);}
    const b=document.createElement('button');
    b.type='button';
    b.className='crumb';
    b.textContent=node.name;
    b.onclick=()=>select(node);
    box.appendChild(b);
  });
}
function childLabel(node){
  if(node.share_world!=null) return node.share_world+'% of world';
  if(node.share_parent!=null) return node.share_parent+'% of Christians';
  if(node.children&&node.children.length) return node.children.length+' branches';
  return node.kind||'branch';
}
function renderColumns(){
  const shell=$('#branch-columns');
  shell.innerHTML='';
  const cols=[];
  cols.push({parent:root,label:'World',children:root.children||[]});
  for(let i=1;i<path.length;i++){
    const parent=path[i];
    if(parent.children&&parent.children.length) cols.push({parent,label:parent.name,children:parent.children});
  }
  cols.forEach((col,idx)=>{
    const div=document.createElement('section');
    div.className='branch-column';
    const selectedNext=path[idx+1];
    div.innerHTML='<div class="column-head"><span>'+(idx===0?'Major identities':'Inside')+'</span><h3>'+col.label+'</h3></div><div class="branch-list"></div>';
    const list=$('.branch-list',div);
    if(!col.children.length){
      list.innerHTML='<p class="branch-empty">No deeper branch is mapped yet.</p>';
    }else{
      col.children.forEach(node=>{
        const b=document.createElement('button');
        b.type='button';
        b.className='branch-node'+(selectedNext&&selectedNext.id===node.id?' is-selected':'')+(node.featured?' is-featured':'');
        const pct=node.share_world!=null?node.share_world:(node.share_parent!=null?node.share_parent:null);
        b.innerHTML='<strong>'+node.name+'</strong><small>'+childLabel(node)+'</small>'+
          (pct!=null?'<div class="mini-bar"><b style="width:'+Math.min(100,pct)+'%"></b></div>':'')+
          ((node.children&&node.children.length)?'<span class="chev">›</span>':'');
        b.onclick=()=>select(node);
        list.appendChild(b);
      });
    }
    shell.appendChild(div);
  });
}
function renderDetail(){
  const node=path[path.length-1];
  const src=sourceFor(node);
  $('#node-detail').innerHTML=
    '<div><span class="detail-meta">'+(node.kind||'node')+'</span><h3>'+node.name+'</h3><div class="detail-stat">'+statHtml(node)+'</div></div>'+
    '<div><p>'+((node.summary||node.description)||'')+'</p>'+
      (node.children&&node.children.length?'<p style="margin-top:10px">'+node.children.length+' mapped branches. Select one to continue.</p>':'')+
      (src?'<p class="detail-source">Population source: <a href="'+src.url+'" target="_blank" rel="noopener">'+src.label+'</a>. '+src.note+'</p>':'<p class="detail-source">This level is a structural orientation map, not a population estimate.</p>')+
    '</div>';
}
function render(){
  renderPopulation();
  renderBreadcrumbs();
  renderColumns();
  renderDetail();
}
$('#world-reset').onclick=()=>{path=[root];render();};
$('#christian-jump').onclick=()=>{path=[root,byId.get('christianity'),byId.get('protestant')];render();requestAnimationFrame(()=>$('#branch-columns').scrollTo({left:$('#branch-columns').scrollWidth,behavior:'smooth'}));};
render();
})();