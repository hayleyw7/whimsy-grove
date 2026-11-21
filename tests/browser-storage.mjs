import assert from 'node:assert/strict';
import {indexedDB} from 'fake-indexeddb';
import {build} from 'esbuild';
import {cp,mkdir} from 'node:fs/promises';
await mkdir('dist/test',{recursive:true});
await build({entryPoints:['scripts/browser-storage.mjs'],bundle:true,platform:'node',format:'esm',banner:{js:"import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const __dirname=new URL('.',import.meta.url).pathname;"},outfile:'dist/test/storage.mjs'});
await cp('node_modules/sql.js/dist/sql-wasm.wasm','dist/test/sql-wasm.wasm');
globalThis.indexedDB=indexedDB;globalThis.location={origin:'https://hayleyw7.github.io'};
Object.defineProperty(globalThis,'navigator',{value:{locks:{request:async(name,fn)=>fn()}}});
const {request}=await import('../dist/test/storage.mjs');
const session=await request('/api/session');assert(session.storageReady);
const scene={version:2,creationId:crypto.randomUUID(),items:[{id:'fern',uid:crypto.randomUUID(),x:500,y:500,size:100,flip:false}],palette:'haunted',background:'cave',moon:'none',galaxy:'none',shootingStars:false,weather:[],seed:8921};
const call=(path,method,body)=>request(path,{method,body:JSON.stringify(body)});
await call('/api/draft','PUT',{scope:session.draftScope,editId:crypto.randomUUID(),scene});assert.deepEqual((await request('/api/draft')).draft.scene.items[0].id,'fern');
await call('/api/favorites','POST',{itemId:'fern',favorite:true});assert.deepEqual((await request('/api/favorites')).items,['fern']);
const id=crypto.randomUUID();await call('/api/drawings','POST',{id,collection:'album',title:'Cave',scene,thumbnail:'data:image/png;base64,'+'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg=='});
let album=await request('/api/drawings?collection=album');assert.equal(album.items.length,1);assert(album.items[0].thumbnail.startsWith('blob:'));assert.equal((await request('/api/drawings/'+id)).drawing.scene.background,'cave');
await call('/api/drawings/'+id,'PATCH',{title:'New Cave'});assert.equal((await request('/api/drawings?collection=album')).items[0].title,'New Cave');
const progress=await call('/api/achievements/sync','POST',{scope:session.draftScope});assert.equal(progress.savedCount,1);assert(progress.earned.some(x=>x.id==='first-sprout'));
const second=await import('../dist/test/storage.mjs?reload');assert.equal((await second.request('/api/drawings?collection=album')).items[0].title,'New Cave');
await call('/api/drawings/'+id,'DELETE',{confirmation:'permanently-delete',collection:'album',title:'New Cave'});assert.equal((await request('/api/drawings?collection=album')).items.length,0);
const historyId=crypto.randomUUID();await call('/api/drawings','POST',{id:historyId,collection:'history',scene,thumbnail:'data:image/png;base64,'+'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg=='});await call('/api/drawings/'+historyId+'/album','POST',{title:'From History'});assert.equal((await request('/api/drawings?collection=album')).items[0].title,'From History');
console.log('PASS: draft, favorites, album, thumbnail, rename, achievements, reload, deletion, history promotion.');
// Editable backup round trips merge atomically and never replace existing IDs.
const backup=await request('/api/album-backup');assert.equal(backup.format,'whimsy-grove-album');assert.equal(backup.groves.length,1);
let preview=await call('/api/album-backup/preview','POST',backup);assert.equal(preview.add,0);assert.equal(preview.skip,1);
const incoming=structuredClone(backup);incoming.groves[0].id=crypto.randomUUID();incoming.groves[0].title='Imported';incoming.groves[0].scene.creationId=crypto.randomUUID();
preview=await call('/api/album-backup/preview','POST',incoming);assert.equal(preview.add,1);assert.equal((await request('/api/drawings?collection=album')).items.length,1);
const beforeDraft=await request('/api/draft');await call('/api/album-backup/import','POST',incoming);assert.equal((await request('/api/drawings?collection=album')).items.length,2);assert.deepEqual(await request('/api/draft'),beforeDraft);
const repeat=await call('/api/album-backup/import','POST',incoming);assert.equal(repeat.imported,0);assert.equal(repeat.skip,1);
const invalid=structuredClone(incoming);invalid.groves.push({...invalid.groves[0],id:crypto.randomUUID(),scene:{...invalid.groves[0].scene,items:[{...scene.items[0],id:'https://example.com/evil.js'}]}});await assert.rejects(call('/api/album-backup/import','POST',invalid));assert.equal((await request('/api/drawings?collection=album')).items.length,2);
const badImage=structuredClone(incoming);badImage.groves[0].thumbnail='data:image/svg+xml;base64,PHN2Zz4=';await assert.rejects(call('/api/album-backup/preview','POST',badImage));
await assert.rejects(call('/api/album-backup/preview','POST',{...incoming,version:999}));await assert.rejects(request('/api/album-backup/preview',{method:'POST',body:' '.repeat(20*1024*1024+1)}));
const {IDBObjectStore}=await import('fake-indexeddb');const originalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){throw new DOMException('Full','QuotaExceededError')};const quota=structuredClone(incoming);quota.groves[0].id=crypto.randomUUID();try{await assert.rejects(call('/api/album-backup/import','POST',quota),/Nothing was imported/);}finally{IDBObjectStore.prototype.put=originalPut;}assert.equal((await request('/api/drawings?collection=album')).items.length,2);
console.log('PASS: album backup round trip, preview without writes, duplicate skip, draft preservation, schema/item/image/size rejection, and atomic quota failure.');

