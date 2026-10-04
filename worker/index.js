const promptIds=new Set(["moonlit-garden", "pond-gathering", "cozy-witch-corner", "tide-pool-treasures", "crystal-hideaway", "rooftop-stargazers", "greenhouse-wanderer", "swamp-lanterns", "snowy-neighbors", "cosmic-visitors", "forgotten-fairy-ring", "curious-keepsakes"]);
const saveNamePrefixes={"attic":"Loft","backyard-garden":"Yard","basement":"Below","beach":"Shore","none":"Blank","under-bridge":"Span","cave":"Cave","corn-maze":"Maize","crystal-cavern":"Gem","desert":"Arid","sandy-dunes":"Dunes","ember-river":"Ember","factory":"Works","forest":"Woods","frozen-lake":"Frost","gnome-hollow":"Gnome","graveyard":"Grave","greenhouse":"Glass","haunted-house":"Haunt","haze":"Haze","heaven":"Halo","hell":"Hell","jungle":"Vines","abandoned-prison":"Cell","pumpkin-patch":"Patch","river":"River","rooftop":"Roof","ruins":"Ruins","space":"Orbit","steampunk":"Brass","swamp":"Swamp","tide-pools":"Tide","underwater":"Deep","void":"Void","volcano":"Lava","wonderland":"Fable"};
const MAX_BODY = 900000;
const backgrounds = new Set(['none','swamp','greenhouse','tide-pools','ruins','attic','crystal-cavern','frozen-lake','rooftop','haze','gnome-hollow','ember-river','abandoned-prison','under-bridge','cave','backyard-garden','basement','beach','corn-maze','desert','factory','forest','graveyard','haunted-house','heaven','hell','jungle','pumpkin-patch','river','sandy-dunes','space','steampunk','underwater','void','volcano','wonderland']);
const palettes = new Set(['haunted','candy','bog','dusk','monochrome','ember','ocean','spectral']);
const moons = new Set(['none','full','crescent','half','blood']);
const galaxies = new Set(['none','violet','teal','rose']);
const weather = new Set(['rain','snow','fog','lightning']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function reply(data, status=200) { return Response.json(data, {status, headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff'}}); }
function user(request) { const id=request.headers.get('oai-authenticated-user-id'); return id && id.length<512 ? id : null; }
function database(env) { if(!env.DB?.prepare || !env.DB?.batch || !env.BUCKET?.put) throw new Error('Storage unavailable'); return env.DB; }
function sceneValue(value) {
  if(!value || value.version!==2 || !Array.isArray(value.items) || value.items.length>100 || !palettes.has(value.palette) || !backgrounds.has(value.background) || !moons.has(value.moon) || !galaxies.has(value.galaxy) || typeof value.shootingStars!=='boolean' || !Array.isArray(value.weather) || value.weather.length>4 || value.weather.some(x=>!weather.has(x))) throw new Error('Invalid scene');
  if((value.promptId!==undefined&&value.promptId!==null&&!promptIds.has(value.promptId))||(value.promptHidden!==undefined&&typeof value.promptHidden!=='boolean'))throw new Error('Invalid inspiration');
  if((value.motion!==undefined&&typeof value.motion!=='boolean')||(value.creationId!==undefined&&!uuid.test(value.creationId)))throw new Error('Invalid scene preferences');
  const items=value.items.map(v=>{
    if(!v || typeof v.id!=='string' || !/^[a-z][a-z0-9-]{0,47}$/.test(v.id) || typeof v.uid!=='string' || !uuid.test(v.uid) || !Number.isFinite(v.x) || !Number.isFinite(v.y) || v.x < -3600 || v.x > 4800 || v.y < -3600 || v.y > 4680 || !Number.isFinite(v.size) || v.size<35 || v.size>3600 || typeof v.flip!=='boolean' || (v.order!==undefined&&(!Number.isSafeInteger(v.order)||v.order<0)) || (v.flipY!==undefined && typeof v.flipY!=='boolean') || (v.rotation!==undefined && (!Number.isFinite(v.rotation) || Math.abs(v.rotation)>180))) throw new Error('Invalid item');
    return {uid:v.uid,...(v.order===undefined?{}:{order:v.order}),id:v.id,x:v.x,y:v.y,size:v.size,flip:v.flip,flipY:!!v.flipY,rotation:v.rotation||0};
  });
  if(new Set(items.map(x=>x.uid)).size!==items.length)throw new Error('Duplicate item');
  return {version:2,...(value.promptId===undefined?{}:{promptId:value.promptId}),...(value.promptHidden===undefined?{}:{promptHidden:value.promptHidden}),...(value.creationId===undefined?{}:{creationId:value.creationId}),...(value.motion===undefined?{}:{motion:value.motion}),items,palette:value.palette,background:value.background,moon:value.moon,galaxy:value.galaxy,shootingStars:value.shootingStars,weather:[...new Set(value.weather)],seed:Number.isSafeInteger(value.seed)?value.seed:8921};
}
const nameSegments=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
const nameCharacters=value=>nameSegments?Array.from(nameSegments.segment(value),part=>part.segment):Array.from(value);
const namePrefixes=value=>value===null?null:JSON.stringify(Array.from({length:16},(_,n)=>nameCharacters(value).slice(0,n).join('')));
function displayTitle(row,collection='history'){const title=collection==='album'?(row.album_title||row.title):row.title;return /^Auto save \d+$/.test(title)&&(collection==='history'||title===row.title)?title.replace('Auto save ','Auto Save '):title;}
function publicRow(row,collection='history') { return {id:row.id,title:displayTitle(row,collection),createdAt:row.created_at,inAlbum:!!row.is_album,inHistory:!!row.is_history,thumbnail:'/api/drawings/'+row.id+'/thumbnail'}; }
async function owned(db,id,owner) {return db.prepare('SELECT * FROM drawings WHERE id = ? AND user_id = ?').bind(id,owner).first();}
async function draftScope(owner) {const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('spooky-grove-draft:'+owner));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
function draftRow(row){return row?{scene:JSON.parse(row.scene_json),editId:row.edit_id,updatedAt:row.updated_at}:null;}
const animalKinds={cat:'cat','black-cat':'cat','sleeping-cat':'cat','stretching-cat':'cat','tuxedo-cat':'cat','white-longhaired-cat':'cat','grizzly-bear':'bear','polar-bear':'bear','red-panda':'panda','giant-panda':'panda',tadpole:'frog'};
const animalIds=new Set(['cat','black-cat','sleeping-cat','stretching-cat','tuxedo-cat','white-longhaired-cat','grizzly-bear','polar-bear','red-panda','giant-panda','frog','tadpole','snail','bunny','raccoon','bat','possum','shrimp','raven','spider','fox','owl','hedgehog','mouse','penguin','dolphin','octopus','falcon','wolf','waterbear','squid','trex','triceratops','deer','whale','manatee','seal','starfish','snake','lizard','turtle','butterfly','chipmunk','dove','jellyfish','worm','caterpillar','ladybug','dragonfly','horse']);
const plantIds=new Set(['beanstalk','cactus','lily-pad','leaf','leaf-pile','grass','weeds','clovers','coral','pine','moss','lily','morning-glory','dandelion','poppy-seeds','cannabis','fern','rose','nightshade','sapling','flytrap','pumpkin','jack','vines','willow-tree','birch-tree','bare-tree','bush']);
const nocturnalIds=new Set(['cat','black-cat','sleeping-cat','stretching-cat','tuxedo-cat','white-longhaired-cat','bat','owl','possum','raccoon','hedgehog','wolf','fox','frog','mothman']);
const crystalIds=new Set(['crystal-point','crystal-heart','crystal-sphere','crystals','crystal-ball']);
function badgeStatement(db,owner,id,time=Date.now()){return db.prepare('INSERT INTO achievement_badges (user_id,badge_id,earned_at) VALUES (?,?,?) ON CONFLICT(user_id,badge_id) DO UPDATE SET earned_at=min(achievement_badges.earned_at,excluded.earned_at)').bind(owner,id,time);}
async function creationHash(scene){const value={background:scene.background,palette:scene.palette,moon:scene.moon,galaxy:scene.galaxy,shootingStars:scene.shootingStars,weather:[...scene.weather].sort(),seed:scene.seed,items:scene.items.map(({id,x,y,size,flip,flipY,rotation})=>({id,x,y,size,flip,flipY:!!flipY,rotation:rotation||0}))};const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)));return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');}
async function savedAchievementStatements(db,owner,row){let scene;try{scene=sceneValue(JSON.parse(row.scene_json));}catch{return [db.prepare('INSERT OR IGNORE INTO achievement_scans (user_id,drawing_id) VALUES (?,?)').bind(owner,row.id)];}const hash=await creationHash(scene),lineage=scene.creationId||row.id,time=row.created_at||Date.now(),ids=new Set(scene.items.map(x=>x.id));const statements=[db.prepare('INSERT OR IGNORE INTO achievement_creations (user_id,creation_id,content_hash,saved_at) SELECT ?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM achievement_contents WHERE user_id=? AND content_hash=?)').bind(owner,lineage,hash,time,owner,hash),db.prepare('INSERT OR IGNORE INTO achievement_contents (user_id,content_hash) VALUES (?,?)').bind(owner,hash),db.prepare('INSERT OR IGNORE INTO achievement_biomes (user_id,biome_id,saved_at) VALUES (?,?,?)').bind(owner,scene.background,time),badgeStatement(db,owner,'first-sprout',time)];
const earned=[];if(scene.items.length)earned.push('first-item');if(new Set([...ids].filter(id=>animalIds.has(id)).map(id=>animalKinds[id]||id)).size>=3)earned.push('a-little-company');if((scene.moon!=='none'||[...ids].some(id=>id.startsWith('moon-')||id==='lunar-eclipse'))&&[...ids].some(id=>plantIds.has(id))&&[...ids].some(id=>nocturnalIds.has(id)))earned.push('night-garden');if(scene.items.length>=1&&scene.items.length<=5)earned.push('tiny-world');if([...ids].filter(id=>crystalIds.has(id)).length>=3)earned.push('crystal-collector');if(scene.items.some(x=>x.flip||x.flipY)&&scene.items.some(x=>Math.abs(x.rotation||0)>.01))earned.push('a-new-perspective');if(promptIds.has(scene.promptId))earned.push('inspired');for(const id of earned)statements.push(badgeStatement(db,owner,id,time));for(const [count,id]of [[10,'ten-groves'],[50,'fifty-groves'],[100,'hundred-groves']])statements.push(db.prepare('INSERT OR IGNORE INTO achievement_badges (user_id,badge_id,earned_at) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM achievement_creations WHERE user_id=?)>=?').bind(owner,id,time,owner,count));statements.push(db.prepare('INSERT OR IGNORE INTO achievement_badges (user_id,badge_id,earned_at) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM achievement_biomes WHERE user_id=?)>=5').bind(owner,'world-wanderer',time,owner));statements.push(db.prepare('INSERT OR IGNORE INTO achievement_scans (user_id,drawing_id) VALUES (?,?)').bind(owner,row.id));return statements;}
async function recordSavedAchievements(db,owner,row){await db.batch(await savedAchievementStatements(db,owner,row));}
async function progressPayload(db,owner,hasMore=false){const [earned,completed,creations,biomes]=await Promise.all([db.prepare('SELECT badge_id,earned_at FROM achievement_badges WHERE user_id=? ORDER BY earned_at,badge_id').bind(owner).all(),db.prepare('SELECT prompt_id,completed_at FROM prompt_completions WHERE user_id=? ORDER BY completed_at,prompt_id').bind(owner).all(),db.prepare('SELECT COUNT(*) AS count FROM achievement_creations WHERE user_id=?').bind(owner).first(),db.prepare('SELECT COUNT(*) AS count FROM achievement_biomes WHERE user_id=?').bind(owner).first()]);return {scope:await draftScope(owner),earned:earned.results.map(x=>({id:x.badge_id,earnedAt:x.earned_at})),completedPrompts:completed.results.map(x=>x.prompt_id),savedCount:creations.count,biomeCount:biomes.count,hasMore};}
async function achievementApi(request,db,owner,url){if(request.method!=='POST')return reply({error:'Use a verified progress request.'},405);const text=await request.text();if(text.length>2000)return reply({error:'Invalid progress request.'},400);let input;try{input=JSON.parse(text);if(input.scope!==await draftScope(owner))return reply({error:'Your account changed. Refresh before syncing progress.'},409);}catch{return reply({error:'Invalid progress request.'},400);}if(url.pathname==='/api/achievements/sync'){const draft=await db.prepare('SELECT scene_json FROM current_drafts WHERE user_id=?').bind(owner).first();if(draft){let hasItems=false;try{hasItems=sceneValue(JSON.parse(draft.scene_json)).items.length>0;}catch{}if(hasItems)await badgeStatement(db,owner,'first-item').run();}const rows=await db.prepare('SELECT d.id,d.scene_json,d.created_at FROM drawings d WHERE d.user_id=? AND d.is_album=1 AND NOT EXISTS (SELECT 1 FROM achievement_scans s WHERE s.user_id=d.user_id AND s.drawing_id=d.id) ORDER BY d.created_at,d.id LIMIT 20').bind(owner).all();for(const row of rows.results)await recordSavedAchievements(db,owner,row);return reply(await progressPayload(db,owner,rows.results.length===20));}if(url.pathname==='/api/achievements/event'){const badges={first_item:'first-item',share:'share-a-grove',download:'take-it-with-you'};if(badges[input.type])await badgeStatement(db,owner,badges[input.type]).run();else if(input.type==='finish'&&promptIds.has(input.promptId))await db.prepare('INSERT OR IGNORE INTO prompt_completions (user_id,prompt_id,completed_at) VALUES (?,?,?)').bind(owner,input.promptId,Date.now()).run();else return reply({error:'Unknown progress event.'},400);return reply(await progressPayload(db,owner));}return reply({error:'Not found.'},404);}

async function api(request,env,url) {
  const owner=user(request);
  if(url.pathname==='/api/session' && request.method==='GET')return reply({signedIn:!!owner,draftScope:owner?await draftScope(owner):null,storageReady:!!(owner&&env.DB?.prepare&&env.DB?.batch&&env.BUCKET?.put)});
  if(!owner)return reply({error:'Sign in with ChatGPT to use your Album and History.',signIn:'/signin-with-chatgpt?return_to=%2F'},401);
  if(request.method!=='GET') {
    if(request.headers.get('origin')!==url.origin || request.headers.get('x-grove-request')!=='1')return reply({error:'This request could not be verified.'},403);
  }
  const db=database(env);
  if(url.pathname.startsWith('/api/achievements/'))return achievementApi(request,db,owner,url);
  if(url.pathname==='/api/draft' && request.method==='GET') {
    const row=await db.prepare('SELECT scene_json, edit_id, updated_at FROM current_drafts WHERE user_id = ?').bind(owner).first();
    return reply({draft:draftRow(row),scope:await draftScope(owner)});
  }
  if(url.pathname==='/api/draft' && request.method==='PUT') {
    const text=await request.text();if(text.length>100000)return reply({error:'This creation is too large to keep.'},413);
    let input,scene;try{input=JSON.parse(text);scene=sceneValue(input.scene);if(!uuid.test(input.editId)||typeof input.scope!=='string'||(input.initialize!==undefined&&typeof input.initialize!=='boolean'))throw Error();}catch{return reply({error:'The current creation could not be saved in this format.'},400);}
    const scope=await draftScope(owner);if(input.scope!==scope)return reply({error:'Your signed-in account changed. Refresh before continuing.'},409);
    const conflict=input.initialize?'DO NOTHING':'DO UPDATE SET scene_json = excluded.scene_json, edit_id = excluded.edit_id, updated_at = excluded.updated_at WHERE current_drafts.edit_id != excluded.edit_id';
    let row=await db.prepare(`INSERT INTO current_drafts (user_id,scene_json,edit_id,updated_at) VALUES (?,?,?,?) ON CONFLICT(user_id) ${conflict} RETURNING scene_json, edit_id, updated_at`).bind(owner,JSON.stringify(scene),input.editId,Date.now()).first();
    if(!row)row=await db.prepare('SELECT scene_json, edit_id, updated_at FROM current_drafts WHERE user_id = ?').bind(owner).first();
    if(!row)throw Error('Current creation save verification failed');
    return reply({saved:true,draft:draftRow(row),scope});
  }

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
    const titleField=collection==='album'?'COALESCE(album_title, title)':'title';
    const sorts={newest:'created_at DESC, id DESC',oldest:'created_at ASC, id ASC',az:titleField+' COLLATE NOCASE ASC, created_at ASC, id ASC'};
    const sort=Object.hasOwn(sorts,url.searchParams.get('sort'))&&(collection==='album'||url.searchParams.get('sort')!=='az')?url.searchParams.get('sort'):'newest';
    const result=await db.prepare(`SELECT id, title, album_title, created_at, is_album, is_history FROM drawings WHERE user_id = ? AND ${field} = 1 ORDER BY ${sorts[sort]} LIMIT 49 OFFSET ?`).bind(owner,offset).all();
    return reply({items:result.results.slice(0,48).map(row=>publicRow(row,collection)),nextOffset:result.results.length>48?offset+48:null});
  }
  if(url.pathname==='/api/drawings' && request.method==='POST') {
    if(Number(request.headers.get('content-length')||0)>MAX_BODY)return reply({error:'This creation is too large to save.'},413);
    const text=await request.text();if(text.length>MAX_BODY)return reply({error:'This creation is too large to save.'},413);
    let input,scene,bytes,mime,albumTitle=null;
    try {
      input=JSON.parse(text);if(!uuid.test(input.id)||!['album','history'].includes(input.collection))throw new Error();
      scene=sceneValue(input.scene);
      if(input.collection==='album'&&input.title!==undefined&&input.title!==null){if(typeof input.title!=='string')throw Error();albumTitle=input.title.trim().replace(/\s+/g,' ')||null;if(albumTitle&&nameCharacters(albumTitle).length>15)throw Error();}
      const match=/^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(input.thumbnail||'');
      if(!match||match[2].length>650000)throw new Error();mime='image/'+match[1];const raw=atob(match[2]);bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));if(bytes.length<20||bytes.length>490000)throw new Error();
    }catch{return reply({error:'The creation could not be saved in this format.'},400);}
    const existing=await owned(db,input.id,owner);if(existing)return reply({drawing:publicRow(existing,input.collection),saved:true});
    const key='drawings/'+encodeURIComponent(owner)+'/'+input.id;
    await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:mime},customMetadata:{owner}});
    try {
      const history=input.collection==='history';
      const counter=history?'history_count':'album_count';
      const increment=db.prepare(`INSERT INTO drawing_sequences (user_id, history_count, album_count) VALUES (?, ?, ?) ON CONFLICT (user_id) DO UPDATE SET ${counter} = ${counter} + 1`).bind(owner,history?1:0,history?0:1);
      if(history){
        const insert=db.prepare("INSERT INTO drawings (id, user_id, scene_json, thumbnail_key, title, created_at, is_album, is_history, history_number, album_title) SELECT ?, user_id, ?, ?, 'Auto Save ' || history_count, ?, 0, 1, history_count, NULL FROM drawing_sequences WHERE user_id = ?").bind(input.id,JSON.stringify(scene),key,Date.now(),owner);
        await db.batch([increment,insert]);
      }else{
        const insert=db.prepare(`WITH RECURSIVE
          base(name,prefixes,number) AS (SELECT COALESCE(?, CASE WHEN album_count<=999 THEN ? || ' Grove ' || album_count ELSE 'Grove ' || album_count END), ?, album_count FROM drawing_sequences WHERE user_id = ?),
          candidates(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM candidates WHERE n <= (SELECT COUNT(*) FROM drawings WHERE user_id = ? AND is_album = 1)),
          names(n,name) AS (SELECT n, CASE WHEN n = 1 THEN base.name ELSE (CASE WHEN base.prefixes IS NULL THEN CASE WHEN length('Grove ' || base.number || ' (' || n || ')')<=15 THEN 'Grove ' || base.number ELSE 'G' || base.number END ELSE json_extract(base.prefixes,'$[' || max(0,15-length(' (' || n || ')')) || ']') END) || ' (' || n || ')' END FROM candidates,base)
          INSERT INTO drawings (id,user_id,scene_json,thumbnail_key,title,created_at,is_album,is_history,history_number,album_title)
          SELECT ?,user_id,?,?,'Grove ' || album_count,?,1,0,NULL,
            (SELECT name FROM names WHERE NOT EXISTS (SELECT 1 FROM drawings d WHERE d.user_id = ? AND d.is_album = 1 AND COALESCE(d.album_title,d.title) = names.name COLLATE NOCASE) ORDER BY n LIMIT 1)
          FROM drawing_sequences WHERE user_id = ?`).bind(albumTitle,saveNamePrefixes[scene.background],namePrefixes(albumTitle),owner,owner,input.id,JSON.stringify(scene),key,Date.now(),owner,owner);
        await db.batch([increment,insert,...await savedAchievementStatements(db,owner,{id:input.id,scene_json:JSON.stringify(scene),created_at:Date.now()})]);
      }
    }catch(error){const check=await owned(db,input.id,owner);if(check)return reply({drawing:publicRow(check,input.collection),saved:true});await env.BUCKET.delete(key).catch(()=>{});throw error;}
    const saved=await owned(db,input.id,owner);if(!saved)throw new Error('Save verification failed');
    return reply({drawing:publicRow(saved,input.collection),saved:true},201);
  }
  const match=/^\/api\/drawings\/([0-9a-f-]{36})(?:\/(thumbnail|album))?$/.exec(url.pathname);
  if(match && uuid.test(match[1])) {
    const row=await owned(db,match[1],owner);if(!row)return reply({error:'Creation not found.'},404);
    if(match[2]==='thumbnail' && request.method==='GET') {
      const object=await env.BUCKET.get(row.thumbnail_key);if(!object)return reply({error:'Picture unavailable.'},404);
      return new Response(object.body,{headers:{'content-type':object.httpMetadata?.contentType||'image/webp','cache-control':'private, no-store','x-content-type-options':'nosniff'}});
    }
    if(match[2]==='album' && request.method==='POST') {
      if(row.is_album)return reply({saved:true,drawing:publicRow(row,'album')});
      let title;try{const body=await request.text();if(body.length>1000)throw Error();const input=JSON.parse(body||'{}');if(input.title!==undefined&&typeof input.title!=='string')throw Error();title=input.title?.trim().replace(/\s+/g,' ')||displayTitle(row);if(nameCharacters(title).length>15)throw Error();}catch{return reply({error:'Choose a name up to 15 characters.'},400);}
      const promoteStatement=db.prepare(`WITH RECURSIVE
        candidates(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM candidates WHERE n <= (SELECT COUNT(*) FROM drawings WHERE user_id = ? AND is_album = 1)),
        names(n,name) AS (SELECT n, CASE WHEN n=1 THEN ? ELSE json_extract(?,'$[' || max(0,15-length(' (' || n || ')')) || ']') || ' (' || n || ')' END FROM candidates)
        UPDATE drawings SET is_album=1, album_title=(SELECT name FROM names WHERE NOT EXISTS (SELECT 1 FROM drawings d WHERE d.user_id = ? AND d.is_album=1 AND d.id != ? AND COALESCE(d.album_title,d.title)=names.name COLLATE NOCASE) ORDER BY n LIMIT 1)
        WHERE id=? AND user_id=? AND is_album=0`).bind(owner,title,namePrefixes(title),owner,row.id,row.id,owner);
      await db.batch([promoteStatement,...await savedAchievementStatements(db,owner,{...row,created_at:Date.now()})]);
      return reply({saved:true,drawing:publicRow(await owned(db,row.id,owner),'album')});
    }
    if(!match[2] && request.method==='PATCH') {
      if(!row.is_album)return reply({error:'Only Album creations can be renamed.'},400);
      let title;try{const text=await request.text();if(text.length>1000)throw new Error();title=JSON.parse(text).title;if(typeof title!=='string')throw new Error();title=title.trim().replace(/\s+/g,' ');if(!title||nameCharacters(title).length>15)throw new Error();}catch{return reply({error:'Choose a name between 1 and 15 characters.'},400);}
      const changes=[db.prepare('UPDATE drawings SET album_title = ? WHERE id = ? AND user_id = ? AND is_album = 1').bind(title,row.id,owner)];
      if(title!==(row.album_title||row.title))changes.push(badgeStatement(db,owner,'make-it-yours'));
      await db.batch(changes);const renamed=await owned(db,row.id,owner);if(!renamed)return reply({error:'Creation not found.'},404);
      return reply({saved:true,drawing:publicRow(renamed,'album')});
    }
    if(!match[2] && request.method==='DELETE') {
      let input;try{const text=await request.text();if(text.length>1000)throw new Error();input=JSON.parse(text);if(input.confirmation!=='permanently-delete'||!['album','history'].includes(input.collection)||typeof input.title!=='string')throw new Error();}catch{return reply({error:'Confirm the permanent deletion of this creation first.'},400);}
      const collection=input.collection;if(!(collection==='album'?row.is_album:row.is_history))return reply({error:'Creation not found.'},404);
      if(input.title!==displayTitle(row,collection))return reply({error:'This creation changed. Open it again before deleting it.'},409);
      const storedTitle=collection==='album'?(row.album_title||row.title):row.title;
      const titleField=collection==='album'?'COALESCE(album_title, title)':'title';
      const removed=await db.prepare(`DELETE FROM drawings WHERE id = ? AND user_id = ? AND ${titleField} = ? RETURNING thumbnail_key`).bind(row.id,owner,storedTitle).first();
      if(!removed)return reply({error:'This creation changed. Open it again before deleting it.'},409);
      let cleanupPending=false;try{await env.BUCKET.delete(removed.thumbnail_key);}catch{cleanupPending=true;}
      return reply({deleted:true,cleanupPending});
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
    }catch(error){console.error('Grove request failed',url.pathname,error?.message);return reply({error:'Your creation was not changed. Account storage is temporarily unavailable. Please try again.'},503);}
  }
};
