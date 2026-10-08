import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile('public/audio.js','utf8');
function harness(saved=null){
 const elements=new Map(),contexts=[],sources=[],storage=new Map(saved?[['spooky-grove-audio-v1',JSON.stringify(saved)]]:[]);
 function element(){return {listeners:{},attrs:{},classList:{toggle(){}},addEventListener(type,fn){this.listeners[type]=fn},setAttribute(k,v){this.attrs[k]=v},closest(){return this.audioAction?this:null}};}
 const document={...element(),hidden:false,getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)}};
 const window={...element()};
 class AudioContext{
  constructor(){this.state='suspended';this.currentTime=0;this.destination={};contexts.push(this)}
  addEventListener(_,fn){this.changed=fn}
  async resume(){this.state='running';this.changed?.()}
  async suspend(){this.state='suspended';this.changed?.()}
  async close(){this.state='closed';this.changed?.()}
  createGain(){return {connect(){},disconnect(){},gain:{value:0,setTargetAtTime(v){this.value=v},setValueAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v},cancelScheduledValues(){}}}}
  createBuffer(_,n){const data=new Float32Array(n);return {getChannelData(){return data},data}}
  createBufferSource(){const node={connect(){},disconnect(){},start(){this.started=true},stop(){this.stopped=true}};sources.push(node);return node}
 }
 window.AudioContext=AudioContext;
 vm.runInNewContext(source,{window,document,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout,clearTimeout,Float32Array,Math,JSON,Number,Set,Map,Promise});
 const get=id=>document.getElementById(id),event=target=>({isTrusted:true,target});
 const settle=async()=>{for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,5));if(!get('audioStatus').textContent?.startsWith('Preparing'))return;}throw Error('Audio did not finish preparing')};
 return {window,document,contexts,sources,get,storage,settle,settings:()=>JSON.parse(storage.get('spooky-grove-audio-v1')),label:()=>get('masterMute').attrs['aria-label'],click:async()=>{get('masterMute').audioAction=true;get('masterMute').listeners.click(event(get('masterMute')));await settle()},gesture:async()=>{document.listeners.click(event(element()));await settle()}};
}
const first=harness();assert.equal(first.label(),'Resume Audio');assert.equal(first.contexts.length,0);
await first.click();assert.equal(first.settings().music,'gentle');assert.equal(first.settings().sfx,true);assert.equal(first.label(),'Mute All Audio');assert.equal(first.contexts[0].state,'running');assert(first.sources.some(s=>s.started&&s.buffer.data.some(v=>v!==0)));
await first.click();assert.equal(first.label(),'Unmute Audio');assert(first.sources.every(s=>s.stopped));
await first.click();assert.equal(first.label(),'Mute All Audio');assert.equal(first.settings().music,'gentle');
const reload=harness(first.settings());assert.equal(reload.label(),'Resume Audio');assert.equal(reload.contexts.length,0);await reload.click();assert.equal(reload.label(),'Mute All Audio');
const custom=harness({music:'haunted',volume:22,sfx:true,muted:true});await custom.click();assert.equal(custom.settings().music,'haunted');assert.equal(custom.settings().volume,22);assert.equal(custom.settings().sfx,true);
custom.document.hidden=true;custom.document.listeners.visibilitychange();assert.equal(custom.label(),'Resume Audio');custom.document.hidden=false;await custom.gesture();assert.equal(custom.label(),'Mute All Audio');
custom.window.listeners.pagehide();assert.equal(custom.contexts[0].state,'closed');const returnFromWelcome=harness(custom.settings());await returnFromWelcome.gesture();assert.equal(returnFromWelcome.label(),'Mute All Audio');assert.equal(returnFromWelcome.settings().music,'haunted');
const off=harness({music:'off',volume:35,sfx:false,muted:false});await off.gesture();assert.equal(off.contexts.length,0);await off.click();assert.equal(off.settings().music,'gentle');assert.equal(off.settings().sfx,false);assert.equal(off.label(),'Mute All Audio');
const zero=harness({music:'cosmic',volume:0,sfx:false,muted:false});await zero.click();assert.equal(zero.settings().music,'cosmic');assert.equal(zero.settings().volume,35);
const effects=harness({music:'off',volume:0,sfx:true,muted:false});await effects.click();assert.equal(effects.settings().music,'off');effects.window.groveAudio.effect('add');assert(effects.sources.some(s=>s.started));
for(const h of [first,reload,custom,returnFromWelcome,off,zero,effects])h.window.listeners.pagehide();
console.log('PASS: first-click enable, audible samples, mute/unmute, saved preferences, reload resume, visibility/navigation, zero volume, and SFX-only audio.');
