// GPT-6 public independent candidate — dependency-free static QA.
// Run: node scripts/verify-gpt6-public.mjs
// This is NOT a substitute for iOS Safari, screen reader or visual browser QA.
import {readFileSync,existsSync,statSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const htmls=['index.html','field-study/index.html','rewind/index.html','portfolio/index.html','convergence/index.html','seersolutions/s33r/index.html'];
const jss=['assets/gpt6-fieldguide.js','assets/navigation.js'];
const csses=['assets/gpt6-fieldguide.css','assets/gpt6-bridge.css'];
const errors=[];
let links=0,idsChecked=0;
for(const path of htmls){
  let html=readFileSync(join(root,path),'utf8');
  if(!html.includes('name="viewport"'))errors.push(path+': missing viewport');
  let ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);idsChecked+=ids.length;
  let seen=new Set();for(const id of ids){if(seen.has(id))errors.push(path+': duplicate #'+id);seen.add(id)}
  // Paths only. No network calls, no external links, no templating.
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    let url=match[1];if(/^(https?:|mailto:|tel:|data:|#)/.test(url))continue;
    if(url.startsWith('//'))continue;
    let beforeFragment=url.split(/[?#]/)[0];if(!beforeFragment)continue;
    let target=beforeFragment.startsWith('/')?join(root,beforeFragment):join(root,dirname(path),beforeFragment);
    if(!target.startsWith(root)) {errors.push(path+': escapes repository '+url);continue}
    if(existsSync(target)&&statSync(target).isDirectory())target=join(target,'index.html');
    if(!existsSync(target))errors.push(path+': missing local path '+url);
    links++;
  }
}
for(const path of jss){try{new Script(readFileSync(join(root,path),'utf8'),{filename:path})}catch(e){errors.push(path+': '+String(e))}}
for(const path of csses){const css=readFileSync(join(root,path),'utf8');const a=(css.match(/{/g)||[]).length,b=(css.match(/}/g)||[]).length;if(a!==b)errors.push(path+': unbalanced braces '+a+'/'+b)}
if(errors.length){console.error('GPT6 STATIC QA: FAIL');for(const e of errors)console.error(' - '+e);process.exitCode=1}
else console.log('GPT6 STATIC QA: PASS | '+htmls.length+' HTML routes | '+links+' internal references | '+idsChecked+' element IDs | '+jss.length+' JS files | '+csses.length+' CSS files');
