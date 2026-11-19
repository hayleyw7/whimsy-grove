import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile('public/garden.js','utf8');
const preference=source.slice(source.indexOf("const motionPreferenceKey="),source.indexOf('function manageAnimation'));
const listener=source.split('\n').find(x=>x.startsWith("$('#motionToggle').addEventListener('change'"));
const storage=new Map();
function load(scene,reducedMotion){let change;const box={state:scene,reducedMotion,busy:false,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},$:()=>({addEventListener:(_,fn)=>change=fn}),remember(){},render(){}};vm.createContext(box);vm.runInContext(preference+listener,box);return {enabled:()=>vm.runInContext('motionEnabled()',box),toggle:value=>change({target:{checked:value}})};}
let h=load({motionPreference:'auto'},false);assert.equal(h.enabled(),true);h.toggle(false);assert.equal(load({motionPreference:'auto'},false).enabled(),false);assert.equal(load({motionPreference:true},false).enabled(),false);
h.toggle(true);assert.equal(load({motionPreference:'auto'},true).enabled(),true);storage.clear();assert.equal(load({motionPreference:'auto'},true).enabled(),false);
console.log('PASS: animation off persists across reload and scenes; explicit on overrides reduced motion; unset honors device preference.');

// Run the real weather renderer against an isolated canvas recorder, including static frame zero.
const weatherSource=await readFile('public/motion.js','utf8'), weatherContext={window:{}};
vm.runInNewContext(weatherSource,weatherContext);
function weatherFrame(weather,background,time=0){
 const out={bands:[],drops:[]};
 const c={globalAlpha:1,save(){},restore(){},createLinearGradient(...xy){const g={xy,stops:[],addColorStop(at,color){this.stops.push([at,color]);}};return g;},fillRect(...box){out.bands.push({box,gradient:this.fillStyle});},beginPath(){},moveTo(){},bezierCurveTo(){},closePath(){},fill(){out.drops.push(this.globalAlpha);}};
 weatherContext.window.GroveMotion.draw(c,{background,palette:'haunted',weather:[weather],seed:8921},time,{ink:'#ddd'},()=>{});return JSON.parse(JSON.stringify(out));
}
for(const background of ['forest','swamp','heaven','space']){
 const mist=weatherFrame('mist',background),fog=weatherFrame('fog',background),drizzle=weatherFrame('drizzle',background),downpour=weatherFrame('heavy-rain',background);
 assert.equal(mist.bands.length,2);assert.equal(fog.bands.length,3);
 const peak=b=>Number(b.gradient.stops[1][1].match(/,([.\d]+)\)$/)[1]);
 assert(mist.bands.every(b=>peak(b)>=.21&&peak(b)<=.29));
 assert(fog.bands.every(b=>peak(b)>.35));
 assert(mist.bands.every(b=>b.box[1]>600),'Haze stays low to the ground');
 assert.equal(drizzle.drops.length,44);assert.equal(downpour.drops.length,200);
 assert(drizzle.drops.some(a=>a>.5),'light rain has visible drops even in static frame');
 assert.deepEqual(weatherFrame('mist',background,0),mist,'static mode is stable');
 assert.notDeepEqual(weatherFrame('mist',background,750),mist,'animated Haze still drifts');
}
console.log('PASS: Haze remains low and lighter than Fog; visible Drizzle remains sparse compared with Downpour; static/animated frames across four biomes.');