// Wire actual backup UI handlers to real browser storage using isolated DOM doubles.
const {readFile}=await import('node:fs/promises');
const {runInNewContext}=await import('node:vm');
const nodes=new Map(),uiEvents=[];
const ui=id=>{
  if(!nodes.has(id))nodes.set(id,{
    listeners:{},disabled:false,hidden:false,textContent:'',files:[],value:'',
    addEventListener(type,handler){this.listeners[type]=handler;},
    click(){this.clicked=true;return this.listeners.click?.();},
    showModal(){this.open=true;},close(){this.open=false;this.listeners.close?.();},
    focus(){this.focused=true;},
  });
  return nodes.get(id);
};
let downloaded;
const anchor={click(){this.clicked=true;}};
const backupUi=(await readFile('public/backup.js','utf8')).replace(/async function request\(path,options\)\{[^\n]+\}/,'');
runInNewContext(backupUi,{
  document:{getElementById:ui,createElement:tag=>{assert.equal(tag,'a');return anchor;},dispatchEvent:event=>uiEvents.push(event.type)},
  request,Blob,Event,
  URL:{createObjectURL(blob){downloaded=blob;return 'blob:editable-backup';},revokeObjectURL(){}},
  setTimeout:()=>0,
});
const originalDraft=await request('/api/draft');
const exported=await request('/api/album-backup');
await ui('exportAlbum').click();
assert.equal(anchor.clicked,true);
assert.equal(anchor.href,'blob:editable-backup');
assert.match(anchor.download,/^whimsy-grove-album-\d{4}-\d{2}-\d{2}\.json$/);
assert.equal(downloaded.type,'application/json');
const exportedJson=JSON.parse(await downloaded.text());
assert.deepEqual(exportedJson.groves,exported.groves);
const missing=exportedJson.groves.find(g=>g.title==='Imported');
assert.ok(missing);
await call('/api/drawings/'+missing.id,'DELETE',{confirmation:'permanently-delete',collection:'album',title:missing.title});
const beforeImport=await request('/api/album-backup');
assert.equal(beforeImport.groves.length,1);
async function pickDownloadedBackup(){
  ui('albumBackupFile').clicked=false;
  ui('importAlbum').click();
  assert.equal(ui('albumBackupFile').clicked,true);
  const fileInput=ui('albumBackupFile');
  fileInput.files=[downloaded];fileInput.value=anchor.download;
  await fileInput.listeners.change({target:fileInput});
  assert.equal(fileInput.value,'');
  assert.equal(ui('importBackupDialog').open,true);
}
await pickDownloadedBackup();
assert.match(ui('backupSummary').textContent,/2 groves.*1 will be added; 1 already present/);
assert.match(ui('backupTitles').textContent,/Imported/);
assert.deepEqual((await request('/api/album-backup')).groves,beforeImport.groves,'Preview must not write');
ui('cancelImport').click();
assert.equal(ui('importBackupDialog').open,false);
assert.equal(ui('albumOptions').focused,true);
assert.deepEqual((await request('/api/album-backup')).groves,beforeImport.groves,'Cancel must not write');
await pickDownloadedBackup();
await ui('confirmImport').click();
assert.equal(ui('importBackupDialog').open,false);
assert.match(ui('backupStatus').textContent,/Imported 1 grove\. 1 already present skipped\./);
assert.deepEqual(uiEvents,['grove-album-options-close','grove-album-options-close','grove-album-options-close','grove-album-imported']);
const restored=(await request('/api/album-backup')).groves;
assert.equal(restored.length,exportedJson.groves.length);
for(const grove of exportedJson.groves)assert.deepEqual(restored.find(candidate=>candidate.id===grove.id),grove);
assert.deepEqual(await request('/api/draft'),originalDraft);
await pickDownloadedBackup();
assert.equal(ui('confirmImport').disabled,true);
assert.match(ui('backupSummary').textContent,/0 will be added; 2 already present/);
console.log('PASS: actual backup UI handlers download JSON, reopen the downloaded file, preview, cancel, confirm, announce, and skip reimports without scene or Album data loss (isolated storage and DOM doubles).');

