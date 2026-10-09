import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const welcome=readFileSync('dist/index.html','utf8'),editor=readFileSync('dist/editor.html','utf8');
const script=html=>html.match(/<script>([\s\S]*?)<\/script>/)[1];
function route(html,url,visited=false,blocked=false){
 const actions=[];vm.runInNewContext(script(html),{URL,location:{href:url,replace:value=>actions.push(['navigate',value])},history:{replaceState:(_state,_title,value)=>actions.push(['clean',value])},localStorage:{getItem:key=>{assert.equal(key,'whimsy-grove-visited:/whimsy-grove/');if(blocked)throw Error('Storage denied');return visited?'1':null;}}});return actions;
}
const base='https://hayleyw7.github.io/whimsy-grove/';
assert.deepEqual(route(welcome,base),[],'Fresh root shows welcome');
assert.deepEqual(route(editor,base+'editor.html'),[['navigate','./']],'Fresh direct editor shows welcome');
assert(welcome.includes('href="editor.html?start=1" aria-label="Create">Create</a>'));
assert.deepEqual(route(editor,base+'editor.html?start=1'),[['clean','/whimsy-grove/editor.html']],'CTA enters editor without leaving bypass parameter');
assert.deepEqual(route(welcome,base,true),[['navigate','editor.html']],'Returning root restores editor');
assert.deepEqual(route(editor,base+'editor.html',true),[],'Returning editor stays open');
assert.deepEqual(route(welcome,base+'?welcome=1',true),[],'Explicit welcome remains accessible');
assert.deepEqual(route(editor,base+'editor.html?start=1',false,true),[['clean','/whimsy-grove/editor.html']],'Unavailable storage does not loop from CTA');
assert.deepEqual(route(editor,base+'editor.html',false,true),[],'Blocked storage fails open rather than looping');
console.log('PASS: fresh root/direct editor, CTA, returning routes, explicit welcome, and unavailable storage');
