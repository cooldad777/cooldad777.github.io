/* GPT-6 independent SEE,R field guide — no network analytics, no stored personal data. */
(()=>{'use strict';
  document.body.classList.add('fg-ready');
  const nav=document.querySelector('.fg-nav');
  if(nav){
    const menu=nav.querySelector('.fg-menu'), links=nav.querySelector('.fg-navlinks');
    if(menu&&links){
      const shut=(returnFocus=false)=>{links.classList.remove('open');menu.setAttribute('aria-expanded','false');if(returnFocus)menu.focus();};
      menu.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
      nav.addEventListener('keydown',e=>{if(e.key==='Escape'){shut(true);}});
      document.addEventListener('click',e=>{if(!nav.contains(e.target))shut()});
      links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>shut()));
    }
    nav.querySelectorAll('.fg-navlinks a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page')});
  }
  const mapped={
    work:{name:'SEER Solutions',kind:'Independent professional practice',description:'A business question becomes a scoped evidence request, a validation process, and a decision a human can own. Employer work and client information are not part of this public site.',url:'/seersolutions/index.html',cta:'Enter the practice'},
    research:{name:'S33R Human Signal',kind:'Public research',description:'When memory becomes durable and models sound persuasive, whose instruction is being followed? Questions about observed model behavior, information boundaries, and the human right to correct.',url:'/seersolutions/s33r/index.html',cta:'Explore the research'},
    worldview:{name:'Convergence',kind:'Worldview and exponential-tech inquiry',description:'Compare claims about belief, future expectations and technological change. Keep source, interpretation and personal conviction distinct.',url:'/convergence/index.html',cta:'Enter Convergence'},
    lenses:{name:'Lenses',kind:'General comparison instrument',description:'Put several perspectives around a single question without forcing them into one answer. A workbench, not a verdict.',url:'/lenses/index.html',cta:'Open the workbench'},
    faith:{name:'GROUNDED',kind:'Christian formation',description:'Scripture, prayer, real people and practiced attention. Not a generic digital-wellness campaign and not scientific proof of a theology.',url:'/grounded/index.html',cta:'See the practice'},
    music:{name:'Adventure Within',kind:'Original improvisational music',description:'Guitar, improvisation, original recordings, room for a mistake to become something interesting. Not every part of life needs to turn into a method.',url:'/adventure/index.html',cta:'Hear the music'}
  };
  document.querySelectorAll('[data-fg-map]').forEach(el=>{
    const detail=el.querySelector('[data-fg-detail]'), nodes=[...el.querySelectorAll('[data-fg-place]')];
    if(!detail||!nodes.length)return;
    const title=detail.querySelector('h3'),desc=detail.querySelector('p'),kind=detail.querySelector('[data-fg-kind]'),a=detail.querySelector('a');
    const select=(key,focus=false)=>{
      const record=mapped[key];if(!record)return;
      nodes.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fgPlace===key)));
      if(title)title.textContent=record.name;
      if(desc)desc.textContent=record.description;
      if(kind)kind.textContent=record.kind;
      if(a){a.href=record.url;a.textContent=record.cta+' ↗'}
      if(focus)title?.focus();
    };
    nodes.forEach(b=>b.addEventListener('click',()=>select(b.dataset.fgPlace)));
    const first=nodes.find(b=>b.getAttribute('aria-pressed')==='true')||nodes[0];select(first.dataset.fgPlace);
  });
  const outcomes={
    assume:{title:'A confident answer can hide a missing permission.',body:'The assistant guesses which personal records matter, retrieves them across unrelated scopes, and presents a polished answer. It may look helpful. The missing step is whether the user authorized this context to be used here.',limit:'This fictional failure illustrates a question for testing. It is not evidence that any particular product behaves this way.',next:'What information was in scope? Who approved it?'},
    ask:{title:'A clarifying question protects the boundary.',body:'Before retrieval, the assistant asks which project and time period the user means. It avoids introducing unrelated private information and returns the choice of what matters to the person.',limit:'Asking first is one possible behavior, not proof of a reliable technical enforcement system.',next:'Would the model follow the rule across sessions and different prompts?'},
    refuse:{title:'Sometimes the useful answer is to stop.',body:'When a request lacks authorization for another person’s records, the assistant does not infer or expose them. It offers a safe way to continue from information the person can provide or has permission to use.',limit:'A textual refusal is not a substitute for access controls, audit logs or independent testing.',next:'Could the same boundary be bypassed with a paraphrased request?'}
  };
  document.querySelectorAll('[data-fg-lab]').forEach(el=>{
    const buttons=[...el.querySelectorAll('[data-fg-choice]')],result=el.querySelector('[data-fg-result]');
    if(!result)return;
    const heading=result.querySelector('h3'),description=result.querySelector('p'),limitation=result.querySelector('[data-fg-limit]'),question=result.querySelector('[data-fg-question]');
    function choose(key){
      const v=outcomes[key];if(!v)return;
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fgChoice===key)));
      if(heading)heading.textContent=v.title;
      if(description)description.textContent=v.body;
      if(limitation)limitation.textContent=v.limit;
      if(question)question.textContent=v.next;
    }
    buttons.forEach(b=>b.addEventListener('click',()=>choose(b.dataset.fgChoice)));
    choose(buttons.find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.fgChoice||'ask');
  });
})();
