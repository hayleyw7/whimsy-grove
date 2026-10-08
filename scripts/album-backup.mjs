import {sceneValue} from '../worker/index.js';
export const MAX_BACKUP_BYTES=20*1024*1024;
export function parseBackup(text,knownIds){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw Error('Choose a backup smaller than 20 MB.');
 let value;try{value=JSON.parse(text);}catch{throw Error('This file is not valid JSON.');}
 if(value?.format!=='whimsy-grove-album'||value.version!==1||!Array.isArray(value.groves)||value.groves.length>1000)throw Error('Use a Whimsy Grove album backup (version 1, at most 1,000 groves).');
 const seen=new Set();
 return value.groves.map(g=>{
  if(!g||typeof g.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(g.id)||seen.has(g.id))throw Error('The backup contains an invalid or repeated grove ID.');seen.add(g.id);
  if(typeof g.title!=='string'||!g.title.trim()||[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(g.title)].length>15)throw Error('A grove name is invalid.');
  const scene=sceneValue(g.scene);if(scene.items.some(x=>!knownIds.has(x.id)))throw Error('This backup uses an unknown item. Update the app before importing.');
  const match=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(g.thumbnail||'');if(!match||match[2].length>650000)throw Error('A backup thumbnail is invalid.');
  let raw;try{raw=atob(match[2]);}catch{throw Error('A backup thumbnail is invalid.');}
  const valid=match[1]==='png'?raw.startsWith('\x89PNG\r\n\x1a\n'):match[1]==='jpeg'?raw.startsWith('\xff\xd8\xff'):raw.startsWith('RIFF')&&raw.slice(8,12)==='WEBP';
  if(!valid||raw.length<20||raw.length>490000)throw Error('A backup thumbnail is invalid.');
  return {id:g.id,title:g.title.trim(),scene,thumbnail:g.thumbnail,createdAt:Number.isSafeInteger(g.createdAt)&&g.createdAt>0&&g.createdAt<=Date.now()?g.createdAt:Date.now()};
 });
}
export function createBackup(rows,images){
 if(rows.length>1000)throw Error('This album exceeds the 1,000-grove backup limit.');let estimatedBytes=0;
 const groves=rows.map(row=>{const image=images.get(row.thumbnail_key);if(!image)throw Error('A saved thumbnail is missing.');estimatedBytes+=Math.ceil(image.bytes.byteLength*4/3)+new TextEncoder().encode(row.scene_json).length+1024;if(estimatedBytes>MAX_BACKUP_BYTES)throw Error('This album exceeds the 20 MB backup limit.');let raw='';for(const byte of new Uint8Array(image.bytes))raw+=String.fromCharCode(byte);return {id:row.id,title:row.album_title||row.title,createdAt:row.created_at,scene:JSON.parse(row.scene_json),thumbnail:'data:'+image.mime+';base64,'+btoa(raw)};});
 const result={format:'whimsy-grove-album',version:1,exportedAt:new Date().toISOString(),groves};if(new TextEncoder().encode(JSON.stringify(result)).length>MAX_BACKUP_BYTES)throw Error('This album exceeds the 20 MB backup limit.');if(groves.length>1000)throw Error('This album exceeds the 1,000-grove backup limit.');return result;
}
