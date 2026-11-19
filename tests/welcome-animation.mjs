import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync('dist/index.html','utf8'),source=readFileSync('public/welcome.js','utf8');
const setup=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][1][1];
function classes(){const values=new Set();return{values,contains:x=>values.has(x),add:x=>values.add(x),remove:x=>values.delete(x),toggle:(x,on)=>on?values.add(x):values.delete(x)};}
for(const reduced of [false,true]){
 const classList=classes();let fallback,delay;
 vm.runInNewContext(setup,{document:{documentElement:{classList}},window:{},matchMedia:()=>({matches:reduced}),setTimeout:(fn,ms)=>{fallback=fn;delay=ms;}});
 assert(classList.contains('welcome-waiting'));assert.equal(classList.contains('welcome-static'),reduced);
 assert.equal(delay,1700);
 fallback();assert(!classList.contains('welcome-waiting'),'If the module is unavailable, the primary action still appears');
 assert.equal(classList.contains('welcome-no-art'),true,'Fallback does not show a late illustration');
}
async function firstPaint(mode){
 const reduced=mode.startsWith('reduced'),classList=classes();
 classList.add('welcome-waiting');if(reduced)classList.add('welcome-static');
 const timers=[],sprites=['ready','ready','other'].map(name=>({name,classList:classes()}));let loaded=0,decoded=0,lateImage;
 const document={hidden:false,getElementById:()=>null,documentElement:{classList},querySelectorAll:()=>sprites,addEventListener(){}};
 const delay=1700;
 const window={welcomeRevealTimer:1,welcomeRevealDeadline:delay,addEventListener(){},matchMedia:()=>({matches:reduced,addEventListener(){}})};
 const context={Date:{now:()=>0},document,window,getComputedStyle:sprite=>({backgroundImage:'url("assets/'+sprite.name+'.webp")'}),localStorage:{getItem:()=>null},clearTimeout(){},setTimeout(fn,ms){timers.push({fn,ms});if(mode.includes('stalled')&&ms===delay)setImmediate(fn);return timers.length;},Image:class{set src(value){loaded++;if(value.includes('other')&&mode.includes('stalled')){lateImage=this;return;}queueMicrotask(()=>value.includes('other')&&mode.includes('failed')?this.onerror():this.onload());}async decode(){decoded++;}}};
 await vm.runInNewContext('(async()=>{'+source+'})()',context);
 assert(!classList.contains('welcome-waiting'));
 assert(classList.contains('welcome-ambient'));
 assert(!classList.contains('welcome-stagger'));
 assert.equal(classList.contains('welcome-paused'),reduced);
 assert.equal(sprites[2].classList.contains('welcome-sheet-missing'),!mode.endsWith('cached'));
 assert(!sprites[0].classList.contains('welcome-sheet-missing'));
 if(lateImage){await lateImage.onload();assert(sprites[2].classList.contains('welcome-sheet-missing'),'late art stays hidden after reveal');}
 assert.equal(loaded,2,'Shared sprite sheet is fetched once');
 assert.deepEqual(timers.map(t=>t.ms),[1700]);
 if(mode==='cached')assert.equal(decoded,2);
}
for(const mode of ['cached','failed','stalled','reduced-cached','reduced-failed','reduced-stalled'])await firstPaint(mode);
assert(html.includes('.welcome-waiting main,.welcome-no-art .grove,.welcome-sheet-missing{visibility:hidden}'));
assert.equal((html.match(/rel="preload" as="image" href="assets\//g)||[]).length,6);
assert(html.includes('width:min(84vw,19rem)'));assert(html.includes('aspect-ratio:290/160'));
assert(!/is-visible|translate:0 9px|welcome-enter|welcome-fade|welcome-stagger|--arrival/.test(html));
assert(html.includes('.welcome-handoff #welcomeStartup img{animation:welcome-loader-wiggle 2.2s ease-in-out infinite}'));
assert(html.includes('ghost-float 6s'));assert(html.includes('lantern-glow 3.6s'));
assert(html.includes('begin="indefinite" values="0;12;0;8;0"'));
console.log('PASS: welcome art and controls reveal together without entrance animation, with a bounded failure fallback and separate ambient effects.');

const editorCss=readFileSync('public/style.css','utf8');
for(const [role,value] of [['--ui-primary-fill','#8b567c'],['--ui-primary-ink','#fff'],['--ui-focus-ring','#e6b8ed']]){
 assert(editorCss.includes(role+':'+value+';'));assert(html.includes(role+':'+value));
}
assert(html.includes('min-height:56px;padding:12px 34px'));
assert(html.includes('.button:hover{filter:brightness(1.1)}'));
assert(html.includes('.button:focus-visible{outline:3px solid var(--ui-focus-ring);outline-offset:3px}'));
