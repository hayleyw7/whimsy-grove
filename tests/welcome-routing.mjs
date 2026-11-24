import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const welcome=readFileSync('dist/index.html','utf8'),editor=readFileSync('dist/editor.html','utf8');
const script=html=>html.match(/<script>([\s\S]*?)<\/script>/)[1];
function route(html,url,visited=false,blocked=false,details=null){
 const actions=[],dataset={},listeners={},loader={textContent:'Waking the grove...'};vm.runInNewContext(script(html),{URL,document:{getElementById:()=>loader,documentElement:{dataset,classList:{add(){},remove(){}}}},addEventListener:(key,fn)=>listeners[key]=fn,location:{href:url,replace:value=>actions.push(['navigate',value])},history:{replaceState:(_state,_title,value)=>actions.push(['clean',value])},localStorage:{getItem:key=>{assert.equal(key,'whimsy-grove-visited:/whimsy-grove/');if(blocked)throw Error('Storage denied');return visited?'1':null;}}});if(details)Object.assign(details,{dataset,listeners,loader});return actions;
}
const base='https://hayleyw7.github.io/whimsy-grove/';
assert.deepEqual(route(welcome,base),[],'Fresh root shows welcome');
assert.deepEqual(route(editor,base+'editor.html'),[['navigate','./']],'Fresh direct editor shows welcome');
assert(welcome.includes('href="editor.html?start=1" aria-label="Create">Create</a>'));
assert.deepEqual(route(editor,base+'editor.html?start=1'),[['clean','/whimsy-grove/editor.html']],'CTA enters editor without leaving bypass parameter');
assert.deepEqual(route(welcome,base,true),[['navigate','editor.html']],'Returning root restores editor');
assert.deepEqual(route(editor,base+'editor.html',true),[],'Returning editor stays open');
assert.deepEqual(route(welcome,base+'?welcome=1',true),[],'Explicit welcome remains accessible');
assert.deepEqual(route(editor,base+'editor.html?start=1',false,true),[['clean','/whimsy-grove/editor.html']],'Unavailable storage does not loop from CTA');
assert.deepEqual(route(editor,base+'editor.html',false,true),[],'Blocked storage fails open rather than looping');
console.log('PASS: fresh root/direct editor, CTA, returning routes, explicit welcome, and unavailable storage');
const freshEntry={},returningEntry={},directEntry={},freshWelcome={},returningWelcome={};
route(editor,base+'editor.html?start=1',false,false,freshEntry);
route(editor,base+'editor.html?start=1',true,false,returningEntry);
route(editor,base+'editor.html',true,false,directEntry);
assert.equal(freshEntry.dataset.ideaEntry,'true');
assert.equal(returningEntry.dataset.ideaEntry,undefined);
assert.equal(directEntry.dataset.ideaEntry,undefined);
route(welcome,base,false,false,freshWelcome);
route(welcome,base+'?welcome=1',true,false,returningWelcome);
const createClick={button:0,target:{closest:()=>true}};
freshWelcome.listeners.click(createClick);
returningWelcome.listeners.click(createClick);
assert.equal(freshWelcome.loader.textContent,'Gathering inspiration…');
assert.equal(returningWelcome.loader.textContent,'Waking the grove...');
freshWelcome.listeners.pageshow({persisted:true});
assert.equal(freshWelcome.loader.textContent,'Waking the grove...');
assert(editor.includes('Loading oddities…'));
console.log('PASS: first Create handoff and editor entry set inspiration only on new visits.');

