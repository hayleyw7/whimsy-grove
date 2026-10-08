import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const elements=new Map();
const element=id=>{
 if(!elements.has(id))elements.set(id,{listeners:{},disabled:false,textContent:'',hidden:false,files:[],value:'',open:false,
 addEventListener(type,fn){this.listeners[type]=fn;},showModal(){this.open=true;},close(){this.open=false;this.listeners.close?.();},focus(){this.focused=true;},click(){return this.listeners.click?.();}});
 return elements.get(id);
};
let calls=[],summary={total:2,add:1,skip:1,titles:['<script>']},failure=null,events=[];
const request=async(path,options)=>{calls.push({path,options});if(failure)throw Error(failure);return path.endsWith('/preview')?summary:{imported:1,skip:1};};
let source=readFileSync('public/backup.js','utf8').replace(/async function request\(path,options\)\{[^\n]+\}/,'');
vm.runInNewContext(source,{document:{getElementById:element,dispatchEvent:e=>events.push(e.type)},request,Event,Error,JSON,Blob,URL,setTimeout});
const choose=async(size=10)=>{const input=element('albumBackupFile');input.files=[{size,text:async()=>'{"backup":"fixture"}'}];await input.listeners.change({target:input});};
await choose();
assert.equal(element('importBackupDialog').open,true);
assert.match(element('backupSummary').textContent,/1 will be added; 1 already present/);
assert.equal(element('backupTitles').textContent,'Includes: <script>');
assert.equal(calls.length,1,'Preview must not import');
element('cancelImport').click();await element('confirmImport').click();assert.equal(calls.length,1,'Cancel clears pending import');
await choose();await element('confirmImport').click();
assert.equal(calls.at(-1).path,'/api/album-backup/import');assert.deepEqual(events,['grove-album-imported']);
assert.equal(element('importBackupDialog').open,false);assert.match(element('backupStatus').textContent,/Imported 1 grove/);
summary={total:1,add:0,skip:1,titles:[]};await choose();assert.equal(element('confirmImport').disabled,true);
element('cancelImport').click();const count=calls.length;await choose(20*1024*1024+1);assert.equal(calls.length,count);assert.match(element('backupStatus').textContent,/20 MB/);
summary={total:1,add:1,skip:0,titles:['test']};await choose();failure='Nothing imported: storage full';await element('confirmImport').click();assert.equal(element('importBackupDialog').open,true);assert.equal(element('confirmImport').disabled,false);assert.match(element('importStatus').textContent,/Nothing imported/);
console.log('Backup UI PASS: preview, cancel, explicit confirmation, duplicate disabling, size limit, safe text, recoverable failure');
