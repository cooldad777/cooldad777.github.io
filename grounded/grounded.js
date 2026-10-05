(()=>{'use strict';
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals=[...document.querySelectorAll('.grounded-reveal')];
if(reduce||!('IntersectionObserver'in window)){reveals.forEach(el=>el.classList.add('in'));}else{
  const io=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');io.unobserve(entry.target);}})},{threshold:.08,rootMargin:'0px 0px -7% 0px'});
  reveals.forEach(el=>io.observe(el));
}
const counters=[...document.querySelectorAll('[data-count]')];
function format(el,v){
  const decimals=Number(el.dataset.decimals||0);
  const prefix=el.dataset.prefix||'';
  const suffix=el.dataset.suffix||'';
  return prefix+Number(v).toFixed(decimals)+suffix;
}
function run(el){
  if(el.dataset.ran)return;el.dataset.ran='1';
  const target=Number(el.dataset.count);
  if(reduce){el.textContent=format(el,target);return;}
  const start=performance.now(),duration=900;
  function tick(now){const t=Math.min(1,(now-start)/duration);const eased=1-Math.pow(1-t,3);el.textContent=format(el,target*eased);if(t<1)requestAnimationFrame(tick);else el.textContent=format(el,target);}
  requestAnimationFrame(tick);
}
if('IntersectionObserver'in window&&!reduce){
  const nio=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){run(e.target);nio.unobserve(e.target);}})},{threshold:.45});
  counters.forEach(el=>nio.observe(el));
}else counters.forEach(run);
})();