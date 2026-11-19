import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync('dist/index.html','utf8'),source=readFileSync('public/welcome.js','utf8');
const setup=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][1][1];
function classes(){const values=new Set();return{values,contains:x=>values.has(x),add:x=>values.add(x),remove:x=>values.delete(x),toggle:(x,on)=>on?values.add(x):values.delete(x)};}
{
 const classList=classes();let fallback;
 vm.runInNewContext(setup,{document:{documentElement:{classList}},window:{},setTimeout:fn=>{fallback=fn;}});
 assert(classList.contains('welcome-waiting'));
 fallback();assert(!classList.contains('welcome-waiting'),'If the module is unavailable, art still appears');
}
async function firstPaint(mode){
 const classList=classes();classList.add('welcome-waiting');const timers=[],sprites=[{},{}];let loaded=0,decoded=0;
 const document={hidden:false,getElementById:()=>null,documentElement:{classList},querySelectorAll:()=>sprites,addEventListener(){}};
 const window={welcomeRevealTimer:1,addEventListener(){},matchMedia:()=>({matches:mode==='reduced',addEventListener(){}})};
 const context={document,window,getComputedStyle:()=>({backgroundImage:'url("assets/sheet.webp")'}),localStorage:{getItem:()=>null},clearTimeout(){},setTimeout(fn,ms){timers.push(ms);if(mode==='stalled')queueMicrotask(fn);return timers.length;},Image:class{set src(value){loaded++;if(mode!=='stalled')queueMicrotask(()=>mode==='failed'?this.onerror():this.onload());}async decode(){decoded++;}}};
 await vm.runInNewContext('(async()=>{'+source+'})()',context);
 assert(!classList.contains('welcome-waiting'));
 assert(classList.contains('welcome-ambient'));
 assert.equal(loaded,1,'Shared sprite sheets are fetched once');
 assert.deepEqual(timers,[2500], 'No delayed per-sprite entrances');
 if(mode==='cached')assert.equal(decoded,1);
 if(mode==='reduced')assert(classList.contains('welcome-paused'));
}
for(const mode of ['cached','failed','stalled','reduced'])await firstPaint(mode);
assert(html.includes('.welcome-waiting .grove{visibility:hidden}'));
assert(html.includes('width:min(84vw,19rem)'));assert(html.includes('aspect-ratio:290/160'));
assert(!/--arrival|is-visible|translate:0 9px|welcome-enter/.test(html));
assert(html.includes('ghost-float 6s'));assert(html.includes('lantern-glow 3.6s'));
assert(html.includes('begin="indefinite" values="0;12;0;8;0"'));
console.log('PASS: fixed-size welcome artwork reveals all at once with a bounded failure fallback; ambient animation remains separate.');
