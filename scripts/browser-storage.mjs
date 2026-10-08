// Runs the existing scene validation and achievement rules entirely in the browser.
import initSqlJs from 'sql.js';
import worker from '../worker/index.js';
import migrations from './browser-migrations.json';
import catalog from './browser-catalog.json';
import {parseBackup,createBackup} from './album-backup.mjs';
const name='whimsy-grove-'+new URL('.',import.meta.url).pathname;
const ready=Promise.all([initSqlJs({locateFile:()=>{const url=new URL('sql-wasm.wasm',import.meta.url);return url.protocol==='file:'?decodeURIComponent(url.pathname):url.href;}}),new Promise((resolve,reject)=>{const r=indexedDB.open(name,1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);})]);
function stored(db,value){return new Promise((resolve,reject)=>{const tx=db.transaction('state',value?'readwrite':'readonly'),store=tx.objectStore('state'),r=value?store.put(value,'grove'):store.get('grove');tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Browser storage could not save.'));});}
const urls=new Map();
let queue=Promise.resolve();
export function request(path,options={}){
 const run=()=>navigator.locks.request(name,()=>execute(path,options));
 const next=queue.then(run,run);queue=next.catch(()=>{});return next;
}
async function execute(path,options){
 let sql;
 try{
 const [SQL,disk]=await ready,snapshot=await stored(disk);sql=snapshot?new SQL.Database(snapshot.database):new SQL.Database();
 if(!snapshot)for(const migration of migrations)sql.run(migration);
 const images=new Map(snapshot?.images||[]);
 function prepare(query,params=[]){
  const rows=()=>{const stmt=sql.prepare(query);try{stmt.bind(params);const result=[];while(stmt.step())result.push(stmt.getAsObject());return result;}finally{stmt.free();}};
  return {bind:(...args)=>prepare(query,args),first:async column=>{const row=rows()[0]||null;return column?row?.[column]??null:row;},all:async()=>({results:rows()}),run:async()=>{rows();return {success:true};}};
 }
 const DB={prepare,batch:async statements=>{sql.run('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sql.run('COMMIT');return out;}catch(e){sql.run('ROLLBACK');throw e;}}};
 const BUCKET={put:async(key,bytes,meta)=>images.set(key,{bytes,mime:meta.httpMetadata.contentType}),delete:async key=>images.delete(key),get:async key=>{const x=images.get(key);return x?{body:x.bytes,httpMetadata:{contentType:x.mime}}:null;}};
 const method=options.method||'GET';
 if(path.startsWith('/api/album-backup')){
  const owner='browser-local',knownIds=new Set(catalog);
  if(path==='/api/album-backup'&&method==='GET')return createBackup((await DB.prepare('SELECT * FROM drawings WHERE user_id=? AND is_album=1 ORDER BY created_at,id').bind(owner).all()).results,images);
  if(method!=='POST'||!['/api/album-backup/preview','/api/album-backup/import'].includes(path))throw Error('Unknown backup action.');
  const groves=parseBackup(options.body,knownIds),existing=new Set((await DB.prepare('SELECT id FROM drawings WHERE user_id=?').bind(owner).all()).results.map(x=>x.id));
  const additions=groves.filter(g=>!existing.has(g.id)),summary={total:groves.length,add:additions.length,skip:groves.length-additions.length,titles:additions.slice(0,5).map(g=>g.title)};
  if(path.endsWith('/preview'))return summary;
  for(const grove of additions){
   const response=await worker.fetch({url:new URL('/api/drawings',location.origin).href,method:'POST',headers:new Headers({'oai-authenticated-user-id':owner,origin:location.origin,'x-grove-request':'1','content-type':'application/json'}),text:async()=>JSON.stringify({...grove,collection:'album'})},{DB,BUCKET},{});
   const saved=await response.json();if(!response.ok||!saved.saved)throw Error(saved.error||'A grove could not be imported.');
   await DB.prepare('UPDATE drawings SET created_at=? WHERE id=? AND user_id=?').bind(grove.createdAt,grove.id,owner).run();
  }
  // Commit the complete merge once. A failed validation or write leaves the original snapshot intact.
  if(additions.length)await stored(disk,{database:sql.export(),images:[...images]});
  return {...summary,imported:additions.length};
 }

 const res=await worker.fetch({url:new URL(path,location.origin).href,method,headers:new Headers({'oai-authenticated-user-id':'browser-local','origin':location.origin,'x-grove-request':'1','content-type':'application/json'}),text:async()=>options.body||''},{DB,BUCKET},{});
 const result=await res.json();if(!res.ok)throw Error(result.error||'Browser storage could not complete this action.');
 // Confirm persistence before returning a successful save to the editor.
 if(!snapshot||method!=='GET')await stored(disk,{database:sql.export(),images:[...images]});
 for(const item of [...(result.items||[]),...(result.drawing?[result.drawing]:[])])if(item.thumbnail){const image=images.get('drawings/browser-local/'+item.id);if(image){if(!urls.has(item.id))urls.set(item.id,URL.createObjectURL(new Blob([image.bytes],{type:image.mime})));item.thumbnail=urls.get(item.id);}}
 if(method==='DELETE'){const id=path.split('/').pop();if(urls.has(id)){URL.revokeObjectURL(urls.get(id));urls.delete(id);}}
 return result;
 }catch(error){console.error('Browser storage failed',error);if(path.startsWith('/api/album-backup'))throw Error(error.name==='QuotaExceededError'?'There is not enough browser space. Nothing was imported.':error.message);throw Error('Could not access browser storage. It may be full or blocked. Your last confirmed save is unchanged. '+(error.name==='QuotaExceededError'?'Free some space and try again.':''),{cause:error});}
 finally{sql?.close();}
}
