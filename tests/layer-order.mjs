import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('public/garden.js','utf8');
const functions=['bringActiveToFront','sendActiveToBack'].map(name=>source.split('\n').find(line=>line.startsWith(`function ${name}()`))).join('\n');
const context={state:{items:[{id:'a',order:0},{id:'b',order:1},{id:'c',order:2}]},selected:'b',busy:false,history:[],renders:0};
context.activeOddity=()=>context.state.items.find(x=>x.id===context.selected);context.remember=()=>context.history.push(structuredClone(context.state));context.render=()=>context.renders++;
vm.createContext(context);vm.runInContext(functions,context);
assert.equal(context.sendActiveToBack(),true);assert.equal(context.state.items.map(x=>x.id).join(''),'bac');assert.equal(context.history.length,1);assert.equal(context.sendActiveToBack(),false);assert.equal(context.history.length,1);
context.state=context.history.pop();assert.equal(context.state.items.map(x=>x.id).join(''),'abc');
assert.equal(context.bringActiveToFront(),true);assert.equal(context.state.items.map(x=>x.id).join(''),'acb');assert.equal(context.bringActiveToFront(),false);
context.busy=true;assert.equal(context.sendActiveToBack(),false);context.busy=false;context.selected='missing';assert.equal(context.sendActiveToBack(),false);
assert.equal(context.history.length,1);console.log('PASS: front/back ordering, history restore, repeat no-ops, busy and no selection');

const remove=source.match(/^function removeActiveOddity\(\).*$/m)[0];
const shortcut=source.match(/^function deleteSelectedOddityShortcut\(event\)\{[\s\S]*?^\}/m)[0];
const undo=source.match(/^function undo\(\).*$/m)[0];
const state={items:[{uid:'a'},{uid:'b'},{uid:'c'}]},dom={modal:false,menu:false,fullscreen:false,activeElement:null};
const scenario={state,activeUid:'b',busy:false,undoStack:[],redoStack:[],renders:0,
 document:{get activeElement(){return dom.activeElement;},querySelector:()=>dom.modal?{}:null,
 querySelectorAll:()=>dom.menu?[{closest:()=>null,getClientRects:()=>[{}]}]:[],body:{classList:{contains:()=>dom.fullscreen}}},
 window:{groveAudio:{effect:()=>{}}}};
scenario.activeOddity=()=>scenario.state.items.find(x=>x.uid===scenario.activeUid);
scenario.snapshot=()=>structuredClone(scenario.state);
scenario.remember=()=>scenario.undoStack.push(scenario.snapshot());
scenario.render=()=>scenario.renders++;
vm.runInNewContext(remove+'\n'+shortcut+'\n'+undo,scenario);
const key=(key,extra={})=>{let prevented=false;scenario.deleteSelectedOddityShortcut({key,preventDefault(){prevented=true;},...extra});return prevented;};
assert.equal(key('Delete',{target:{closest:()=>({})}}),false);
assert.equal(key('Backspace',{target:{isContentEditable:true}}),false);
assert.equal(key('Delete',{ctrlKey:true}),false);
assert.equal(key('Delete',{shiftKey:true}),false);
assert.equal(key('Delete',{isComposing:true}),false);
dom.modal=true;assert.equal(key('Delete'),false);dom.modal=false;
dom.menu=true;assert.equal(key('Backspace'),false);dom.menu=false;
dom.fullscreen=true;assert.equal(key('Backspace'),false);dom.fullscreen=false;
assert.equal(scenario.renders,0);
assert.equal(key('Delete'),true);
assert.equal(scenario.activeUid,null);assert.deepEqual(scenario.state.items.map(x=>x.uid),['a','c']);
assert.equal(key('Backspace'),false,'do not intercept without a selection');
scenario.undo();assert.deepEqual(scenario.state.items.map(x=>x.uid),['a','b','c']);
scenario.activeUid='a';assert.equal(key('Backspace'),true);
assert.deepEqual(scenario.state.items.map(x=>x.uid),['b','c']);
console.log('PASS: Delete and Backspace use the same remove action; selection, editing guards, menu/modal guards and Undo verified.');
