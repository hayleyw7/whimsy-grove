import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile('public/audio.js','utf8');
function harness(saved=null,random=0){
 const elements=new Map(),contexts=[],sources=[],storage=new Map(saved?[['spooky-grove-audio-v1',JSON.stringify(saved)]]:[]);
 function element(){return {listeners:{},attrs:{},classList:{values:{},toggle(name,value){this.values[name]=value}},addEventListener(type,fn){this.listeners[type]=fn},setAttribute(k,v){this.attrs[k]=v},closest(selector){return selector==='[data-audio-action]'&&this.audioAction||selector==='#startGrove:not(:disabled)'&&this.ideaChoice||selector==='#startDialog'&&this.inSetup?this:null}};}
 const document={...element(),hidden:false,getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)}};
 const window={...element()};
 class AudioContext{
  constructor(){this.state='suspended';this.currentTime=0;this.destination={};contexts.push(this)}
  addEventListener(_,fn){this.changed=fn}
  async resume(){this.state='running';this.changed?.()}
  async suspend(){this.state='suspended';this.changed?.()}
  async close(){this.state='closed';this.changed?.()}
  createGain(){return {connect(){},disconnect(){},gain:{value:0,events:[],setTargetAtTime(v){this.value=v},setValueAtTime(v,at){this.value=v;this.events.push(['set',v,at])},linearRampToValueAtTime(v,at){this.value=v;this.events.push(['ramp',v,at])},cancelScheduledValues(){}}}}
  createBuffer(_,n){const data=new Float32Array(n);return {getChannelData(){return data},data}}
  createBufferSource(){const node={connect(){},disconnect(){},start(){this.started=true},stop(){this.stopped=true}};sources.push(node);return node}
 }
 window.AudioContext=AudioContext;
 vm.runInNewContext(source,{window,document,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout,clearTimeout,Float32Array,Math:Object.assign(Object.create(Math),{random:()=>random}),JSON,Number,Set,Map,Promise});
 const get=id=>document.getElementById(id),event=target=>({isTrusted:true,target});
 const settle=async()=>{for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,5));if(!get('audioStatus').textContent?.startsWith('Preparing'))return;}throw Error('Audio did not finish preparing')};
 return {window,document,contexts,sources,get,storage,settle,settings:()=>JSON.parse(storage.get('spooky-grove-audio-v1')),label:()=>get('masterMute').attrs['aria-label'],readIdeaGesture:()=>document.listeners.click(event({...element(),inSetup:true})),ideaGesture:()=>document.listeners.click(event({...element(),inSetup:true,ideaChoice:true})),click:async()=>{get('masterMute').audioAction=true;get('masterMute').listeners.click(event(get('masterMute')));await settle()},gesture:async()=>{document.listeners.click(event(element()));await settle()}};
}
const savedUnmuted=harness({music:'haunted',musicPinned:true,volume:22,sfx:true,muted:false});
assert.equal(savedUnmuted.get('masterMute').attrs['aria-pressed'],'false');
assert.match(savedUnmuted.get('masterMute').innerHTML,/M15 8a6/);
assert.equal(savedUnmuted.contexts.length,0,'an unmuted preference does not bypass browser autoplay');
savedUnmuted.document.listeners.click({isTrusted:false});
assert.equal(savedUnmuted.contexts.length,0);
await savedUnmuted.ideaGesture();
await savedUnmuted.window.groveAudio.chooseGroveTrack('cosmic-visitors');
assert.equal(savedUnmuted.label(),'Mute All Audio');
assert.equal(savedUnmuted.settings().muted,false);
savedUnmuted.window.listeners.pagehide();
assert.equal(savedUnmuted.get('masterMute').attrs['aria-pressed'],'false');
const savedMuted=harness({...savedUnmuted.settings(),muted:true});
assert.equal(savedMuted.get('masterMute').attrs['aria-pressed'],'true');
assert.match(savedMuted.get('masterMute').innerHTML,/M16 9l5 6/);
await savedMuted.ideaGesture();
await savedMuted.window.groveAudio.chooseGroveTrack('cosmic-visitors');
assert.equal(savedMuted.contexts.length,0,'a saved mute remains muted even after Start Creating');
assert.equal(savedMuted.settings().muted,true);
const first=harness();assert.equal(first.label(),'Resume Audio');assert.equal(first.contexts.length,0);
await first.click();assert.equal(first.settings().music,'gentle');assert.equal(first.settings().sfx,true);assert.equal(first.label(),'Mute All Audio');assert.equal(first.contexts[0].state,'running');assert(first.sources.some(s=>s.started&&s.buffer.data.some(v=>v!==0)));
const firstMusic=first.sources.find(s=>s.loop);assert.deepEqual(firstMusic.gain.gain.events,[['set',0,0],['ramp',1,.9]],'the source fades in once over 0.9 seconds');
const slider=first.get('musicVolume');slider.value=18;slider.listeners.input({target:slider,isTrusted:true});
assert.deepEqual(firstMusic.gain.gain.events,[['set',0,0],['ramp',1,.9]],'adjusting volume does not restart the source fade');
await first.click();assert.equal(first.label(),'Unmute Audio');assert(first.sources.every(s=>s.stopped));assert.equal(first.get('audioStatus').classList.values['sr-only'],true);assert.equal(first.get('audioStatus').textContent,'Audio is muted.');assert.equal(first.get('audioStatus').hidden,false);
await first.click();assert.equal(first.label(),'Mute All Audio');assert.equal(first.settings().music,'gentle');
const reload=harness(first.settings());assert.equal(reload.label(),'Resume Audio');assert.equal(reload.contexts.length,0);await reload.click();assert.equal(reload.label(),'Mute All Audio');
const custom=harness({music:'haunted',volume:22,sfx:true,muted:true});await custom.click();assert.equal(custom.settings().music,'haunted');assert.equal(custom.settings().volume,22);assert.equal(custom.settings().sfx,true);
custom.document.hidden=true;custom.document.listeners.visibilitychange();assert.equal(custom.label(),'Resume Audio');custom.document.hidden=false;await custom.gesture();assert.equal(custom.label(),'Mute All Audio');
custom.window.listeners.pagehide();assert.equal(custom.contexts[0].state,'closed');const returnFromWelcome=harness(custom.settings());await returnFromWelcome.gesture();assert.equal(returnFromWelcome.label(),'Mute All Audio');assert.equal(returnFromWelcome.settings().music,'haunted');
const off=harness({music:'off',volume:35,sfx:false,muted:false});await off.gesture();assert.equal(off.contexts.length,0);await off.click();assert.equal(off.settings().music,'gentle');assert.equal(off.settings().sfx,false);assert.equal(off.label(),'Mute All Audio');
const zero=harness({music:'cosmic',volume:0,sfx:false,muted:false});await zero.click();assert.equal(zero.settings().music,'cosmic');assert.equal(zero.settings().volume,35);
const effects=harness({music:'off',volume:0,sfx:true,muted:false});await effects.click();assert.equal(effects.settings().music,'off');effects.window.groveAudio.effect('add');assert(effects.sources.some(s=>s.started));
for(const h of [first,reload,custom,returnFromWelcome,off,zero,effects])h.window.listeners.pagehide();
const randomA=harness(null,0),randomB=harness({music:'gentle',musicPinned:false,sfx:false,muted:false},.5),randomC=harness(null,.99);
assert.equal(randomA.get('musicTrack').value,'gentle');assert.equal(randomB.get('musicTrack').value,'haunted');assert.equal(randomC.get('musicTrack').value,'cosmic');assert.equal(randomB.get('soundEffects').checked,false);
await randomB.window.groveAudio.selectTrack('off',{isTrusted:true});const pinnedOff=harness(randomB.settings(),.99);assert.equal(pinnedOff.get('musicTrack').value,'off');assert.equal(pinnedOff.get('soundEffects').checked,false);await pinnedOff.gesture();assert.equal(pinnedOff.contexts.length,0);
const chosen=harness({music:'cosmic',musicPinned:true,sfx:false,muted:false},0);assert.equal(chosen.get('musicTrack').value,'cosmic');
const muted=harness({music:'haunted',musicPinned:true,sfx:true,muted:true},.99);await muted.gesture();assert.equal(muted.contexts.length,0);assert.equal(muted.get('musicTrack').value,'haunted');
console.log('PASS: random unpinned visits, explicit track/off/mute persistence, legacy preferences; first-click enable, audible samples, mute/unmute, saved preferences, reload resume, visibility/navigation, zero volume, and SFX-only audio.');

