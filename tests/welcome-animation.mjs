import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync('dist/index.html','utf8'),source=readFileSync('public/welcome.js','utf8');
const setup=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][1][1];
function classes(){const values=new Set();return{values,contains:x=>values.has(x),add:x=>values.add(x),remove:x=>values.delete(x),toggle:(x,on)=>on?values.add(x):values.delete(x)};}
for(const [reduced,preference,expected] of [[false,null,true],[true,null,false],[false,false,false],[true,true,false],[false,true,true]]){
 const classList=classes();let fallback;
 vm.runInNewContext(setup,{document:{documentElement:{classList}},window:{},matchMedia:()=>({matches:reduced}),localStorage:{getItem:()=>JSON.stringify(preference)},setTimeout:fn=>{fallback=fn;}});
 assert.equal(classList.contains('welcome-loading'),expected);
 if(fallback){fallback();assert(!classList.contains('welcome-loading'),'Script failure timeout reveals artwork');}
}
async function entrance(mode){
 const classList=classes();classList.add('welcome-loading');let decoded=0,loaded=0,delays=[];
 let visibility;const document={hidden:false,getElementById:()=>null,documentElement:{classList},querySelectorAll:()=>[{},{}],addEventListener:(type,fn)=>{if(type==='visibilitychange')visibility=fn;}};const context={document,window:{welcomeRevealTimer:1},getComputedStyle:()=>({backgroundImage:'url("assets/sheet.webp")'}),matchMedia:()=>({matches:mode==='reduced'}),clearTimeout(){},setTimeout(fn,ms){delays.push(ms);if(mode==='stalled')queueMicrotask(fn);return 2;},Image:class{set src(value){loaded++;if(mode==='stalled')return;const done=()=>mode==='failed'?this.onerror():this.onload();if(mode==='uncached')setTimeout(done,5);else queueMicrotask(done);}async decode(){decoded++;if(mode==='decode-failed')throw Error('decode');}}};
 await vm.runInNewContext('(async()=>{'+source+'})()',context);
 assert(!classList.contains('welcome-loading'));
 assert.equal(classList.contains('welcome-enter'),mode!=='reduced');
 assert.equal(loaded,1,'Shared sprite sheets loaded once');
 if(mode==='cached'||mode==='uncached')assert.equal(decoded,1);
 assert.deepEqual(delays,[2500]);document.hidden=true;visibility();assert(classList.contains('welcome-paused'));document.hidden=false;visibility();assert.equal(classList.contains('welcome-paused'),mode==='reduced');
}
for(const mode of ['cached','uncached','failed','decode-failed','stalled','reduced'])await entrance(mode);
assert(html.includes('animation:grove-arrival 420ms ease-out both'));
assert(html.includes('aria-hidden="true"'));
console.log('PASS: welcome entrance preferences, decode, repeated fresh entrances, asset failure and bounded timeout fallback');

assert(html.includes('.ghost{--arrival:600ms}.lantern{--arrival:500ms}'));assert(html.includes('ghost-float 8s'));assert(html.includes('lantern-glow 5s'));assert(html.includes('.welcome-paused .ghost,.welcome-paused .lantern::after{animation-play-state:paused}'));console.log('PASS: ghost last, independent entrance/float transforms, soft lantern glow, hidden-tab pause');

assert(html.includes('width:min(84vw,19rem)'));assert(!html.includes('48svh'));assert(!html.includes('35svh'));console.log('PASS: welcome artwork uses zoom-scalable size without viewport-height compensation');
{
 const classList=classes();classList.add('welcome-loading');let visibility,twitches=0,paused=0,scheduled=[];
 const ear={querySelector:()=>({beginElement:()=>twitches++}),pauseAnimations:()=>paused++,unpauseAnimations(){}};
 const doc={hidden:false,documentElement:{classList},getElementById:()=>ear,querySelectorAll:()=>[],addEventListener:(_event,fn)=>visibility=fn};
 await vm.runInNewContext('(async()=>{'+source+'})()',{document:doc,window:{welcomeRevealTimer:1},matchMedia:()=>({matches:false}),getComputedStyle(){},Image:class{},setTimeout:(fn,delay)=>{scheduled.push({fn,delay});return scheduled.length;},clearTimeout(){},Math});
 assert(scheduled.at(-1).delay>=7000&&scheduled.at(-1).delay<=10000);
 scheduled.at(-1).fn();assert.equal(twitches,1);
 doc.hidden=true;visibility();assert.equal(paused,1);assert(classList.contains('welcome-paused'));
 assert(html.includes('begin="indefinite" values="0;3;0;1;0"'));
 console.log('PASS: ear-only draft uses seven-to-ten-second scheduling and pauses when hidden');
}