// Existing Wind/Snow and new Breeze/Gusts/Blizzard survive draft, Album and editable backup round trips.
for(const effect of ['breeze','wind','gusts','snow','blizzard','mist','mist-wisps','smoke','smog']){
  const windScene={...scene,creationId:crypto.randomUUID(),weather:[effect]};
  await call('/api/draft','PUT',{scope:session.draftScope,editId:crypto.randomUUID(),scene:windScene});
  assert.deepEqual((await request('/api/draft')).draft.scene.weather,[effect]);
  const groveId=crypto.randomUUID();
  await call('/api/drawings','POST',{id:groveId,collection:'album',title:effect,scene:windScene,thumbnail:exportedJson.groves[0].thumbnail});
  const weatherBackup=await request('/api/album-backup');
  const grove=weatherBackup.groves.find(g=>g.id===groveId);
  assert.deepEqual(grove.scene.weather,[effect]);
  await call('/api/drawings/'+groveId,'DELETE',{confirmation:'permanently-delete',collection:'album',title:effect});
  const single={...weatherBackup,groves:[grove]};
  assert.equal((await call('/api/album-backup/preview','POST',single)).add,1);
  assert.equal((await call('/api/album-backup/import','POST',single)).imported,1);
  assert.deepEqual((await request('/api/drawings/'+groveId)).drawing.scene.weather,[effect]);
}
console.log('PASS: Breeze, existing Wind, Gusts, existing Snow, Blizzard, Haze, Mist, Smoke, and Smog persist in drafts, Album, and editable backup restore.');

