import assert from 'node:assert/strict';
import {installPickerDrag} from '../public/picker-drag.js';

class Target{
 constructor(classes=[],id=''){this.listeners={};this.style={};this.children=[];this.attributes={};this.classes=classes;this.dataset={id};this.classList={contains:c=>this.classes.includes(c),toggle(){}};}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
 emit(type,event={}){for(const fn of this.listeners[type]||[])fn(event);}
 contains(element){return [button,handle,card,heart].includes(element);}
 setPointerCapture(){this.captured=true;}
 hasPointerCapture(){return this.captured;}
 releasePointerCapture(){this.captured=false;}
 setAttribute(key,value){this.attributes[key]=value;}
 append(element){this.children.push(element);}
 remove(){this.removed=true;}
}

const picker=new Target(),doc=new Target(),win=new Target();
const button=new Target(['stamp'],'bunny'),handle=new Target(['stamp-drag-handle'],'bunny');
const card=new Target(['stamp-card'],'bunny'),heart=new Target(['favorite-heart'],'bunny');
doc.body=new Target();doc.createElement=()=>new Target();win.innerHeight=800;win.requestAnimationFrame=()=>1;win.cancelAnimationFrame=()=>{};win.scrollBy=()=>{};
const timers=new Map();let nextTimer=0;
win.setTimeout=fn=>{const id=++nextTimer;timers.set(id,fn);return id;};
win.clearTimeout=id=>timers.delete(id);
const fireTimers=()=>{for(const [id,fn] of [...timers]){timers.delete(id);fn();}};

let bounds={left:100,top:100,width:600,height:540,right:700,bottom:640},allowed=true,placements=[];
installPickerDrag({picker,canvas:{getBoundingClientRect:()=>bounds},canStart:()=>allowed,preview:()=>({src:'data:image/png,test',width:100,height:80}),place:(...args)=>placements.push(args),doc,win});
function event(target=button,x=800,y=200,type='mouse',pointerId=1){return{target:{closest:selector=>selector==='.favorite-heart'?(target.classList.contains('favorite-heart')?target:null):target},clientX:x,clientY:y,pointerId,pointerType:type,isPrimary:true,button:0,detail:1,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},stopPropagation(){this.stopped=true;}};}
function down(e){doc.emit('pointerdown',e);picker.emit('pointerdown',e);return e;}

let e=down(event());doc.emit('pointerup',e);const click=event();doc.emit('click',click);
assert(!click.prevented);assert.equal(placements.length,0,'ordinary click remains the normal add handler’s responsibility');

down(event());doc.emit('pointermove',event(button,400,370));
assert.equal(doc.body.children.length,1);assert.equal(placements.length,0,'preview must not alter the scene');
doc.emit('pointerup',event(button,400,370));
assert.deepEqual(placements,[['bunny',.5,.5]]);assert(doc.body.children[0].removed);
e=event();doc.emit('click',e);assert(e.stopped,'drag must suppress its generated click');

down(event(card,500,400));doc.emit('pointermove',event(card,400,370));doc.emit('pointerup',event(card,400,370));
assert.deepEqual(placements.at(-1),['bunny',.5,.5],'the whole card surface starts a mouse drag');
assert.equal(placements.length,2,'each successful drop calls place exactly once, including repeated drags');

down(event());doc.emit('pointermove',event(button,300,200));doc.emit('pointerup',event(button,800,200));
assert.equal(placements.length,2,'an outside-canvas drop cancels');
down(event());doc.emit('pointermove',event(button,300,200));doc.emit('keydown',{key:'Escape',preventDefault(){},stopPropagation(){}});doc.emit('pointerup',event(button,300,200));
assert.equal(placements.length,2,'Escape cancels an active drag');

down(event(button,100,100,'touch'));const tap=event(button,100,100,'touch');doc.emit('pointerup',tap);doc.emit('click',tap);
assert.equal(placements.length,2,'a touch tap still reaches the normal add handler');assert(!tap.stopped,'a tap is not mistaken for a drag');

const scrollStart=down(event(button,140,220,'touch'));const scrollMove=event(button,141,250,'touch');doc.emit('pointermove',scrollMove);
assert(!scrollMove.prevented,'a quick vertical swipe is left to native page scrolling');assert.equal(placements.length,2,'scrolling never places an item');
doc.emit('pointerup',scrollMove);const scrollClick=event(button,141,250,'touch');doc.emit('click',scrollClick);assert(scrollClick.stopped,'a scroll gesture cannot fall through as an accidental add');

down(event(card,500,400,'touch'));fireTimers();doc.emit('pointermove',event(card,400,370,'touch'));doc.emit('pointerup',event(card,400,370,'touch'));
assert.deepEqual(placements.at(-1),['bunny',.5,.5],'a long-press then drag from anywhere on a card places it');
assert.equal(placements.length,3,'one long-press drop produces one placement');

const count=placements.length;down(event(heart,400,400,'touch'));doc.emit('pointermove',event(heart,170,175,'touch'));doc.emit('pointerup',event(heart,170,175,'touch'));
assert.equal(placements.length,count,'the favorite control keeps its own click behavior instead of starting an item drag');

const handleDown=down(event(handle,400,400,'touch'));assert(handleDown.prevented,'the dedicated touch handle still opts out of scrolling immediately');doc.emit('pointermove',event(handle,400,370,'touch'));doc.emit('pointerup',event(handle,400,370,'touch'));
assert.deepEqual(placements.at(-1),['bunny',.5,.5],'the dedicated touch handle remains an immediate drag target');

bounds={left:20,top:40,width:300,height:270,right:320,bottom:310};down(event(card,100,100));doc.emit('pointermove',event(card,95,242.5));doc.emit('pointerup',event(card,95,242.5));
assert.deepEqual(placements.at(-1),['bunny',.25,.75],'placement uses current canvas bounds after scaling or scrolling');

const before=placements.length;down(event());doc.emit('pointermove',event(button,150,150));doc.emit('pointercancel',event());doc.emit('pointerup',event(button,150,150));
assert.equal(placements.length,before,'pointer cancellation cannot place an item or leave a repeated drag active');
down(event());doc.emit('pointermove',event(button,150,150));allowed=false;doc.emit('pointerup',event(button,150,150));
assert.equal(placements.length,before,'busy state cannot commit an in-flight drag');

console.log('PASS: full-card mouse/touch drag, tap-to-add, long-press threshold, native scroll, favorite clicks, repeated/interrupted drags, outside/Escape cancellation, release coordinates, busy guard, and one placement per successful drop');
