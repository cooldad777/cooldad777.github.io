/* SEE,R experience layer — progressive enhancement only. */
(function(){
  "use strict";

  var body=document.body;
  if(!body) return;

  body.classList.add("experience-ready");

  var reduce=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine=window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var glassSelectors=[
    ".world-card",".shelf-card",".surface-card",".lens-card-clean",
    ".research-note",".editor-note",".onramp-box",".service-card",
    ".guard-grid article",".slot",".dim",".fork-node",".fork-paths li",
    ".verse",".stamp"
  ].join(",");

  Array.prototype.forEach.call(document.querySelectorAll(glassSelectors),function(el){
    el.classList.add("xp-lift","xp-glass-hover");
    if(fine){
      el.addEventListener("pointermove",function(ev){
        var r=el.getBoundingClientRect();
        el.style.setProperty("--xp-x",(((ev.clientX-r.left)/r.width)*100).toFixed(1)+"%");
        el.style.setProperty("--xp-y",(((ev.clientY-r.top)/r.height)*100).toFixed(1)+"%");
      },{passive:true});
    }
  });

  var revealSelectors=[
    ".eco-section-head",".world-card",".pace-editorial",".willard-band blockquote",
    ".music-feature .eco-wrap",".shelf-card",".prose > h2",".prose > blockquote",
    ".prose > .research-note",".surface-card",".lens-card-clean",
    ".convergence-onramp .onramp-box",".aw-embed",".aw-short",
    ".tracker-card",".stamp",".service-card",".method-grid > li",
    ".guard-grid > article",".role-panel",".forkfig",".slot",".dim",".rubric > li"
  ].join(",");

  var reveal=Array.prototype.slice.call(document.querySelectorAll(revealSelectors));
  reveal.forEach(function(el,i){
    el.classList.add("story-reveal");
    el.setAttribute("data-xp-delay",String((i%4)+1));
  });

  if(!reduce && "IntersectionObserver" in window){
    body.classList.add("experience-motion");
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },{rootMargin:"0px 0px -8% 0px",threshold:.08});
    reveal.forEach(function(el){io.observe(el);});
  }else{
    reveal.forEach(function(el){el.classList.add("is-visible");});
  }

  var hero=document.querySelector(".eco-hero, .hero, .shelf-hero, .hub-hero");
  if(hero){
    hero.classList.add("xp-hero");
    if(!reduce){
      var ticking=false;
      function paintHero(){
        var rect=hero.getBoundingClientRect();
        var shift=Math.max(-20,Math.min(20,-rect.top*.035));
        hero.style.setProperty("--xp-hero-shift",shift.toFixed(1)+"px");
        ticking=false;
      }
      window.addEventListener("scroll",function(){
        if(!ticking){
          window.requestAnimationFrame(paintHero);
          ticking=true;
        }
      },{passive:true});
      paintHero();
    }
  }

  // Keep complex Convergence state changes visually legible.
  var board=document.getElementById("board");
  if(board && "MutationObserver" in window && !reduce){
    var mo=new MutationObserver(function(){
      var inner=board.firstElementChild;
      if(!inner) return;
      inner.style.animation="none";
      void inner.offsetWidth;
      inner.style.animation="";
    });
    mo.observe(board,{childList:true});
  }
})();