(()=>{'use strict';
const list=document.querySelector('#epoch-list'),frame=document.querySelector('#epoch-frame'),name=document.querySelector('#epoch-name'),date=document.querySelector('#epoch-date'),summary=document.querySelector('#epoch-summary'),source=document.querySelector('#epoch-source');
let epochs=[];
function select(id){
  const e=epochs.find(x=>x.id===id&&x.sha)||epochs.filter(x=>x.sha).at(-1);if(!e)return;
  document.querySelectorAll('.epoch-button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.epoch===e.id)));
  name.textContent=e.title;date.textContent=e.label+' · '+e.date;summary.textContent=e.summary;
  source.href='https://github.com/cooldad777/cooldad777.github.io/tree/'+e.sha;
  frame.src='/rewind/snapshots/'+e.id+'.html';
  history.replaceState(null,'','#'+e.id);
}
async function init(){
  try{const r=await fetch('/assets/public-epochs.json',{cache:'no-store'});epochs=await r.json()}
  catch{list.textContent='REWIND index unavailable.';return}
  const historical=epochs.filter(e=>e.sha);
  historical.forEach((e,i)=>{const b=document.createElement('button');b.className='epoch-button';b.type='button';b.dataset.epoch=e.id;b.setAttribute('aria-pressed','false');b.innerHTML='<span class="n">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+e.title+'</strong><small>'+e.date+' · '+e.label.replace(/^.*·\s*/,'')+'</small></span>';b.onclick=()=>select(e.id);list.append(b)});
  select(location.hash.slice(1)||historical.at(-1)?.id);
}
init();
})();