assert.match(await (await import("node:fs/promises")).readFile("public/index.html","utf8"),/for="musicVolume">Music <output/,"slider visible label is Music");

assert(source.includes("classList.toggle('sr-only',$('audioStatus').textContent==='Audio is muted.')"),"only muted notice is visually hidden, other status and errors remain visible");

const muteHoverCss=await import('node:fs/promises').then(fs=>fs.readFile('public/style.css','utf8'));
assert(muteHoverCss.includes('body.editor-ui #masterMute:hover:not(:disabled):not([aria-disabled=true]) .ui-icon{transform:scale(1.12);}'));
assert(muteHoverCss.includes('body.editor-ui #masterMute:hover .ui-icon{transform:none!important;}'));
console.log('PASS: Mute shares canvas glyph hover in both audio states, with reduced-motion scaling disabled.');

const ideaSource=await readFile('public/ideas.js','utf8'),ideas={window:{}};vm.runInNewContext(ideaSource,ideas);
const soundtrack=new Map();
for(const idea of ideas.window.GroveIdeas){
 const h=harness(null,.99);h.window.groveAudio.chooseGroveTrack(idea.id);soundtrack.set(idea.id,h.settings().music);assert.equal(h.contexts.length,0,'choosing an idea alone cannot start audio');
}
assert.deepEqual([...soundtrack.values()].sort(),[...Array(6).fill('cosmic'),...Array(7).fill('gentle'),...Array(7).fill('haunted')]);
assert.equal(soundtrack.get('cosmic-visitors'),'cosmic');assert.equal(soundtrack.get('cozy-witch-corner'),'haunted');assert.equal(soundtrack.get('pond-gathering'),'gentle');
for(const [seed,track] of [[0,'gentle'],[.5,'haunted'],[.99,'cosmic']]){
 const h=harness(null,seed);h.window.groveAudio.chooseGroveTrack(null);assert.equal(h.settings().music,track);
 assert.equal(harness(h.settings(),seed===0?.99:0).get('musicTrack').value,track,'restoring keeps the last automatic grove track');
}
for(const [saved,track] of [[{music:'off',musicPinned:true},'off'],[{music:'haunted',musicPinned:true},'haunted']]){
 const h=harness(saved,.99);h.window.groveAudio.chooseGroveTrack('pond-gathering');h.window.groveAudio.chooseGroveTrack(null);assert.equal(h.get('musicTrack').value,track);
}
const ideaGesture=harness(null,0);
await ideaGesture.readIdeaGesture();assert.equal(ideaGesture.contexts.length,0,'reading or selecting a card does not unlock audio');
await ideaGesture.ideaGesture();assert.equal(ideaGesture.contexts[0].state,'running');assert.equal(ideaGesture.sources.length,0,'trusted Start Creating click unlocks without starting the wrong track');
await ideaGesture.window.groveAudio.chooseGroveTrack('cosmic-visitors');assert.equal(ideaGesture.settings().music,'cosmic');assert.equal(ideaGesture.sources.length,1);
const music=ideaGesture.sources[0];await ideaGesture.window.groveAudio.chooseGroveTrack('rooftop-stargazers');assert.equal(ideaGesture.sources.length,1,'keeping the same track does not reramp');
await ideaGesture.window.groveAudio.selectTrack('haunted',{isTrusted:true});assert.equal(ideaGesture.sources.length,2,'a manual track switch starts another faded source');
assert.equal(music.stopped,true);assert.deepEqual(ideaGesture.sources[1].gain.gain.events,[['set',0,0],['ramp',1,.9]]);
ideaGesture.window.groveAudio.chooseGroveTrack('pond-gathering');assert.equal(ideaGesture.get('musicTrack').value,'haunted');
ideaGesture.window.listeners.pagehide();
console.log('PASS: stable named mood map, uniform Free Create, opt-out/pinned and restore preservation, and one 0.9-second fade per start.');