const ideaContext={window:{}};
runInNewContext(await readFile('public/ideas.js','utf8'),ideaContext);
const ideas=ideaContext.window.GroveIdeas;
for(const idea of ideas){
 const draft={...scene,promptId:idea.id,promptHidden:false,background:idea.biome};
 await call('/api/draft','PUT',{scope:session.draftScope,editId:crypto.randomUUID(),scene:draft});
 assert.equal((await request('/api/draft')).draft.scene.promptId,idea.id);
}
const riverIdea=ideas.find(idea=>idea.id==='river-post-office'),riverGroveId=crypto.randomUUID();
await call('/api/drawings','POST',{id:riverGroveId,collection:'history',scene:{...scene,promptId:riverIdea.id,background:riverIdea.biome},thumbnail:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg=='});
assert.equal((await request('/api/drawings/'+riverGroveId)).drawing.scene.promptId,'river-post-office');
console.log('PASS: all '+ideas.length+' offered ideas can autosave; River Post Office can also save to History.');

// True Album duplicates ignore names and metadata, but preserve visible edits and layer order.
const albumThumbnail=exportedJson.groves[0].thumbnail,originalArtwork={...scene,background:'ruins',seed:72,items:[
  {...scene.items[0],order:0},
  {...scene.items[0],id:'mothman',uid:crypto.randomUUID(),order:1}
]};
const originalArtworkId=crypto.randomUUID(),duplicateArtworkId=crypto.randomUUID();
const albumBeforeDuplicates=(await request('/api/album-backup')).groves.length;
const saveArtwork=(id,title,scene,collection='album')=>call('/api/drawings','POST',{id,collection,title,scene,thumbnail:albumThumbnail});
assert.equal((await saveArtwork(originalArtworkId,'Ruins Moss',originalArtwork)).saved,true);
const sameArtwork={...originalArtwork,creationId:crypto.randomUUID(),promptHidden:true,items:originalArtwork.items.map(item=>({...item,uid:crypto.randomUUID(),order:item.order+5})).reverse()};
assert.deepEqual(await saveArtwork(duplicateArtworkId,'Other Title',sameArtwork),{saved:false,duplicate:true});
assert.equal((await request('/api/album-backup')).groves.length,albumBeforeDuplicates+1);
assert.equal((await request('/api/album-backup')).groves.find(grove=>grove.id===originalArtworkId).title,'Ruins Moss');
assert.equal((await saveArtwork(duplicateArtworkId,null,sameArtwork,'history')).saved,true);
assert.deepEqual(await call('/api/drawings/'+duplicateArtworkId+'/album','POST',{title:'Historical Art'}),{saved:false,duplicate:true});
assert.equal((await request('/api/drawings/'+duplicateArtworkId)).drawing.inAlbum,false);
const changedPosition={...originalArtwork,items:originalArtwork.items.map((item,index)=>index?item:{...item,x:item.x+6})};
assert.equal((await saveArtwork(crypto.randomUUID(),'Moss Shifted',changedPosition)).saved,true);
const changedLayers={...originalArtwork,items:originalArtwork.items.map(item=>({...item,order:1-item.order}))};
assert.equal((await saveArtwork(crypto.randomUUID(),'Front Moss',changedLayers)).saved,true);
assert.equal((await request('/api/album-backup')).groves.length,albumBeforeDuplicates+3);
console.log('PASS: Album rejects duplicate artwork with different names, IDs and metadata; saves changes and preserves History.');

// The displayed Album suggestion is exactly what gets saved, and names cannot clash.
const nameSuggestion=async query=>(await request('/api/album-name?'+query)).title;
assert.equal(await nameSuggestion('biome=ruins'),'Ruins Grove');
const firstNamedId=crypto.randomUUID(),secondNamedId=crypto.randomUUID();
assert.equal((await saveArtwork(firstNamedId,null,{...originalArtwork,seed:201})).drawing.title,'Ruins Grove');
assert.equal(await nameSuggestion('biome=ruins'),'Ruins Grove 2');
assert.equal((await saveArtwork(secondNamedId,'Ruins Grove 2',{...originalArtwork,seed:202})).drawing.title,'Ruins Grove 2');
assert.equal(await nameSuggestion('biome=ruins'),'Ruins Grove 3');
const duplicateTitle={saved:false,titleTaken:true};
assert.deepEqual(await saveArtwork(crypto.randomUUID(),'  rUinS   GROVE  ',{...originalArtwork,seed:203}),duplicateTitle);
const promoteTitleId=crypto.randomUUID();
await saveArtwork(promoteTitleId,null,{...originalArtwork,seed:204},'history');
assert.equal(await nameSuggestion('historyId='+promoteTitleId),'Ruins Grove 3');
assert.deepEqual(await call('/api/drawings/'+promoteTitleId+'/album','POST',{title:'ruins  grove 2'}),duplicateTitle);
assert.equal((await request('/api/drawings/'+promoteTitleId)).drawing.inAlbum,false);
assert.equal((await call('/api/drawings/'+promoteTitleId+'/album','POST',{})).drawing.title,'Ruins Grove 3');
assert.deepEqual(await call('/api/drawings/'+secondNamedId,'PATCH',{title:' Ruins   Grove '}),duplicateTitle);
assert.equal((await call('/api/drawings/'+secondNamedId,'PATCH',{title:' ruins   Grove 2 '})).drawing.title,'ruins Grove 2');
const verifiedTitles=(await request('/api/album-backup')).groves.filter(g=>[firstNamedId,secondNamedId,promoteTitleId].includes(g.id)).map(g=>g.title);
assert.deepEqual(new Set(verifiedTitles),new Set(['Ruins Grove','ruins Grove 2','Ruins Grove 3']));
console.log('PASS: Album suggestions are per biome, are saved as shown, and conflicting names are rejected across save, promotion and rename.');
