import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const source=await readFile(new URL('../public/garden.js',import.meta.url),'utf8');
const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
assert.match(html,/<h2 id="renameTitle"[^>]*>.*?<\/h2><p id="nameError"[^>]*role="alert" hidden><\/p><label class="sr-only" for="renameInput">/);
class Element extends EventTarget{
  constructor(){super();this.open=false;this.hidden=true;this.closes=0;}
  toggleAttribute(name,on){this[name]=on;return on;}
  setCustomValidity(){}
  focus(){}
  toggleAttribute(name,enabled){this[name]=enabled;}
  getBoundingClientRect(){return {left:10,top:10,right:150,bottom:150};}
  setSelectionRange(start,end){this.selectionStart=start;this.selectionEnd=end;}
  close(value='cancel'){this.returnValue=value;this.open=false;this.closes++;this.dispatchEvent(new Event('close'));}
}
const elements=new Map(),$=selector=>{
  if(!elements.has(selector))elements.set(selector,new Element());
  return elements.get(selector);
};
const dialog=$('#renameDialog'),form=$('#renameDialog form'),error=$('#nameError'),input=$('#renameInput');
const notices=[],calls=[],timers=[],refreshes=[];
let respond;
const send=title=>{
  calls.push(title);
  return new Promise(resolve=>{respond=resolve;});
};
const context={$,
  busy:false,ready:true,state:{},requireAccount:()=>true,
  nameComposing:false,clipName:value=>value.slice(0,15),snapshot:()=>({background:'ruins'}),
  showDialog:dialog=>{dialog.open=true;},queueDraft:()=>{},syncAchievements:()=>{},
  window:{}, URLSearchParams,setTimeout:fn=>timers.push(fn),openAlbumHistory:kind=>refreshes.push(kind),notify:(...message)=>notices.push(message),
  request:(path,options)=>options?send(JSON.parse(options.body).title):Promise.resolve({title:'Ruins Grove'}),
  persistScene:(_collection,_scene,_reason,title)=>send(title),
};
const between=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b));
runInNewContext(between('const albumNameTakenMessage=','function syncAlbumOptions')+between('async function presentMutationSuccess(','$(\'#renameInput\').addEventListener(\'beforeinput\'') + between('async function renameAlbumGrove','let savedMenu'),context);
dialog.id='renameDialog';
$('#deleteDialog').id='deleteDialog';
Object.assign(context,{document:{querySelectorAll:()=>[dialog,$('#deleteDialog')]},dialogReturnFocus:new Map(),dialogStack:[],focusSafely:()=>{},queueMicrotask,Event});
runInNewContext(between("for(const dialog of document.querySelectorAll('dialog')){let backdropStart","function registerTools"),context);
function clickBackdrop(target){
  for(const type of ['pointerdown','click']){
    const event=new Event(type,{cancelable:true});
    Object.assign(event,{clientX:0,clientY:0});
    target.dispatchEvent(event);
  }
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const submit=()=>assert.equal(form.dispatchEvent(new Event('submit',{cancelable:true})),false);
const editor=context.saveToAlbum();
await tick();
assert.equal(dialog.open,true);
assert.equal(input.value,'Ruins Grove');
assert.equal(input.selectionStart,input.value.length);
assert.equal(input.selectionEnd,input.value.length);
assert.doesNotMatch(html,/id="nameHelp"/);
input.value='My Moss';
submit();
assert.equal(dialog.open,true);
assert.equal($('#nameConfirm').disabled,true);
clickBackdrop(dialog);assert.equal(dialog.open,true);
submit();
assert.equal(calls.length,1);
respond(null);
await tick();
assert.equal(dialog.open,true);
assert.equal(dialog.closes,0);
assert.equal(error.hidden,false);
assert.equal(error.textContent,'This creation is already saved in your Album.');
assert.equal(input.value,'My Moss');
assert.equal($('#cancelRename').disabled,false);
assert.equal(notices.length,0);
dialog.close();
await editor;
assert.equal(calls.length,1);

const item={id:'history',inAlbum:false},add=new Element();
const history=context.addHistoryToAlbum(item,add);
await tick();
assert.equal(error.hidden,true);
input.value='Moss Again';
submit();
assert.equal(dialog.open,true);
respond({duplicate:true});
await tick();
assert.equal(dialog.closes,1);
assert.equal(error.textContent,'This creation is already saved in your Album.');
assert.equal(input.value,'Moss Again');
assert.equal(notices.length,0);
submit();
respond({titleTaken:true});
await tick();
assert.equal(dialog.open,true);
assert.match(error.textContent,/That name is already/);
input.value='Better Moss';
submit();
respond({saved:true});
await tick();
assert.equal(dialog.open,true);
assert.equal($('#nameSuccess').textContent,'Added to Album');
assert.equal($('#nameSuccess').hidden,false);
assert.equal(dialog.dispatchEvent(new Event('cancel',{cancelable:true})),false);
submit();assert.equal(calls.length,4);
timers.shift()();
await history;
assert.equal(dialog.open,false);
assert.equal(dialog.closes,2);
assert.equal(item.inAlbum,true);
assert.deepEqual(notices,[]);

const canceled=context.saveToAlbum();
await tick();
assert.equal(error.hidden,true);
clickBackdrop(dialog);
await canceled;
assert.equal(dialog.open,false);
assert.deepEqual(calls,['My Moss','Moss Again','Moss Again','Better Moss']);
console.log('PASS: Album naming stays open while saving and on duplicates; title conflicts can retry, cancel does not save, and success closes.');

const renamed=context.renameAlbumGrove({id:'history',title:'Old Moss'},new Element());
await tick();input.value='New Moss';submit();respond({saved:true});await tick();
assert.equal(dialog.open,true);
assert.equal($('#nameSuccess').textContent,'Creation renamed.');
timers.shift()();await renamed;
assert.equal(dialog.open,false);
assert.deepEqual(refreshes,['album']);

const deleteDialog=$('#deleteDialog'),deleteForm=$('#deleteDialog form'),deleteAction=$('#deleteAction');
const attempt=context.deletePrompt({id:'history',title:'New Moss',inAlbum:true},'album');
const remove=()=>{const event=new Event('submit',{cancelable:true});event.submitter=deleteAction;assert.equal(deleteForm.dispatchEvent(event),false);};
remove();assert.equal(deleteDialog.open,true);assert.equal($('#deleteSuccess').hidden,true);
respond({deleted:false});await tick();
assert.equal(deleteDialog.open,true);assert.equal($('#deleteError').hidden,false);
remove();respond({deleted:true});await tick();
assert.equal(deleteDialog.open,true);
assert.equal($('#deleteSuccess').textContent,'Creation permanently deleted.');
clickBackdrop(deleteDialog);assert.equal(deleteDialog.open,true);
assert.equal(deleteDialog.dispatchEvent(new Event('cancel',{cancelable:true})),false);
timers.shift()();assert.equal(await attempt,true);
assert.equal(deleteDialog.open,false);
const beforeCancel=calls.length;
const canceledDelete=context.deletePrompt({id:'other',title:'Other Moss',inAlbum:true},'album');
const cancelEvent=new Event('submit',{cancelable:true});cancelEvent.submitter=$('#cancelDelete');
assert.equal(deleteForm.dispatchEvent(cancelEvent),true);
deleteDialog.close('cancel');assert.equal(await canceledDelete,false);
assert.equal(calls.length,beforeCancel);
assert.deepEqual(notices,[]);
console.log('PASS: Album, rename and delete confirm only after persistence, display inline success before closure, and do not show success toasts.');
