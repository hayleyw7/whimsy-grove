const MAX_BODY = 900000;
const backgrounds = new Set(['none','abandoned-prison','under-bridge','cave','backyard-garden','basement','beach','corn-maze','desert','factory','forest','graveyard','haunted-house','heaven','hell','jungle','pumpkin-patch','river','sandy-dunes','space','steampunk','underwater','void','volcano','wonderland']);
const palettes = new Set(['haunted','candy','bog','dusk','monochrome','ember','ocean','spectral']);
const moons = new Set(['none','full','crescent','half','blood']);
const galaxies = new Set(['none','violet','teal','rose']);
const weather = new Set(['rain','snow','fog','lightning']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function reply(data, status=200) { return Response.json(data, {status, headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff'}}); }
function user(request) { const id=request.headers.get('oai-authenticated-user-id'); return id && id.length<512 ? id : null; }
function database(env) { if(!env.DB?.prepare || !env.BUCKET?.put) throw new Error('Storage unavailable'); return env.DB; }
function sceneValue(value) {
  if(!value || value.version!==2 || !Array.isArray(value.items) || value.items.length>100 || !palettes.has(value.palette) || !backgrounds.has(value.background) || !moons.has(value.moon) || !galaxies.has(value.galaxy) || typeof value.shootingStars!=='boolean' || !Array.isArray(value.weather) || value.weather.length>4 || value.weather.some(x=>!weather.has(x))) throw new Error('Invalid scene');
  const items=value.items.map(v=>{
    if(!v || typeof v.id!=='string' || !/^[a-z][a-z0-9-]{0,47}$/.test(v.id) || typeof v.uid!=='string' || !uuid.test(v.uid) || !Number.isFinite(v.x) || !Number.isFinite(v.y) || v.x < -3600 || v.x > 4800 || v.y < -3600 || v.y > 4680 || !Number.isFinite(v.size) || v.size<35 || v.size>3600 || typeof v.flip!=='boolean' || (v.flipY!==undefined && typeof v.flipY!=='boolean')) throw new Error('Invalid item');
    return {uid:v.uid,id:v.id,x:v.x,y:v.y,size:v.size,flip:v.flip,flipY:!!v.flipY};
  });
  if(new Set(items.map(x=>x.uid)).size!==items.length)throw new Error('Duplicate item');
  return {version:2,items,palette:value.palette,background:value.background,moon:value.moon,galaxy:value.galaxy,shootingStars:value.shootingStars,weather:[...new Set(value.weather)],seed:Number.isSafeInteger(value.seed)?value.seed:8921};
}
function publicRow(row) { return {id:row.id,title:row.title,createdAt:row.created_at,inAlbum:!!row.is_album,inHistory:!!row.is_history,thumbnail:'/api/drawings/'+row.id+'/thumbnail'}; }
async function owned(db,id,owner) {return db.prepare('SELECT * FROM drawings WHERE id = ? AND user_id = ?').bind(id,owner).first();}
async function api(request,env,url) {
  const owner=user(request);
  if(!owner)return reply({error:'Sign in with ChatGPT to use your Album and History.',signIn:'/signin-with-chatgpt?return_to=%2F'},401);
  if(request.method!=='GET') {
    if(request.headers.get('origin')!==url.origin || request.headers.get('x-grove-request')!=='1')return reply({error:'This request could not be verified.'},403);
  }
  if(url.pathname==='/api/session')return reply({signedIn:true,email:request.headers.get('oai-authenticated-user-email')||null,storageReady:!!(env.DB?.prepare&&env.BUCKET?.put)});
  const db=database(env);
  if(url.pathname==='/api/favorites' && request.method==='GET') {
    const result=await db.prepare('SELECT item_id FROM favorite_items WHERE user_id = ? ORDER BY item_id').bind(owner).all();
    return reply({items:result.results.map(row=>row.item_id)});
  }
  if(url.pathname==='/api/favorites' && request.method==='POST') {
    const text=await request.text();if(text.length>300)return reply({error:'Invalid favorite item.'},400);
    let input;try{input=JSON.parse(text);if(!/^[a-z][a-z0-9-]{0,47}$/.test(input.itemId)||typeof input.favorite!=='boolean')throw new Error();}catch{return reply({error:'Invalid favorite item.'},400);}
    if(input.favorite)await db.prepare('INSERT INTO favorite_items (user_id, item_id, created_at) VALUES (?, ?, ?) ON CONFLICT (user_id, item_id) DO NOTHING').bind(owner,input.itemId,Date.now()).run();
    else await db.prepare('DELETE FROM favorite_items WHERE user_id = ? AND item_id = ?').bind(owner,input.itemId).run();
    return reply({saved:true,itemId:input.itemId,favorite:input.favorite});
  }
  if(url.pathname==='/api/drawings' && request.method==='GET') {
    const collection=url.searchParams.get('collection');
    if(!['album','history'].includes(collection))return reply({error:'Choose Album or History.'},400);
    const offset=Math.max(0,Math.min(1000000,Number.parseInt(url.searchParams.get('offset')||'0',10)||0));
    const field=collection==='album'?'is_album':'is_history';
    const result=await db.prepare(`SELECT id, title, created_at, is_album, is_history FROM drawings WHERE user_id = ? AND ${field} = 1 ORDER BY created_at DESC, id DESC LIMIT 49 OFFSET ?`).bind(owner,offset).all();
    return reply({items:result.results.slice(0,48).map(publicRow),nextOffset:result.results.length>48?offset+48:null});
  }
  if(url.pathname==='/api/drawings' && request.method==='POST') {
    if(Number(request.headers.get('content-length')||0)>MAX_BODY)return reply({error:'This drawing is too large to save.'},413);
    const text=await request.text();if(text.length>MAX_BODY)return reply({error:'This drawing is too large to save.'},413);
    let input,scene,bytes,mime;
    try {
      input=JSON.parse(text);if(!uuid.test(input.id)||!['album','history'].includes(input.collection))throw new Error();
      scene=sceneValue(input.scene);
      const match=/^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(input.thumbnail||'');
      if(!match||match[2].length>650000)throw new Error();mime='image/'+match[1];const raw=atob(match[2]);bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));if(bytes.length<20||bytes.length>490000)throw new Error();
    }catch{return reply({error:'The drawing could not be saved in this format.'},400);}
    const existing=await owned(db,input.id,owner);if(existing)return reply({drawing:publicRow(existing),saved:true});
    const key='drawings/'+encodeURIComponent(owner)+'/'+input.id;
    const title=(typeof input.title==='string'?input.title:'Untitled grove').trim().slice(0,100)||'Untitled grove';
    await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:mime},customMetadata:{owner}});
    try {
      await db.prepare('INSERT INTO drawings (id, user_id, scene_json, thumbnail_key, title, created_at, is_album, is_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(input.id,owner,JSON.stringify(scene),key,title,Date.now(),input.collection==='album'?1:0,input.collection==='history'?1:0).run();
    }catch(error){const check=await owned(db,input.id,owner);if(check)return reply({drawing:publicRow(check),saved:true});await env.BUCKET.delete(key).catch(()=>{});throw error;}
    const saved=await owned(db,input.id,owner);if(!saved)throw new Error('Save verification failed');
    return reply({drawing:publicRow(saved),saved:true},201);
  }
  const match=/^\/api\/drawings\/([0-9a-f-]{36})(?:\/(thumbnail|album))?$/.exec(url.pathname);
  if(match && uuid.test(match[1])) {
    const row=await owned(db,match[1],owner);if(!row)return reply({error:'Drawing not found.'},404);
    if(match[2]==='thumbnail' && request.method==='GET') {
      const object=await env.BUCKET.get(row.thumbnail_key);if(!object)return reply({error:'Picture unavailable.'},404);
      return new Response(object.body,{headers:{'content-type':object.httpMetadata?.contentType||'image/webp','cache-control':'private, no-store','x-content-type-options':'nosniff'}});
    }
    if(match[2]==='album' && request.method==='POST') {
      await db.prepare('UPDATE drawings SET is_album = 1 WHERE id = ? AND user_id = ?').bind(row.id,owner).run();
      return reply({saved:true,drawing:{...publicRow(row),inAlbum:true}});
    }
    if(!match[2] && request.method==='GET')return reply({drawing:{...publicRow(row),scene:JSON.parse(row.scene_json)}});
  }
  return reply({error:'Not found.'},404);
}
export default {
  async fetch(request,env,ctx) {
    const url=new URL(request.url);
    try {
      if(url.pathname.startsWith('/api/'))return await api(request,env,url);
      if(env.ASSETS?.fetch)return env.ASSETS.fetch(request);
      return new Response('The garden is temporarily unavailable.',{status:503,headers:{'content-type':'text/plain','cache-control':'no-store'}});
    }catch(error){console.error('Grove request failed',url.pathname,error?.message);return reply({error:'Your drawing was not changed. Account storage is temporarily unavailable. Please try again.'},503);}
  }
};
