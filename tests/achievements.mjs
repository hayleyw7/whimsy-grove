import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import initSqlJs from 'sql.js';
import worker from '../worker/index.js';

const SQL=await initSqlJs(), sql=new SQL.Database();
for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort()){
 sql.run(await readFile('drizzle/'+file,'utf8'));
}
function prepare(query,params=[]){
 const rows=()=>{
  const stmt=sql.prepare(query);
  try{stmt.bind(params);const out=[];while(stmt.step())out.push(stmt.getAsObject());return out;}
  finally{stmt.free();}
 };
 return {
  bind:(...args)=>prepare(query,args),
  first:async()=>rows()[0]||null,
  all:async()=>({results:rows()}),
  run:async()=>{rows();return {success:true};}
 };
}
const DB={prepare,batch:async statements=>{
 sql.run('BEGIN');
 try{const out=[];for(const s of statements)out.push(await s.run());sql.run('COMMIT');return out;}
 catch(e){sql.run('ROLLBACK');throw e;}
}};
const env={DB,BUCKET:{put:async()=>{}}};
const url='https://example.test';
async function call(path,owner,body){
 const headers={'oai-authenticated-user-id':owner};
 const init=body?{method:'POST',headers:{...headers,origin:url,'x-grove-request':'1'},body:JSON.stringify(body)}:{headers};
 const response=await worker.fetch(new Request(url+path,init),env);
 const result=await response.json();
 assert(response.ok,JSON.stringify(result));
 return result;
}
const scope=async owner=>(await call('/api/session',owner)).draftScope;
const sync=async owner=>call('/api/achievements/sync',owner,{scope:await scope(owner)});
const badge=result=>result.earned.find(x=>x.id==='storm-chaser');
sql.run("INSERT INTO achievement_observations(user_id,kind,value,saved_at) VALUES ('existing','weather','thunderstorm',123)");
assert.deepEqual(badge(await sync('existing')),{id:'storm-chaser',earnedAt:123});
assert.deepEqual(badge(await sync('existing')),{id:'storm-chaser',earnedAt:123});
assert.equal(badge(await sync('new')),undefined);

const scene={version:2,creationId:crypto.randomUUID(),items:[{id:'lightning',uid:crypto.randomUUID(),x:500,y:500,size:100,flip:false}],palette:'haunted',background:'cave',moon:'none',galaxy:'none',shootingStars:false,weather:['heavy-rain'],seed:8921};
const thumbnail='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
let fixtures=0;
const save=async (scene,collection='album')=>{
 const result=await call('/api/drawings','new',{id:crypto.randomUUID(),collection,title:'Fixture '+ ++fixtures,scene,thumbnail});
 assert(result.saved,JSON.stringify(result));
 return result;
};
await save(scene);
assert.equal(badge(await sync('new')),undefined,'Downpour and a lightning oddity do not count');
const storm={...scene,creationId:crypto.randomUUID(),weather:['thunderstorm'],items:[{...scene.items[0],id:'fern'}]};
const historical=await save(storm,'history');
assert.equal(badge(await sync('new')),undefined,'An auto-saved History entry is not an Album save');
const saved=await call('/api/drawings/'+historical.drawing.id+'/album','new',{title:'Saved Storm'});
assert(saved.saved);
assert.ok(badge(await sync('new')),'Promoting the Storm to Album earns the badge');

const badges=runInNewContext((await readFile('public/achievements.js','utf8'))+';window.GroveBadges',{window:{}});
for(const {title} of badges){
 assert.doesNotMatch(title,/^(?:a|the)\s|\band\b/i);
}
assert.equal(badges.length%2,0);
assert.equal(badges.find(x=>x.id==='storm-chaser').icon,'lightning');
console.log('PASS: Storm Chaser earns on Album save and backfills from existing Storm observations.');

const makeScene=(itemIds,background='cave')=>({
 ...scene,creationId:crypto.randomUUID(),weather:[],background,
 items:itemIds.map(id=>({...scene.items[0],id,uid:crypto.randomUUID()}))
});
const earnedIds=result=>new Set(result.earned.map(x=>x.id));
const addedIds=['deep-dive','familiar-faces','after-hours','close-encounters'];
const negativeScenes=[
 makeScene(['submarine','dolphin']),
 makeScene(['submarine','bunny'],'underwater'),
 makeScene(['cat','cat','sleeping-cat']),
 makeScene(['ghost','single-candle']),
 makeScene(['ufo','dolphin'])
];
for(const fixture of negativeScenes)await save(fixture);
const before=earnedIds(await sync('new'));
for(const id of addedIds)assert(!before.has(id),id+' should not award for partial matches');