const garden=readFileSync("dist/garden.js","utf8"),styles=readFileSync("dist/style.css","utf8");
for(const removedId of ["openAbout","aboutDialog","aboutTitle","closeAbout"]){
 assert(!editor.includes(removedId),`${removedId} is removed from the editor`);
 assert(!garden.includes(removedId),`${removedId} has no dangling event handlers`);
}
assert(!styles.includes(".about-dialog"),"Removed dialog has no orphaned styles");
for(const retainedId of ["openHelp","helpDialog","userMenuButton","openAlbum","openHistory","openAchievements"]){
 assert(editor.includes(`id="${retainedId}"`),`${retainedId} remains available`);
}
const help=editor.match(/<dialog id="helpDialog"[^>]*>([\s\S]*?)<\/dialog>/)[1];
assert.match(help,/<header>[\s\S]*?id="closeHelp"[^>]*aria-label="Close Help"[\s\S]*?<\/header>/);
assert.match(help,/<h2 id="helpTitle">Help<\/h2>/);
assert.deepEqual([...help.matchAll(/<h3>([^<]+)<\/h3>/g)].map(match=>match[1]),['Start a grove','Make it yours','Keep your grove','Adjust settings']);
assert.match(styles,/#helpDialog>header\{[^}]*border-bottom:1px solid var\(--ui-editor-border-color\)/);
assert.match(styles,/#helpDialog #closeHelp\{position:absolute;top:8px;right:8px;[^}]*width:44px;height:44px/);
assert.match(help,/<\/header><div id="helpContent">/);
assert.match(styles,/#helpDialog\[open\]\{[^}]*overflow:hidden/);
assert.match(styles,/#helpContent\{min-height:0;overflow:auto/);
assert.match(editor,/<\/header><div id="achievementContent"><p id="achievementStatus"/);
assert.match(styles,/#achievementDialog\[open\],\s*body\.editor-ui #helpDialog\[open\]\{[^}]*overflow:hidden/);
assert.match(styles,/#achievementContent,\s*body\.editor-ui #helpContent\{min-height:0;overflow:auto/);
assert.doesNotMatch(styles,/\.grove-dialog,\s*\.gallery-dialog\{[^}]*outline(?:-offset|-color)?:/);
assert.match(styles,/\.grove-dialog,\s*\.gallery-dialog\{[^}]*border:2px solid/);
assert.match(help,/pick Free Create for a random biome/);
assert.doesNotMatch(help,/GitHub|Feedback|choose a biome/i);
assert(help.replace(/<[^>]*>/g,' ').trim().split(/\s+/).length<180);
console.log("PASS: About UI, handlers, and styles removed; other menu features retained");

{
 const listeners={},classes=new Set(),loader={},context={URL,document:{getElementById:()=>loader,documentElement:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}}},addEventListener:(type,fn)=>listeners[type]=fn,location:{href:base},localStorage:{getItem:()=>null}};
 vm.runInNewContext(script(welcome),context);
 const entry={button:0,target:{closest:()=>true}};
 listeners.click({...entry,ctrlKey:true});assert(!classes.has('welcome-handoff'));
 listeners.click(entry);assert(classes.has('welcome-handoff'),'primary Create click shows the local handoff before navigation');
 listeners.pageshow({persisted:true});assert(!classes.has('welcome-handoff'),'browser Back restores the welcome screen');
 const inlineArt=/<img src="data:image\/svg\+xml,([^"]+)" alt="" width="64" height="64">/;
 for(const html of [welcome,editor]){
  assert.match(html,inlineArt);assert(html.includes('Waking the grove...'));
  assert.equal(decodeURIComponent(html.match(inlineArt)[1]),readFileSync('public/assets/loading-mushroom.svg','utf8').trim());
 }
}

const orientationSource=readFileSync('public/mobile-orientation.js','utf8');
const orientationCss=readFileSync('public/mobile-orientation.css','utf8');
const orientationVm=(await import('node:vm')).runInNewContext;
for(const [coarse,ua,screenType,legacy,wide,blocked,touchPoints] of [
 [false,'desktop','landscape-primary',undefined,true,false],
 [true,'Android','portrait-primary',undefined,true,false],
 [true,'Android','landscape-primary',undefined,false,true],
 [false,'iPhone',undefined,-90,false,true],
 [true,'iPad',undefined,0,true,false],
 [true,'tablet',undefined,undefined,true,true],
 [false,'Macintosh','landscape-primary',undefined,true,true,5],
]){
 const events={},classes=new Set(),screen={orientation:screenType?{type:screenType}:undefined};
 const window={screen,orientation:legacy,addEventListener:(k,v)=>events[k]=v};
 orientationVm(orientationSource,{window,navigator:{userAgent:ua,maxTouchPoints:touchPoints||0},matchMedia:q=>({matches:q.includes('pointer')?coarse:wide}),document:{documentElement:{classList:{contains:k=>classes.has(k),toggle(k,on){if(on)classes.add(k);else classes.delete(k);}}}}});
 assert.equal(classes.has('mobile-landscape'),blocked);
 let intercepted=false;events.keydown({stopImmediatePropagation(){intercepted=true;}});
 assert.equal(intercepted,blocked);
 if(screen.orientation){screen.orientation.type='portrait-primary';events.orientationchange();assert.equal(classes.has('mobile-landscape'),false);}
}
for(const file of ['scripts/welcome-page.mjs','public/index.html']){
 const html=readFileSync(file,'utf8');assert.match(html,/id="mobileLandscapeGate" role="status"/);assert.match(html,/mobile-orientation\.js/);
}
assert.match(orientationCss,/html\.mobile-landscape dialog::backdrop\{display:none!important;/);
console.log('PASS: portrait gate is mobile-only, uses physical orientation before iframe aspect ratio, returns to the same page, and blocks editor shortcuts only while rotated.');

for(const html of [welcome,editor]){
 assert.match(html,/<meta property="og:image" content="https:\/\/hayleyw7\.github\.io\/whimsy-grove\/assets\/whimsy-grove-preview-v4\.jpg">/);
 assert.match(html,/<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">/);
 assert.match(html,/<meta name="twitter:image" content="https:\/\/hayleyw7\.github\.io\/whimsy-grove\/assets\/whimsy-grove-preview-v4\.jpg">/);
 assert.match(html,/<meta name="twitter:image:alt" content="Whimsy Grove title beneath an illustrated cat, ghost, sleeping pink rabbit, and mushroom creature\.">/);
}
assert.equal(readFileSync('dist/assets/whimsy-grove-preview-v4.jpg').subarray(0,3).toString('hex'),'ffd8ff');
assert.match(readFileSync('README.md','utf8'),/!\[[^\]]+\]\(public\/assets\/whimsy-grove-preview-v4\.jpg\)/);
assert.equal(readFileSync('docs/branding/whimsy-grove-itch-cover-almendra.png').subarray(0,8).toString('hex'),'89504e470d0a1a0a');
console.log('PASS: both pages and README use the new social artwork and the itch cover is stored separately.');