// Record real drawing commands to verify the three wind speed tiers and their lulls.
function recordWeather(renderer,effect,time=0){
 const commands=[];let path=[];
 const c={globalAlpha:1,save(){},restore(){},createLinearGradient(...xy){return {xy,addColorStop(){}};},beginPath(){path=[];},moveTo(...p){path.push(['move',...p]);},bezierCurveTo(...p){path.push(['curve',...p]);},arc(...p){path.push(['arc',...p]);},stroke(){commands.push({path:[...path],alpha:this.globalAlpha,width:this.lineWidth});},fill(){commands.push({path:[...path],alpha:this.globalAlpha});}};
 renderer.draw(c,{background:'forest',palette:'haunted',weather:[effect],seed:8921},time,{ink:'#ddd'},()=>{});return commands;
}
const renderer=weatherContext.window.GroveMotion;
const shift=effect=>recordWeather(renderer,effect,200)[0].path[0][1]-recordWeather(renderer,effect,100)[0].path[0][1];
assert(Math.abs(shift('breeze')/shift('wind')-.5)<1e-10);
assert(Math.abs(shift('gusts')/shift('wind')-4)<1e-10,'Gust burst crosses four times as fast as Wind');
assert(recordWeather(renderer,'gusts',300).length>recordWeather(renderer,'wind',300).length,'burst has more simultaneous trails');
for(const time of [1600,2000,2500])assert.equal(recordWeather(renderer,'gusts',time).length,0,'quiet interval contains no Gust trails');
assert(recordWeather(renderer,'gusts',0).length>0,'static frame shows a representative burst');
assert.deepEqual(recordWeather(renderer,'gusts',0),recordWeather(renderer,'gusts',3000),'burst loops cleanly for GIF exports');
for(const effect of ['breeze','wind','gusts','blizzard']){assert(renderer.hasMotion({weather:[effect]}));assert.deepEqual(recordWeather(renderer,effect,0),recordWeather(renderer,effect,0));}
assert.deepEqual(recordWeather(renderer,'breeze',0),recordWeather(renderer,'breeze',9000),'Breeze GIF loop is nine seconds');
assert.equal(recordWeather(renderer,'snow',0).length,460,'original Snow still draws 230 outlined flakes');
assert.equal(recordWeather(renderer,'blizzard',0).length,380,'Blizzard draws 380 heavier swept flakes');
const before=recordWeather(renderer,'blizzard',100)[0].path[0],after=recordWeather(renderer,'blizzard',200)[0].path[0];
assert(after[1]!==before[1]&&after[2]!==before[2],'Blizzard moves sideways as well as downward');
assert.match(source,/label:'Snow'\},\{value:'blizzard',label:'Blizzard'\},\{value:'breeze',label:'Breeze'\},\{value:'wind',label:'Wind'\},\{value:'gusts',label:'Gusts'/);
assert(source.includes("scene.weather.includes('thunderstorm')?(scene.weather.includes('breeze')?36000:12000):scene.weather.includes('breeze')?9000:scene.weather.includes('wind')?6000:3000"));
for(const [effect,quietAt,cycle] of [['breeze',7000,9000],['wind',4000,6000]]){assert.equal(recordWeather(renderer,effect,quietAt).length,0);assert(recordWeather(renderer,effect,0).length>0);assert.deepEqual(recordWeather(renderer,effect,0),recordWeather(renderer,effect,cycle));}
console.log('PASS: Breeze half-speed/Wind baseline/Gusts four-speed, all with quiet intervals; Blizzard heavier sideways snow; still frames and GIF loop duration preserved.');