const positiveScenes=[
 makeScene(['submarine','jellyfish'],'underwater'),
 makeScene(['cat','tuxedo-cat','sleeping-cat']),
 makeScene(['ghost','single-candle','mirror']),
 makeScene(['ufo','bunny'])
];
for(const [index,fixture] of positiveScenes.entries()){
 await save(fixture);
 const award=await DB.prepare('SELECT earned_at FROM achievement_badges WHERE user_id=? AND badge_id=?').bind('new',addedIds[index]).first();
 assert(award,addedIds[index]+' should award on save');
}
assert.equal(badges.length,30);
for(const id of addedIds)assert(badges.some(x=>x.id===id&&x.icon));

// Recreate previous rules: existing Album drawings were already scanned, without these four badges.
sql.run("DELETE FROM achievement_badges WHERE user_id='new' AND badge_id IN ('deep-dive','familiar-faces','after-hours','close-encounters')");
sql.run("UPDATE achievement_scans SET rule_version=2 WHERE user_id='new'");
const oldCount=(await DB.prepare('SELECT COUNT(*) AS count FROM achievement_creations WHERE user_id=?').bind('new').first()).count;
const rescanned=await sync('new');
for(const id of addedIds)assert(earnedIds(rescanned).has(id),id+' should backfill from existing Album saves');
assert.equal(rescanned.savedCount,oldCount,'Backfill must not double count existing groves');
assert.equal((await DB.prepare('SELECT MIN(rule_version) AS version FROM achievement_scans WHERE user_id=?').bind('new').first()).version,3);
console.log('PASS: New themed badges award only for complete matches and safely backfill old Album saves.');

const themedIds=['little-trip','somebunnys-home','pillars-of-olympus','heaven-sent','hellraiser','as-above-so-below'];
for(const fixture of [
 makeScene(['cannabis','wavy']),
 makeScene(['bunny','bunny']),
 makeScene(['broken-column','arch'],'ruins'),
 makeScene(['broken-column','broken-column','arch']),
 makeScene(['dove','clouds']),
 makeScene(['idol','flame']),
 makeScene(['dove','clouds'],'heaven')
])await save(fixture);
let extra=earnedIds(await sync('new'));
assert(extra.has('heaven-sent'));
for(const id of themedIds.filter(id=>id!=='heaven-sent'))assert(!extra.has(id),id+' should not award on partial match');
for(const fixture of [
 makeScene(['cannabis','ruffles','crystal-point']),
 makeScene(['bunny','bunny','bunny']),
 makeScene(['broken-column','broken-column','arch'],'ruins'),
 makeScene(['flame','idol'],'hell')
])await save(fixture);
extra=earnedIds(await sync('new'));
for(const id of themedIds)assert(extra.has(id),id+' should award on qualifying Album save');
assert.equal(badges.find(x=>x.id==='little-trip').title,'Little Trip');
const catalogSource=await readFile('public/garden.js','utf8');
for(const id of themedIds){
 const icon=badges.find(x=>x.id===id).icon;
 assert(catalogSource.includes("{id:'"+icon+"',name:"),id+' should use an existing catalog icon');
}
console.log('PASS: Six additional themed badges; count instances, respect biomes, and accumulate Heaven and Hell separately.');

{
 const make=()=>({children:[],classList:{toggle(){}},append(...children){this.children.push(...children);},replaceChildren(){this.children=[];},insertAdjacentHTML(_position,html){this.iconMarkup=html;}});
 const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,make());return nodes.get(id);};
 const first=badges[0],context={$:get,document:{createElement:make},badgeDefinitions:badges,thumbs:new Map(),progressState:{earned:[first,{id:'unknown-old-badge'}]},progressError:'',progressTask:null,progressKey:'fixture'};
 const render=catalogSource.slice(catalogSource.indexOf('function renderAchievements('),catalogSource.indexOf('\nasync function syncAchievements('));
 runInNewContext(render+';renderAchievements();',context);
 assert.equal(get('#achievementProgress').textContent,'1/30');
 assert.equal(get('#achievementProgressLabel').textContent,'1 of 30 achievements unlocked');
 const [unlocked,locked]=get('#achievementGrid').children;
 assert.match(unlocked.children[1].children[0].iconMarkup,/achievement-check[^>]*aria-hidden="true"/);
 assert.equal(locked.children[1].children[0].iconMarkup,undefined);
 assert.deepEqual([unlocked,locked].map(card=>card.children[1].children[2].className),['sr-only','sr-only']);
 console.log('PASS: visible badge count and earned check mark with accessible locked/unlocked labels.');
}
