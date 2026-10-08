import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile('public/garden.js','utf8');
const preference=source.slice(source.indexOf("const motionPreferenceKey="),source.indexOf('function manageAnimation'));
const listener=source.split('\n').find(x=>x.startsWith("$('#motionToggle').addEventListener('change'"));
const storage=new Map();
function load(scene,reducedMotion){let change;const box={state:scene,reducedMotion,busy:false,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},$:()=>({addEventListener:(_,fn)=>change=fn}),remember(){},render(){}};vm.createContext(box);vm.runInContext(preference+listener,box);return {enabled:()=>vm.runInContext('motionEnabled()',box),toggle:value=>change({target:{checked:value}})};}
let h=load({motionPreference:'auto'},false);assert.equal(h.enabled(),true);h.toggle(false);assert.equal(load({motionPreference:'auto'},false).enabled(),false);assert.equal(load({motionPreference:true},false).enabled(),false);
h.toggle(true);assert.equal(load({motionPreference:'auto'},true).enabled(),true);storage.clear();assert.equal(load({motionPreference:'auto'},true).enabled(),false);
console.log('PASS: animation off persists across reload and scenes; explicit on overrides reduced motion; unset honors device preference.');
