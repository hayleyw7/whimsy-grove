import {DatabaseSync} from 'node:sqlite';
import {randomBytes, createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';

export async function createLocalStorage(root,data){

await mkdir(data,{recursive:true,mode:0o700});
await mkdir(resolve(data,'images'),{recursive:true,mode:0o700});
const sqlite=new DatabaseSync(resolve(data,'groves.sqlite'));
sqlite.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
const journal=JSON.parse(await readFile(resolve(root,'drizzle/meta/_journal.json'),'utf8'));
for(const {tag} of journal.entries){
  if(sqlite.prepare('SELECT name FROM local_migrations WHERE name=?').get(tag))continue;
  const sql=await readFile(resolve(root,'drizzle',tag+'.sql'),'utf8');
  sqlite.exec('BEGIN');
  try{sqlite.exec(sql);sqlite.prepare('INSERT INTO local_migrations VALUES (?)').run(tag);sqlite.exec('COMMIT');}
  catch(error){sqlite.exec('ROLLBACK');throw error;}
}
function statement(sql,args=[]){return {
  bind(...values){return statement(sql,values);},
  first(column){const row=sqlite.prepare(sql).get(...args);return column?row?.[column]??null:row??null;},
  all(){return {results:sqlite.prepare(sql).all(...args),success:true};},
  run(){const result=sqlite.prepare(sql).run(...args);return {success:true,meta:{changes:Number(result.changes)}};},
};}
const DB={prepare:statement,batch(items){sqlite.exec('BEGIN');try{const out=items.map(x=>x.all());sqlite.exec('COMMIT');return out;}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
const bucketPath=key=>resolve(data,'images',createHash('sha256').update(key).digest('hex'));
const BUCKET={
  async put(key,bytes,metadata){const p=bucketPath(key),temp=p+'.'+randomBytes(8).toString('hex');await writeFile(temp,bytes,{mode:0o600});await rename(temp,p);await writeFile(p+'.json',JSON.stringify(metadata),{mode:0o600});},
  async get(key){try{return {body:await readFile(bucketPath(key)),...JSON.parse(await readFile(bucketPath(key)+'.json','utf8'))};}catch(error){if(error.code==='ENOENT')return null;throw error;}},
  async delete(key){for(const suffix of ['', '.json'])await unlink(bucketPath(key)+suffix).catch(error=>{if(error.code!=='ENOENT')throw error;});},
};

return {DB,BUCKET,close:()=>sqlite.close()};
}