// Distinct Mist wisps are deterministic, thin, soft, and cover more scene heights than Haze.
function mistFrame(time=0,shortLoop=false,effect='mist-wisps'){
 const out=[];let x=0,y=0,rx=1,ry=1;
 const c={globalAlpha:1,save(){},restore(){},translate(a,b){x=a;y=b;},scale(a,b){rx=a;ry=b;},
  createRadialGradient(...coords){return{coords,stops:[],addColorStop(at,color){this.stops.push([at,color]);}};},
  fillRect(...box){out.push({x,y,rx,ry,alpha:this.globalAlpha,gradient:this.fillStyle,box});}};
 weatherContext.window.GroveMotion.draw(c,{background:'forest',palette:'haunted',weather:[effect],seed:8921},time,{ink:'#ddd'},()=>{},shortLoop);
 return JSON.parse(JSON.stringify(out));
}
const wisps=mistFrame();
assert.equal(wisps.length,6);
assert(wisps.every(w=>w.rx>=240&&w.ry<=34&&w.alpha<=.36&&w.gradient.stops.at(-1)[1]==='rgba(232,234,246,0)'));
assert(wisps.some(w=>w.y<330)&&wisps.some(w=>w.y>840));
assert(wisps.some(w=>w.x>0&&w.x<1200&&w.alpha>.28),'static frame shows visible soft wisps');
assert.deepEqual(mistFrame(),wisps);
assert.notDeepEqual(mistFrame(1000),wisps);
assert.deepEqual(mistFrame(12000),wisps,'live loop returns exactly to start');
assert.deepEqual(mistFrame(3000,true),mistFrame(0,true),'short export loop returns exactly to start');
assert.notDeepEqual(mistFrame(750,true),mistFrame(0,true),'short export loop visibly drifts');
assert.match(source,/{value:'mist-wisps',label:'Mist'},{value:'mist',label:'Haze'},{value:'fog',label:'Fog'}/);
console.log('PASS: distinct Mist wisps cover more of the scene while remaining thinner and subtler than Fog, with stable still and looping frames.');

