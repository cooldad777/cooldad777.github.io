(()=>{'use strict';const nav=document.querySelector('.seer-nav');if(!nav)return;const menu=nav.querySelector('.seer-menu'),links=nav.querySelector('#seer-links');const close=()=>{links.classList.remove('open');menu.setAttribute('aria-expanded','false')};menu.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});document.addEventListener('click',e=>{if(!nav.contains(e.target))close()});links.querySelectorAll('a').forEach(a=>{if(new URL(a.href).pathname===location.pathname)a.setAttribute('aria-current','page')});
const dialog=document.createElement('dialog');dialog.className='search-dialog';dialog.setAttribute('aria-label','Find a project');dialog.innerHTML='<div class="search-head"><strong>Follow a thread</strong><button type="button" aria-label="Close search">Close ✕</button></div><label for="site-search">Search the public projects</label><input id="site-search" type="search" placeholder="Music, evidence, faith, boundaries…"><div id="search-results" aria-live="polite"></div>';document.body.append(dialog);const input=dialog.querySelector('input'),results=dialog.querySelector('#search-results');let projects=[];function render(){results.replaceChildren();let list=projects.filter(p=>(p.name+' '+p.category+' '+p.description).toLowerCase().includes(input.value.toLowerCase()));for(const p of list){const a=document.createElement('a');a.className='search-result';a.href=p.href;const strong=document.createElement('strong');strong.textContent=p.name;const span=document.createElement('span');span.textContent=p.category+' · '+p.description;a.append(strong,span);results.append(a)}if(!list.length)results.textContent='No matches. Try another word.'}async function open(){close();dialog.showModal();input.focus();if(!projects.length){results.textContent='Loading projects…';try{const r=await fetch('/assets/projects.json');if(!r.ok)throw Error();projects=await r.json()}catch{results.innerHTML='<p>Search is unavailable. <a href="/portfolio/index.html">Browse the portfolio.</a></p>';return}}render()}nav.querySelector('.search-open').addEventListener('click',open);dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});input.addEventListener('input',render);document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!document.activeElement.isContentEditable&&!dialog.open){e.preventDefault();open()}});
// Useful portable outputs without sending private input to a service.
if(location.pathname.includes('anti-attachment')){const pre=document.querySelector('pre');if(pre){const bar=document.createElement('div');bar.className='utility-tools';const copy=document.createElement('button');copy.textContent='Copy boundary profile';const download=document.createElement('button');download.textContent='Download .md';const status=document.createElement('span');status.className='copy-status';status.setAttribute('role','status');copy.onclick=async()=>{try{await navigator.clipboard.writeText(pre.textContent);status.textContent='Copied. Review how each model responds.'}catch{status.textContent='Copy unavailable. Select and copy the profile text below.'}};download.onclick=()=>{const u=URL.createObjectURL(new Blob([pre.textContent],{type:'text/markdown'}));const a=document.createElement('a');a.href=u;a.download='my-ai-boundaries.md';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};bar.append(copy,download,status);pre.before(bar)}}
})();


;(()=>{'use strict';
const nav=document.querySelector('.seer-nav');if(!nav)return;
document.documentElement.classList.add('vnext-enhanced');

// Public REWIND: curated major public epochs only.
const links=nav.querySelector('#seer-links');
const search=links?.querySelector('.search-open');
if(links&&!links.querySelector('.rewind-open')){
  const button=document.createElement('button');
  button.type='button';button.className='rewind-open';button.setAttribute('aria-label','Rewind the public site');
  button.innerHTML='<span aria-hidden="true">↶</span> Rewind';
  if(search)links.insertBefore(button,search);else links.append(button);

  const dialog=document.createElement('dialog');
  dialog.className='rewind-dialog';
  dialog.setAttribute('aria-label','Public REWIND');
  dialog.innerHTML='<div class="rewind-head"><div><span class="rewind-kicker">Public REWIND</span><strong>See the major transitions.</strong><p>Curated public epochs only. Private history stays private.</p></div><button type="button" class="rewind-close" aria-label="Close REWIND">Close ✕</button></div><div class="rewind-epochs" aria-live="polite">Loading epochs…</div><div class="rewind-foot"><a href="/rewind/index.html">Open full REWIND ↗</a><span>Present does not erase the path that produced it.</span></div>';
  document.body.append(dialog);
  const root=dialog.querySelector('.rewind-epochs');
  async function load(){
    try{
      const r=await fetch('/assets/public-epochs.json',{cache:'no-store'});if(!r.ok)throw Error();
      const epochs=await r.json();
      root.replaceChildren();
      epochs.slice().reverse().forEach((e,i)=>{
        const article=document.createElement('article');article.className='rewind-epoch';
        const current=!e.sha;
        const href=current?location.pathname+`${location.search||''}`:`/rewind/snapshots/${e.id}.html`;
        article.innerHTML=`<div class="rewind-index">${String(epochs.length-i).padStart(2,'0')}</div><div><span class="rewind-date">${e.date}</span><h3>${e.title}</h3><p>${e.summary}</p><small>${e.note||''}</small></div><a href="${href}"${current?' aria-current="page"':''}>${current?'Current preview':'Open snapshot'} ↗</a>`;
        root.append(article);
      });
    }catch{root.innerHTML='<p>REWIND index unavailable. The current page is unchanged.</p>'}
  }
  button.addEventListener('click',()=>{dialog.showModal();load()});
  dialog.querySelector('.rewind-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
}

// Scroll state makes the chrome feel lighter without stealing attention.
let ticking=false;
const setScrollState=()=>{nav.classList.toggle('is-scrolled',scrollY>18);ticking=false};
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(setScrollState);ticking=true}},{passive:true});
setScrollState();

// Progressive reveal. Reduced-motion users get the final state immediately.
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const candidates=[...document.querySelectorAll('main > section, main > header, .feature, .door, .project-item, .decision-entry, .surface-card, .g-section, .lens-panel, .synthesis-card')];
candidates.forEach((el,i)=>{el.classList.add('vnext-reveal');el.style.setProperty('--reveal-order',String(Math.min(i,8)))});
if(reduce||!('IntersectionObserver'in window)){candidates.forEach(el=>el.classList.add('is-visible'))}
else{
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.08});
  candidates.forEach(el=>io.observe(el));
}
})();
