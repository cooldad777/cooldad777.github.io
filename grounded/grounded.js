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

const map=document.querySelector('.formation-map');
const mapItems=map?[...map.querySelectorAll('.map-item')]:[];
const storySections=[...document.querySelectorAll('[data-map-key]')];
function setMapActive(key){
  mapItems.forEach(item=>{
    const active=item.dataset.mapTarget===key;
    item.classList.toggle('is-active',active);
    item.setAttribute('aria-expanded',active?'true':'false');
  });
}
mapItems.forEach(item=>{
  item.addEventListener('click',()=>{
    if(window.matchMedia('(max-width: 900px)').matches && item.classList.contains('is-active') && !map.classList.contains('is-open')){
      map.classList.add('is-open');
      return;
    }
    if(map) map.classList.remove('is-open');
    const target=document.getElementById(item.dataset.mapTarget);
    if(target) target.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  });
});
if(map&&storySections.length&&'IntersectionObserver'in window){
  const sectionObserver=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
    if(visible.length){
      setMapActive(visible[0].target.dataset.mapKey);
      if(window.matchMedia('(max-width: 900px)').matches) map.classList.remove('is-open');
    }
  },{rootMargin:'-18% 0px -55% 0px',threshold:[0,.15,.35,.6]});
  storySections.forEach(section=>sectionObserver.observe(section));
}
document.addEventListener('click',e=>{
  if(map&&map.classList.contains('is-open')&&!map.contains(e.target)){
    map.classList.remove('is-open');
  }
});

})();