assert.match(source,/const weatherChoices=\[[^\n]+\]/);
const weatherLabels=[...source.match(/^const weatherChoices=.*$/m)[0].matchAll(/label:'([^']+)'/g)].map(x=>x[1]);
assert.deepEqual(weatherLabels,['Clear','Mist','Haze','Fog','Smoke','Smog','Drizzle','Rain','Downpour','Storm','Flurries','Snow','Blizzard','Breeze','Wind','Gusts']);
const smoke=mistFrame(0,false,'smoke');
assert.equal(smoke.length,14);
assert(smoke.every(w=>w.rx<125&&w.y>550&&w.gradient.stops.at(-1)[1]==='rgba(103,102,108,0)'));
assert(smoke.some(w=>w.alpha>.6)&&smoke.some(w=>w.x<480)&&smoke.some(w=>w.x>800));
assert.deepEqual(mistFrame(9000,false,'smoke'),smoke);
assert.notDeepEqual(mistFrame(1000,false,'smoke'),smoke);
assert.deepEqual(mistFrame(3000,true,'smoke'),mistFrame(0,true,'smoke'));
const smog=weatherFrame('smog','forest');
assert.equal(smog.bands.length,1);assert.deepEqual(smog.bands[0].box,[0,0,1200,1080]);
assert.match(smog.bands[0].gradient.stops[1][1],/^rgba\(128,122,87,/);
assert.deepEqual(weatherFrame('smog','forest',3000),smog);
assert.notDeepEqual(weatherFrame('smog','forest',750),smog);
console.log('PASS: Smoke makes localized neutral plumes without flames; Smog adds a diffuse muted veil with deterministic loops.');

const gustLines=recordWeather(renderer,'gusts',300);
assert(gustLines.every(line=>line.width>=7.5&&line.width<=11.5),'only Gusts has the requested slightly thicker strokes');
assert(gustLines.every(line=>{const start=line.path[0][1],curve=line.path[1];return curve[5]-start>=580&&curve[5]-start<=760;}),'Gusts streaks are longer while their centers/timing/count remain unchanged');
console.log('PASS: Gusts-only longer 580–760px and slightly thicker7.5–11.5px strokes.');

// Thunderstorm uses the existing soft GIF pulse every six seconds live as well.
function lightningFrame(time,shortLoop=false,effect='thunderstorm'){
 const flashes=[];
 const gradient=()=>({addColorStop(){}});
 const ctx={globalAlpha:1,save(){},restore(){},createLinearGradient:gradient,createRadialGradient:gradient,fillRect(){},beginPath(){},moveTo(){},bezierCurveTo(){},closePath(){},fill(){}};
 renderer.draw(ctx,{background:'forest',palette:'haunted',weather:[effect],seed:8921},time,{ink:'#ddd'},(c,name)=>flashes.push({name,alpha:c.globalAlpha}),shortLoop);
 return flashes;
}
for(const t of [0,2300,3700,6000])assert.deepEqual(lightningFrame(t),[],'outside the soft pulse stays quiet');
assert.deepEqual(lightningFrame(3000),[{name:'lightning',alpha:.45}]);
assert.deepEqual(lightningFrame(9000),lightningFrame(3000),'live pulse repeats six seconds later');
assert(Math.abs(lightningFrame(2650)[0].alpha-.225)<1e-10,'existing 1.4 second soft pulse width/brightness retained');
for(const t of [0,2300,2650,3000,3350,3700,6000])assert.deepEqual(lightningFrame(t),lightningFrame(t,true),'GIF cadence remains the existing six-second pulse');
assert.deepEqual(lightningFrame(3000,false,'heavy-rain'),[],'Downpour never adds lightning');
console.log('PASS: Thunderstorm soft pulse every six seconds; original brightness, width, static frame and GIF timing preserved.');

// Smoke has a dark core for bright biomes and a pale rim for dark ones.
assert(smoke.some(w=>w.rx>90&&w.ry>55),'broader curling puffs remain visible in a still frame');
const strongestSmoke=Math.max(...smoke.map(w=>w.alpha));
for(const background of [24,48,200,240]){
 const coreShift=Math.abs((103-background)*strongestSmoke);
 const rimShift=Math.abs((190-background)*strongestSmoke*.85);
 assert(Math.max(coreShift,rimShift)>50,'bright and dark representative backgrounds have a visible smoke luminance difference');
}
assert(smoke.every(w=>w.gradient.stops[1][1]==='rgba(190,189,195,.85)'));
console.log('PASS: Smoke broad puffs with stronger opacity and contrasting core/rim remain visible on sampled bright/dark backgrounds.');

assert(wisps.every(w=>w.gradient.stops[1][1]==='rgba(108,113,132,.8)'));
const strongestMist=Math.max(...wisps.map(w=>w.alpha));
for(const background of [24,48,200,240])assert(Math.max(Math.abs((234-background)*strongestMist),Math.abs((113-background)*strongestMist*.8))>20,'Mist retains pale/darker contrast across bright/dark samples');
console.log('PASS: Mist stronger narrow wisps remain distinct from broad Fog and low Haze, with contrasting centers/edges.');

// The flash lights only the entire drawing surface; bolt enters above its top edge.
function stormSurface(time,shortLoop=false){
 const fills=[],bolts=[],gradient=()=>({addColorStop(){}});
 const c={globalAlpha:1,save(){},restore(){},createLinearGradient:gradient,createRadialGradient:gradient,fillRect(...bounds){fills.push({bounds,alpha:this.globalAlpha,color:this.fillStyle});},beginPath(){},moveTo(){},bezierCurveTo(){},closePath(){},fill(){}};
 renderer.draw(c,{background:'forest',palette:'haunted',weather:['thunderstorm'],seed:8921},time,{ink:'#ddd'},(_c,name,x,y,size)=>bolts.push({name,x,y,size}),shortLoop);
 return {fills:fills.filter(f=>typeof f.color==='string'),bolts};
}
assert.deepEqual(stormSurface(0),{fills:[],bolts:[]},'static/reduced-motion time zero has no illumination or bolt');
const stormPeak=stormSurface(3000);
assert.deepEqual(stormPeak.fills,[{bounds:[0,0,1200,1080],alpha:.08,color:'#e9e6f2'}],'low-opacity illumination reaches bottom of canvas');
assert.deepEqual(stormPeak.bolts,[{name:'lightning',x:300,y:220,size:255}]);
assert(stormPeak.bolts[0].y-stormPeak.bolts[0].size<0,'bottom-anchored tall bolt starts above canvas and is naturally clipped');
assert.deepEqual(stormSurface(3000,true),stormPeak,'GIF has same surface flash and bolt origin');
assert.deepEqual(stormSurface(15000),stormPeak,'twelve-second alternating cycle retained');
console.log('PASS: Storm bolt enters from top; smooth 8% full-canvas flash includes bottom and is absent at rest.');

function rainPaths(effect,time){
 const paths=[];let path=[];const gradient=()=>({addColorStop(){}});
 const c={globalAlpha:1,save(){},restore(){},createLinearGradient:gradient,createRadialGradient:gradient,fillRect(){},beginPath(){path=[];},moveTo(...v){path.push(v);},bezierCurveTo(...v){path.push(v);},closePath(){},fill(){paths.push({path,alpha:this.globalAlpha});}};
 renderer.draw(c,{background:'forest',palette:'haunted',weather:[effect],seed:8921},time,{ink:'#ddd'},()=>{});
 return paths;
}
assert.equal(rainPaths('thunderstorm',0).length,200,'Storm density unchanged');
assert.deepEqual(rainPaths('thunderstorm',0),rainPaths('heavy-rain',0),'static rain unchanged');
assert.deepEqual(rainPaths('thunderstorm',100),rainPaths('heavy-rain',200),'Storm moves exactly twice as fast as unchanged Downpour');
assert.deepEqual(rainPaths('thunderstorm',0),rainPaths('thunderstorm',6000),'rain loops seamlessly over existing GIF duration');
console.log('PASS: Storm rain twice Downpour speed; 200 drops, static appearance, and seamless six-second GIF preserved.');

const first=stormSurface(3000),doubleFirst=stormSurface(9000),doubleSecond=stormSurface(10000);
assert.equal(doubleFirst.bolts.length,1);assert.equal(doubleSecond.bolts.length,1);
assert.deepEqual(stormSurface(9500),{fills:[],bolts:[]},'double has a quiet gap, not overlapping pulses');
assert.notEqual(first.bolts[0].x,doubleFirst.bolts[0].x);assert.notEqual(doubleFirst.bolts[0].x,doubleSecond.bolts[0].x);
for(const [a,b] of [[2800,3200],[8800,9200],[9800,10200]])assert.equal(stormSurface(a).bolts[0].x,stormSurface(b).bolts[0].x,'bolt never jumps during its pulse');
for(const t of [0,3000,6000,9000,9500,10000,12000])assert.deepEqual(stormSurface(t,true),stormSurface(t),'live and GIF share alternating timing/positions');
assert.deepEqual(stormSurface(0),stormSurface(12000),'loop closes quietly');
console.log('PASS: Storm alternates single/double soft pulses with one-second separated double peaks, distinct stable locations, and seamless12s loop.');

assert.deepEqual([stormSurface(3000),stormSurface(9000),stormSurface(10000)].map(f=>f.bolts[0].size),[255,310,360],'current lightning size is smallest in the deterministic variation');
for(const t of [3000,9000,10000]){const bolt=stormSurface(t).bolts[0];assert.equal(bolt.y-bolt.size,-35,'all sizes enter above the top');assert.deepEqual(stormSurface(t),stormSurface(t,true),'GIF preserves varied size');}
console.log('PASS: Storm sizes vary255/310/360 with fixed top-entry and unchanged pulse schedule.');

for(const [time,size] of [[3000,255],[9000,310],[10000,360]]){
 const flash=stormSurface(time).fills[0];
 assert(Math.abs(flash.alpha-.08*size/255)<1e-12,'full-canvas flash scales with that bolt size');
 assert.deepEqual(stormSurface(time),stormSurface(time,true),'GIF uses the same scaled illumination');
}
assert(Math.abs(stormSurface(8800).fills[0].alpha-.04*310/255)<1e-12,'larger flash retains its smooth half-peak envelope');
assert.deepEqual(stormSurface(9500),{fills:[],bolts:[]},'quiet interval remains dark');
console.log('PASS: Storm full-canvas flash scales by bolt size with unchanged envelope and GIF output.');
