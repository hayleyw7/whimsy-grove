import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync('dist/index.html','utf8'),source=readFileSync('public/welcome.js','utf8');
const setup=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][1][1];
function classes(){const values=new Set();return{values,contains:x=>values.has(x),add:x=>values.add(x),remove:x=>values.delete(x),toggle:(x,on)=>on?values.add(x):values.delete(x)};}
for(const [reduced,preference,expected] of [[false,null,true],[true,null,false],[false,false,false],[true,true,true],[false,true,true]]){
 const classList=classes();let fallback;
 vm.runInNewContext(setup,{document:{documentElement:{classList}},window:{},matchMedia:()=>({matches:reduced}),localStorage:{getItem:()=>JSON.stringify(preference)},setTimeout:fn=>{fallback=fn;}});
 assert.equal(classList.contains('welcome-loading'),expected);
 if(fallback){fallback();assert(!classList.contains('welcome-loading'),'Script failure timeout reveals artwork');}
}
async function entrance(mode){
 const classList=classes();classList.add('welcome-loading');let decoded=0,loaded=0;
 const timers=[],revealOrder=['ghost','fern','mushroom','cat','alien','bunny','lantern'],revealDelays=[0,350,700,1050,1400,1750,2100];
 const sprites=[['fern',350],['mushroom',700],['cat',1050],['bunny',1750],['alien',1400],['ghost',0],['lantern',2100]].map(([name,arrival])=>({name,arrival,classList:classes()}));
 let visibility;const document={hidden:false,getElementById:()=>null,documentElement:{classList},querySelectorAll:()=>sprites,addEventListener:(type,fn)=>{if(type==='visibilitychange')visibility=fn;}};
 const context={document,window:{welcomeRevealTimer:1,addEventListener(){},matchMedia:()=>({matches:mode==='reduced'||mode==='override-reduced',addEventListener(){}})},getComputedStyle:sprite=>({backgroundImage:'url("assets/sheet.webp")',getPropertyValue:()=>sprite.arrival+'ms'}),matchMedia:()=>({matches:mode==='reduced'||mode==='override-reduced',addEventListener(){}}),localStorage:{getItem:()=>mode==='override-reduced'?'true':'null'},clearTimeout(){},setTimeout(fn,ms){timers.push({fn,ms});if(mode==='stalled'||mode==='uncached'&&ms===5)queueMicrotask(fn);return timers.length;},Image:class{set src(value){loaded++;if(mode==='stalled')return;const done=()=>mode==='failed'?this.onerror():this.onload();if(mode==='uncached')setTimeout(done,5);else queueMicrotask(done);}async decode(){decoded++;if(mode==='decode-failed')throw Error('decode');}}};
 await vm.runInNewContext('(async()=>{'+source+'})()',context);
 assert(!classList.contains('welcome-loading'));
 assert.equal(classList.contains('welcome-enter'),mode!=='reduced');
 assert.equal(loaded,1,'Shared sprite sheets loaded once');
 if(mode==='cached'||mode==='uncached')assert.equal(decoded,1);
 const revealTimers=timers.filter(timer=>revealDelays.includes(timer.ms)).sort((a,b)=>a.ms-b.ms);
 if(mode==='reduced')assert.deepEqual(timers.map(timer=>timer.ms),[2500],'Reduced motion skips the stagger');
 else assert.deepEqual(revealTimers.map(timer=>timer.ms),revealDelays,`${mode}: each sprite is scheduled at a 350 ms interval`);
 if(mode==='cached'){
  assert.equal(sprites.filter(sprite=>sprite.classList.contains('is-visible')).length,0);
  for(let i=0;i<revealTimers.length;i++){
   revealTimers[i].fn();
   const visible=sprites.filter(sprite=>sprite.classList.contains('is-visible')).sort((a,b)=>a.arrival-b.arrival).map(sprite=>sprite.name);
   assert.deepEqual(visible,revealOrder.slice(0,i+1),`Reveal ${i+1} follows the requested order`);
  }
 }
 document.hidden=true;visibility();assert(classList.contains('welcome-paused'));document.hidden=false;visibility();assert.equal(classList.contains('welcome-paused'),mode==='reduced');
}
for(const mode of ['cached','uncached','failed','decode-failed','stalled','reduced','override-reduced'])await entrance(mode);
assert(html.includes('.welcome-loading .sprite,.welcome-enter .sprite{opacity:0;translate:0 9px;transition:opacity .34s ease-out,translate .42s cubic-bezier(.2,.7,.2,1)}.welcome-enter .sprite.is-visible{opacity:1;translate:0 0}'));assert(source.includes("setTimeout(()=>sprite.classList.add('is-visible'),Number.isFinite(delay)?delay:0)"));
assert(html.includes('aria-hidden="true"'));
console.log('PASS: welcome entrance preferences, decode, repeated fresh entrances, asset failure and bounded timeout fallback');

assert(html.includes('.ghost{--arrival:0ms}.fern{--arrival:350ms}.mushroom{--arrival:700ms}.cat{--arrival:1050ms}.alien{--arrival:1400ms}.bunny{--arrival:1750ms}.lantern{--arrival:2100ms}'));assert(!html.includes('class="sprite bone"'));assert(!html.includes('props-bones-v5.webp'));assert(html.includes('ghost-float 6s'));assert(html.includes('lantern-glow 3.6s'));assert(html.includes('.welcome-paused .ghost,.welcome-paused .lantern::after{animation-play-state:paused}'));console.log('PASS: ghost last, independent entrance/float transforms, soft lantern glow, hidden-tab pause');

assert(html.includes('width:min(84vw,19rem)'));assert(!html.includes('48svh'));assert(!html.includes('35svh'));console.log('PASS: welcome artwork uses zoom-scalable size without viewport-height compensation');
{
 const classList=classes();classList.add('welcome-loading');let visibility,twitches=0,paused=0,scheduled=[];
 const ear={querySelector:()=>({beginElement:()=>twitches++}),pauseAnimations:()=>paused++,unpauseAnimations(){}};
 const doc={hidden:false,documentElement:{classList},getElementById:()=>ear,querySelectorAll:()=>[],addEventListener:(_event,fn)=>visibility=fn};
 await vm.runInNewContext('(async()=>{'+source+'})()',{document:doc,window:{welcomeRevealTimer:1,addEventListener(){}},matchMedia:()=>({matches:false}),getComputedStyle(){},Image:class{},setTimeout:(fn,delay)=>{scheduled.push({fn,delay});return scheduled.length;},clearTimeout(){},Math});
 assert(scheduled.at(-1).delay===2500);
 scheduled.at(-1).fn();assert.equal(twitches,1);
 doc.hidden=true;visibility();assert.equal(paused,1);assert(classList.contains('welcome-paused'));
 assert(html.includes('begin="indefinite" values="0;12;0;8;0"'));assert.equal(scheduled[0].delay,2500,'first twitch keeps its current schedule while timing remains under discussion');
 assert(scheduled.at(-1).delay>=6000&&scheduled.at(-1).delay<=9000);
 console.log('PASS: first ear twitch arrives promptly, then repeats and pauses when hidden');
}

assert(html.includes(".ghost{--arrival:0ms}.fern{--arrival:350ms}.mushroom{--arrival:700ms}.cat{--arrival:1050ms}.alien{--arrival:1400ms}.bunny{--arrival:1750ms}.lantern{--arrival:2100ms}"));assert(html.includes(".welcome-enter .ghost.is-visible{animation:ghost-float 6s ease-in-out infinite}"));console.log("PASS: each item is revealed every 350 ms in ghost-to-lantern order");
