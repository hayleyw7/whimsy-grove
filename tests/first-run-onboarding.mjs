import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync('public/garden.js','utf8');
new vm.Script(source,{filename:'public/garden.js'}); // Parse the WHOLE browser script before testing extracted functions.

const busyFunction=source.slice(source.indexOf('function setBusy('),source.indexOf('\nfunction rand('));
const accountCheck=source.slice(source.indexOf('async function checkAccount'),source.indexOf("\n$('#openHelp')"));
const restore=source.slice(source.indexOf('async function restoreCurrentDraft'),source.indexOf('function queueDraft'));
const startup=source.slice(source.indexOf('// Load catalog sheets in parallel'));
const welcome=readFileSync('dist/index.html','utf8');

assert(welcome.includes('href="editor.html?start=1" aria-label="Create">Create</a>'));
assert(startup.includes('if(firstGrove){'));
assert(startup.includes('if(firstGrove){await startNewGrove(true);'), 'onboarding opens only after the editor is usable');
assert(source.includes('if(first)markOnboardingComplete();'));
assert.doesNotMatch(readFileSync('public/index.html','utf8'),/id="draftStatus"/);
{
 const notices=[],record={scope:'test',editId:'current',scene:{}};
 const context={signedIn:true,draftCloudReady:true,draftScope:'test',draftPending:record,
  fallback:record,localDraft(){return context.fallback;},request:async()=>{throw Error('storage unavailable');},
  notify:(text,kind)=>notices.push({text,kind}),console:{error(){}},pendingToast:null,$:()=>({firstChild:null})};
 const warning=source.slice(source.indexOf('const draftSaveWarning='),source.indexOf('function freshScene('));
 const save=source.slice(source.indexOf('async function saveDraftRecord('),source.indexOf('async function flushDraft('));
 vm.runInNewContext(warning+save,context);
 await context.saveDraftRecord(record);
 assert.equal(notices.length,0,'a verified fallback is silent');
 context.fallback={...record,editId:'stale'};
 await context.saveDraftRecord(record);
 assert.equal(notices.length,1,'a failed save with only an older fallback opens one popup');
 assert.equal(notices[0].kind,'error');
 assert.match(notices[0].text,/Download it before leaving/);
 await context.saveDraftRecord(record);
 assert.equal(notices.length,1,'retries do not reopen the same warning');
 context.fallback=record;
 await context.saveDraftRecord(record);
 context.fallback=null;
 await context.saveDraftRecord(record);
 assert.equal(notices.length,2,'a new failure after recovery can warn again');
}
assert.match(source,/selectedGroveChoice=null;fillIdeas\(true\)/);
assert.match(readFileSync('public/index.html','utf8'),/id="startTitle"[^>]*>Find your inspiration<\/h2>/);
{
 const allIdeas=Array.from({length:20},(_,id)=>({id}));let draws=0,probability=.999;
 const context={allIdeas,remainingIdeas:[],displayedIdeas:[],Math:{floor:Math.floor,random:()=>{draws++;return draws===20?0:draws===21?.06:probability;}}};
 vm.runInNewContext(source.slice(source.indexOf('function nextIdeaPair('),source.indexOf('function fillIdeas(')),context);
 const next=(reset=false)=>[...vm.runInNewContext(`displayedIdeas=nextIdeaPair(allIdeas,${reset})`,context)].map(idea=>idea.id);
 const seen=next(true);let last;
 for(let i=1;i<10;i++){last=next();assert.equal(last.length,2);seen.push(...last);}
 assert.equal(new Set(seen).size,20,'all 20 ideas appear before repeating');
 assert.equal(draws,19,'one shuffle for the first round');
 const afterWrap=next();assert(afterWrap.every(id=>!last.includes(id)),'no immediate repeat between rounds');
 assert.equal(draws,38);
 probability=0;
 assert.notDeepEqual(next(true),seen.slice(0,2),'reopening starts a fresh shuffle');
 assert.equal(draws,57);
}
assert(source.includes('area.append(freeCreateChoice)'));
assert(!source.includes('biomeStep'));
{
 const helpers=source.slice(source.indexOf('function syncGroveIdeaSelection('),source.indexOf('function scrollNewGroveToTop('));
 const finish=source.slice(source.indexOf('function clearGroveIdeaSelection('),source.indexOf('async function startNewGrove('));
 const dialog={open:true,returnValue:'cancel',close(){this.open=false;this.closeCount=(this.closeCount||0)+1;}};
 const buttons=['cosmic','free'].map(id=>({dataset:{ideaId:id},setAttribute(k,v){this[k]=v;},focus(){this.focused=true;}}));
 const icon={dataset:{},removeAttribute(name){delete this[name];}};
 const nodes={'#startDialog':dialog,'#ideaChoices':{querySelectorAll:()=>buttons},'#startGrove':{},'#ideaStep':{},'#ideaReviewStep':{},'#startTitle':{focus(){this.focused=true;}},'#reviewIdeaTitle':{},'#reviewIdeaDescription':{},'#reviewIdeaOddity':icon};
 const context={dialog,$:id=>nodes[id],displayedIdeas:[{id:'cosmic',biome:'space'},{id:'bridge',biome:'bridge'}],biomeNames:['none','space','bridge','cave'],ideaById:{cosmic:{id:'cosmic',biome:'space',title:'Cosmic Visitors',text:'A quiet corner.',oddity:'alien-antennae'}},freeCreateChoice:{querySelector:selector=>({dataset:{ideaOddity:'fireflies'},textContent:selector==='strong'?'Free Create':'Start with a random biome.'})},pendingIdea:null,selectedGroveChoice:null,scrollNewGroveToTop(){},syncIdeaOddityIcons(){icon.src=icon.dataset.ideaOddity;}};
 vm.runInNewContext(helpers+finish+';syncGroveIdeaSelection();finishGroveSetup();selectGroveIdea("cosmic");',context);
 assert.equal(dialog.open,true);assert.equal(dialog.returnValue,'cancel');assert.equal(context.selectedGroveChoice,null);
 assert.equal(nodes['#startGrove'].disabled,false);assert.equal(nodes['#ideaStep'].inert,true);assert.equal(nodes['#ideaReviewStep'].hidden,false);assert.equal(nodes['#reviewIdeaTitle'].textContent,'Cosmic Visitors');assert.equal(nodes['#reviewIdeaDescription'].textContent,'A quiet corner.');assert(nodes['#startTitle'].focused);
 assert.equal(icon.src,'alien-antennae');
 vm.runInNewContext('clearGroveIdeaSelection();',context);
 assert.equal(nodes['#startGrove'].disabled,true);assert.equal(nodes['#ideaStep'].inert,false);assert.equal(nodes['#ideaReviewStep'].hidden,true);assert.equal(buttons[0].focused,true);
 assert.equal(icon.src,undefined);
 vm.runInNewContext('selectGroveIdea("cosmic");finishGroveSetup();finishGroveSetup();',context);
 assert.equal(context.selectedGroveChoice.background,'space');assert.equal(context.selectedGroveChoice.promptId,'cosmic');
 assert.equal(dialog.closeCount,1);
 dialog.open=true;context.selectedGroveChoice=null;
 vm.runInNewContext('selectGroveIdea("free");finishGroveSetup();',context);
 assert.equal(context.selectedGroveChoice.background,'cave');assert.equal(context.selectedGroveChoice.promptId,null);
 assert.equal(icon.src,'fireflies');
 dialog.open=true;context.selectedGroveChoice=null;context.biomeNames=['none','space','bridge'];
 vm.runInNewContext('selectGroveIdea("free");finishGroveSetup();',context);
 assert.equal(context.selectedGroveChoice.background,'haze','Haze is the fallback without another eligible biome');
}


{
  const freeCreate={disabled:false,hasAttribute:()=>false,closest:selector=>selector==='#startDialog'?{}:null};
  const editorControl={disabled:false,hasAttribute:()=>false,closest:()=>null};
  const bootPicker=()=>({disabled:true,hasAttribute:k=>k==='data-boot-picker',closest:()=>null});
  const openPicker=bootPicker(),closePicker=bootPicker();
  const elements=new Map([
    ['#loading',{classList:{add(){}}}],['#busyOverlay',{hidden:false}],
    ['.canvas-wrap',{classList:{toggle(){}}}],['#busyText',{textContent:''}],
    ['main',{removeAttribute(){}}],
  ]);
  const context={document:{querySelectorAll:()=>[freeCreate,editorControl,openPicker,closePicker]},
    $:selector=>elements.get(selector),canvas:{setAttribute(){}},syncFeedback(){},
    busy:false,ready:false};
  vm.runInNewContext(busyFunction+';setBusy(true,\'Loading grove\')',context);
  assert.equal(freeCreate.disabled,false,'first-run controls stay enabled while the editor loads');
  assert.equal(editorControl.disabled,true,'editor controls remain unavailable until the editor is ready');
  assert.equal(openPicker.disabled,false,'mobile Oddities can open before catalog readiness');
  assert.equal(closePicker.disabled,false,'mobile Oddities can close while loading');
  context.ready=true;vm.runInNewContext("setBusy(true,'Saving')",context);
  assert.equal(openPicker.disabled,true,'ordinary busy rules return after boot');
}

const makeScene=({items=[],promptId=null,background='forest'}={})=>({
  version:2,creationId:'creation-id',items,promptId,promptHidden:false,
  palette:'haunted',background,weather:[],motion:true,motionPreference:'auto'
});
async function restoreState({local=null,history=[],complete=false,historyUnavailable=false}={}){
  const state=makeScene();
  let historyQueries=0,marked=false,queued=false;
  const writes=[];
  const context={
    accountChecked:true,signedIn:false,draftScope:null,draftCloudReady:false,
    localDraft:()=>local,
    request:async path=>{
      assert(path.startsWith('/api/drawings?collection=history'));
      historyQueries++;
      if(historyUnavailable)throw Error('Browser storage is unavailable');
      return{items:history};
    },
    onboardingComplete:()=>complete,
    markOnboardingComplete:()=>{marked=true;},
    sceneNeedsOnboarding:scene=>!scene||scene.items.length===0&&!scene.promptId,
    snapshot:()=>JSON.parse(JSON.stringify(state)),
    clone:value=>JSON.parse(JSON.stringify(value)),
    state,selected:'selected',activeUid:'active',undoStack:['undo'],redoStack:['redo'],
    draftSignature:'',draftPending:null,
    loadBackground:async background=>{state.background=background;},
    freshScene:()=>makeScene(),
    uid:()=>'edit-id',
    keepLocalDraft:value=>{writes.push(JSON.parse(JSON.stringify(value)));return true;},
    queueDraft:()=>{queued=true;},
    Date,JSON,URL,location:{href:'https://hayleyw7.github.io/whimsy-grove/editor.html'}
  };
  const firstGrove=await vm.runInNewContext(restore+String.fromCharCode(10)+'restoreCurrentDraft(false)',context);
  return{firstGrove,state:context.state,historyQueries,marked,queued,writes,local};
}

{
  const fresh=await restoreState();
  assert.equal(fresh.firstGrove,true,'empty browser storage without History begins onboarding');
  assert.equal(fresh.historyQueries,1);
  assert.equal(fresh.writes.length,0,'do not save a blank placeholder before the first choice');
  assert.equal(fresh.queued,false);
}
{
  const oldBlank={scene:makeScene(),editId:'legacy-empty',updatedAt:1,pending:true};
  const empty=await restoreState({local:oldBlank});
  assert.equal(empty.firstGrove,true,'old blank drafts from a pre-onboarding session still begin onboarding');
  assert.equal(empty.writes.length,0,'keep the unchosen blank out of storage');
  assert.equal(empty.local,oldBlank,'do not rewrite the existing draft');
}
{
  const oldBlank={scene:makeScene(),editId:'legacy-empty',updatedAt:1,pending:false};
  const returning=await restoreState({local:oldBlank,history:[{id:'saved-grove'}]});
  assert.equal(returning.firstGrove,false,'a browser with saved History skips first-run onboarding');
  assert.deepEqual(returning.state,oldBlank.scene);
  assert.equal(returning.marked,true);
}
{
  const saved=makeScene({items:[{id:'cat',uid:'cat-1',x:200,y:250,size:200,flip:false}]});
  const returning=await restoreState({local:{scene:saved,editId:'saved',updatedAt:1,pending:false}});
  assert.equal(returning.firstGrove,false,'a real current grove opens directly');
  assert.equal(returning.historyQueries,0);
  assert.deepEqual(returning.state,saved,'restore the real scene without changing it');
  assert.equal(returning.marked,true);
}
{
  const created=makeScene({background:'tide-pools',promptId:null});
  const returning=await restoreState({local:{scene:created,editId:'created-free',updatedAt:2,pending:false},complete:true});
  assert.equal(returning.firstGrove,false,'a completed Free Create remains a returning grove after reload');
  assert.equal(returning.historyQueries,0);
  assert.equal(returning.state.background,'tide-pools');
  assert.equal(returning.marked,false,'keep the existing completion marker as-is');
}

{
  const status={hidden:false,textContent:''};
  const context={
    signedIn:null,draftScope:'stale-scope',draftEnabled:false,accountChecked:false,accountReady:false,
    favorites:new Set(),request:async path=>{assert.equal(path,'/api/session');throw Error('Browser storage blocked');},
    showActivity(){},hideActivity(){},refreshAccountGates(){},syncAchievements(){},renderOddities(){},loadFavorites:async()=>{},
    $:selector=>selector==='#accountStatus'?status:{hidden:false},
  };
  await vm.runInNewContext(accountCheck+'\ncheckAccount()',context);
  assert.equal(context.accountChecked,true);
  assert.equal(context.signedIn,false,'an unavailable Pages API resolves to guest mode instead of leaving sign-in unknown');
  assert.equal(context.draftScope,null,'do not reuse an account draft scope after API failure');
  assert.equal(context.accountReady,false);
  assert.equal(status.hidden,false,'surface a real browser storage failure while continuing as a guest');
  assert.equal(status.textContent,'Browser storage needs attention');
  const firstVisit=await restoreState({historyUnavailable:true});
  assert.equal(firstVisit.firstGrove,true,'blocked history storage still leaves a fresh visitor in onboarding');
  const legacyBlank=await restoreState({local:{scene:makeScene(),editId:'legacy-empty',updatedAt:1,pending:true},historyUnavailable:true});
  assert.equal(legacyBlank.firstGrove,true,'a blank saved placeholder does not suppress onboarding when History storage is unavailable');
}
assert.equal((readFileSync('public/index.html','utf8').match(/>Waking the grove\.\.\.<\/span>/g) ?? []).length, 3);
assert.match(source,/^setBusy\(true,'Waking the grove\.\.\.'\);$/m);

{
  const html=readFileSync('public/index.html','utf8');
  const css=readFileSync('public/style.css','utf8');
  assert.match(html,/<body class="editor-ui editor-loading">/, 'search is hidden before JS starts');
  assert.match(css,/body\.editor-ui\.editor-loading \.catalog-search\{visibility:hidden;pointer-events:none;\}/, 'boot hides search without removing its layout row at any width');
  assert.match(source,/ready=true;document\.body\.classList\.remove\('editor-loading'\)/, 'existing ready transition restores search without a new delay');
  assert.match(html,/id="odditySearch"[^>]*placeholder="Search the collection\.\.\."/, 'desktop ready placeholder remains unchanged');
  assert.doesNotMatch(readFileSync('public/mobile-picker.js','utf8'),/\.placeholder=/, 'mobile picker keeps the shared placeholder');
  console.log('PASS: search hidden from pre-JS boot until existing ready transition, layout and placeholders preserved');
}

{
  const html=readFileSync('public/index.html','utf8');
  const css=readFileSync('public/style.css','utf8');
  assert.match(html,/id="oddity-grid"[^>]*><p id="odditiesLoading" class="oddities-boot-status" role="status" aria-live="polite"><span class="boot-mushroom" aria-hidden="true"><img src="assets\/loading-mushroom\.svg" alt="" width="40" height="40"><\/span><span>Loading Oddities\.\.\.<\/span><\/p>/);
  const renderer=source.slice(source.indexOf('function renderOddities()'),source.indexOf('function drawSprite('));
  assert(renderer.includes('el.replaceChildren();'),'first card or empty-state render removes startup status');
  assert(source.includes('function renderOddities(){if(!catalogReady)return;'),'pending catalog retains loading status even when storage refreshes');
  assert.match(css,/#oddity-grid:has\(\.oddities-boot-status\)\{display:flex!important;align-items:center;justify-content:center;/);
  assert.match(css,/body:not\(\.grove-view\) \.toolbox\{display:none!important;\}/,'closed mobile picker stays hidden from initial paint');
  assert(startup.includes("status.lastElementChild.innerHTML='Oddities could not load.<br>Refresh to try again.'"),'failed catalog load retains the mascot and shows two lines');
  assert.match(css,/\.oddities-boot-status\[role=alert\] \.boot-mushroom img\{animation:none;\}/);
  assert.match(css,/\.oddities-boot-status\[role=alert\] \.boot-mushroom::after\{content:none;\}/);
  console.log('PASS: pre-JS centered Oddities status is replaced by first render, hidden with mobile picker, and reports startup failure');
}

assert.match(readFileSync('public/index.html','utf8'),/class="dialog-symbol" aria-hidden="true"><img id="confirmNewMushroom" src="assets\/loading-mushroom\.svg" alt="" width="40" height="40"><span id="confirmOtherSymbol" hidden>☾<\/span>/);
assert.match(source,/newGrove=kind!=='restore'&&kind!=='randomize';\$\('#confirmNewMushroom'\)\.hidden=!newGrove;\$\('#confirmOtherSymbol'\)\.hidden=newGrove;/);

assert(!source.includes("$('#confirmCancel').textContent="),"the shared confirmation keeps the visible Cancel label in every mode");
assert(source.includes("'Let this grove become a memory?'"));
assert.match(readFileSync('public/index.html','utf8'),/<button value="cancel" id="confirmCancel">Cancel<\/button>/);

assert(source.includes(":'Start Over';dialog.returnValue"));
assert.match(readFileSync('public/index.html','utf8'),/id="confirmAction">Start Over<\/button>/);

const confirmationCss=readFileSync('public/style.css','utf8');
assert(confirmationCss.includes('#confirmDialog:has(#confirmNewMushroom:not([hidden])){width:min(640px,calc(100vw - 28px));}'));
assert(confirmationCss.includes('#confirmDialog:has(#confirmNewMushroom:not([hidden])) #confirmTitle{white-space:normal;overflow-wrap:break-word;}'));

// Exercise the actual boot function with deferred scene readiness, independently of catalog.
for(const width of [320,390,1280]){
 for(const fail of [false,true]){
  let finishScene;const sceneReady=new Promise((resolve,reject)=>{finishScene=()=>fail?reject(Error('Scene failed. Refresh to try again.')):resolve({});});
  const events=[],nodes=new Map();
  for(const key of ['main','#startupLoading','#startupLoadingText','#loading','#busyOverlay'])nodes.set(key,{hidden:false,textContent:'',classList:{add:name=>events.push(key+':'+name)},setAttribute:(name,value)=>events.push(key+':'+name+'='+value),removeAttribute:name=>events.push(key+':remove:'+name)});
  const context={ready:false,busy:true,state:{items:[]},draftPending:null,document:{body:{classList:{remove:name=>events.push('remove:'+name)}}},canvas:{setAttribute(){}},$:key=>nodes.get(key),checkAccount:async()=>{},restoreSignInDraft:async()=>false,restoreCurrentDraft:async()=>true,prepareScene:()=>sceneReady,renderOddities:()=>events.push('catalog-render-guard'),render:()=>events.push('render'),setBusy:value=>events.push('busy:'+value),registerTools(){},startNewGrove:async()=>{assert.equal(nodes.get('#startupLoading').hidden,true);events.push('onboarding');},queueDraft(){},localStorage:{setItem(){}},URL,location:{href:'https://example.test/editor.html'},window:{innerWidth:width}};
  const fn=source.slice(source.indexOf('async function bootEditor(){'),source.lastIndexOf('bootEditor();'));
  const pending=vm.runInNewContext(fn+'bootEditor()',context);
  await Promise.resolve();await Promise.resolve();await Promise.resolve();
  assert.equal(nodes.get('#startupLoading').hidden,false,'screen remains covered before scene readiness');
  assert.equal(events.includes('onboarding'),false);
  finishScene();await pending;
  assert.equal(nodes.get('#startupLoading').hidden,!fail);
  if(fail){assert.match(nodes.get('#startupLoadingText').textContent,/Refresh/);assert.equal(events.includes('onboarding'),false);}
  else{assert.equal(context.ready,true);assert(events.includes('main:remove:inert'));assert(events.includes('onboarding'));}
 }
}
const bootHtml=readFileSync('public/index.html','utf8'),bootCss=readFileSync('public/style.css','utf8');
assert.match(bootHtml,/<main inert>/);
assert(bootHtml.indexOf('body.editor-loading>main')<bootHtml.indexOf('<link rel="stylesheet"'),'pre-JS inline rules prevent editor flash');
assert.match(bootCss,/#startupLoading \.boot-mushroom\{position:relative;display:block/);
assert.match(bootCss,/prefers-reduced-motion:reduce/);
assert.match(source,/const catalogLoaded=Promise.all\(sheetLoads.values\(\)\).then\(\(\)=>\{catalogReady=true;renderOddities\(\);/);
assert.match(source,/async function prepareScene\(scene\)\{await Promise.all/);
console.log('PASS: whole-page prepaint loader, deferred canvas readiness, independent catalog status, safe onboarding reveal and startup error at 320/390/1280 fixture widths.');

{
  let finishRequired;const required=new Promise(resolve=>finishRequired=resolve);
  const unrelated=new Promise(()=>{}),sprites=new Map();let backgroundLoaded=false;
  const context={Promise,Set,Error,byId:{cat:{sheet:'animals'}},sheetLoads:new Map([['animals',required],['plants',unrelated]]),sprites,loadBackground:async()=>{backgroundLoaded=true;},makePicture:scene=>({scene})};
  const prepare=source.slice(source.indexOf('async function prepareScene('),source.indexOf('\nasync function chooseBiome('));
  vm.runInNewContext(prepare,context);
  let complete=false;const scene={background:'forest',items:[{id:'cat'}]};
  const pending=context.prepareScene(scene).then(result=>{complete=true;return result;});
  await Promise.resolve();assert.equal(complete,false);assert.equal(backgroundLoaded,false);
  sprites.set('cat',{});finishRequired();const result=await pending;
  assert.equal(result.scene,scene);assert.equal(backgroundLoaded,true,'required scene loads without unrelated catalog sheet');
  const blank=await context.prepareScene({background:'forest',items:[]});assert.equal(blank.scene.items.length,0);
  await assert.rejects(context.prepareScene({background:'forest',items:[{id:'unknown'}]}),/newer illustrations/);
  console.log('PASS: restored scene waits for its own sheet, blank scene never waits for unrelated catalog, unknown illustrations remain a recoverable error.');
}

assert(readFileSync('public/index.html','utf8').includes('Start with a random biome, &amp; follow your own imagination from there.'));
assert.match(readFileSync('public/index.html','utf8'),/id="shuffleIdeas"[\s\S]*?<span>More Ideas<\/span><\/button>/);
{
 const context={window:{}};vm.runInNewContext(readFileSync('public/ideas.js','utf8'),context);
 const ideas=context.window.GroveIdeas;
 const oddities=new Set([...source.slice(source.indexOf('const oddityCatalog='),source.indexOf('const customRects=')).matchAll(/\{id:'([^']+)'/g)].map(match=>match[1]));
 assert.equal(new Set(ideas.map(idea=>idea.id)).size,20);
 for(const idea of ideas)assert(oddities.has(idea.oddity),`${idea.title} uses an existing oddity`);
 assert(oddities.has('fireflies'));
 assert.match(readFileSync('public/index.html','utf8'),/id="freeCreate"[^>]*><span class="idea-oddity-slot"><img[^>]*data-idea-oddity="fireflies"[^>]*alt=""/);
 assert.match(bootCss,/#ideaChoices\{[^}]*grid-template-rows:repeat\(3,1fr\)/);
 assert.match(bootCss,/#ideaChoices \.idea-oddity\{[^}]*height:100%;object-fit:contain/);
 assert.match(bootCss,/#ideaStep :is\(button\.idea-choice,#shuffleIdeas\)\{border-color:transparent/);
 const icon={dataset:{ideaOddity:'fireflies'}},thumbs=new Map();
 const sync=source.slice(source.indexOf('function syncIdeaOddityIcons('),source.indexOf('function nextIdeaPair('));
 const iconContext={thumbs,$:()=>({querySelectorAll:()=>[icon]})};
 vm.runInNewContext(sync+';syncIdeaOddityIcons()',iconContext);
 assert.equal(icon.src,undefined,'missing artwork keeps the decoration blank');
 thumbs.set('fireflies','firefly-thumbnail');
 vm.runInNewContext('syncIdeaOddityIcons()',iconContext);
 assert.equal(icon.src,'firefly-thumbnail','the shared oddity thumbnail fills the reserved slot');
}

assert.doesNotMatch(readFileSync('public/index.html','utf8'),/class="boot-mushroom"[^>]*><img[^>]*><i>/);
const loaderMotion=bootCss.slice(bootCss.indexOf('@media(prefers-reduced-motion:no-preference){\n .boot-mushroom img'),bootCss.indexOf('@keyframes boot-bubble-rise'));
assert.match(loaderMotion,/\.boot-mushroom img\{animation:boot-mushroom-sway/);
assert.match(loaderMotion,/\.boot-mushroom::before,\.boot-mushroom::after\{[^}]*animation:boot-bubble-rise/);
assert.match(bootCss,/@keyframes boot-mushroom-sway\{[^\n]*rotate\(-7deg\)[^\n]*rotate\(7deg\)/);

assert.match(source,/\.toggle\('is-waking-grove',value&&text==='Waking the grove\.\.\.'\)/);
assert.match(bootCss,/\.busy-overlay\.is-waking-grove \.busy-message \.boot-mushroom\{position:relative;display:block/);
assert.match(bootCss,/\.busy-overlay\.is-waking-grove \.busy-message>\.status-spinner\{display:none;\}/);
{
 const guideCode=source.slice(source.indexOf('function firstOddityGuideKey('),source.indexOf('function sceneNeedsOnboarding('));
 const hint={hidden:true},classes=new Set(),attributes=new Map(),stored=new Map(),events={};
 const plus={classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)},setAttribute:(k,v)=>attributes.set(k,v),removeAttribute:k=>attributes.delete(k)};
 const state={creationId:'first',items:[]};
 const sandbox={URL,location:{href:'https://example.test/editor.html'},localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)},document:{addEventListener:(k,fn)=>events[k]=fn},$:id=>id==='#firstOddityGuide'?hint:plus,state,ready:true,busy:false,usesOddityModal:()=>true,motionEnabled:()=>true,reducedMotion:false};
 const guide=vm.runInNewContext(guideCode+';({armFirstOddityGuide,syncFirstOddityGuide})',sandbox);
 guide.armFirstOddityGuide();guide.syncFirstOddityGuide();
 assert.equal(hint.hidden,false);assert(classes.has('first-oddity-wiggle'));assert.equal(attributes.get('aria-describedby'),'firstOddityGuide');
 classes.clear();guide.syncFirstOddityGuide();assert.equal(classes.size,0,'wiggle plays at most once');
 events['grove-oddities-open']();assert.equal(hint.hidden,true);assert.equal(attributes.has('aria-describedby'),false);
 const restored=vm.runInNewContext(guideCode+';syncFirstOddityGuide',{...sandbox});restored();assert.equal(hint.hidden,true,'successful picker open is recorded across reload');
 stored.clear();const quiet=vm.runInNewContext(guideCode+';({armFirstOddityGuide,syncFirstOddityGuide})',{...sandbox,motionEnabled:()=>false});
 quiet.armFirstOddityGuide();quiet.syncFirstOddityGuide();assert.equal(hint.hidden,false);assert.equal(classes.size,0,'animations off preserves text but skips first wiggle');
}

{
 const createFlow=source.slice(source.indexOf('async function startNewGrove('),source.indexOf('const badgeDefinitions'));
 assert(createFlow.indexOf('await chooseGroveStart()')<createFlow.indexOf("await persistScene('history'"),'history is only written after the user presses Start');
 assert(createFlow.indexOf('await prepareScene(next)')<createFlow.indexOf("await persistScene('history'"),'failed scene prep does not write history');
 assert.match(readFileSync('public/index.html','utf8'),/<button id="startGrove"[^>]*disabled><span>Start Creating<\/span><svg[^>]*aria-hidden="true"/);
 assert(createFlow.includes('last confirmed save) is unchanged'),'does not duplicate a storage error’s save reassurance');
 const load=source.slice(source.indexOf('function loadBackground('),source.indexOf('async function prepareScene('));
 const biomeNames=vm.runInNewContext(source.match(/^const biomeNames=(.*);$/m)[1]);
 const biomeLabels=vm.runInNewContext('('+source.match(/^const biomeLabels=(.*);$/m)[1]+')');
 const context={biomeNames,biomeLabels,backgroundImages:new Map(),Image:class{set src(path){assert(readFileSync('public/'+path).length>0);this.onload();}}};
 vm.runInNewContext(load,context);
 for(const name of biomeNames)await context.loadBackground(name);
 context.backgroundImages.clear();
 context.Image=class{set src(path){this.onerror();}};
 await assert.rejects(context.loadBackground('frozen-lake'),{message:'The Frozen Lake biome could not load. Refresh the page and try again. Your creation is unchanged.'});
}
assert(source.includes("Error('Illustrations could not load. Try refreshing the page.')"));

{
 const html=readFileSync('public/index.html','utf8');
 const chooser=html.split('id="ideaStep"')[1].split('id="ideaReviewStep"')[0];
 assert(chooser.includes('More Ideas'));assert.doesNotMatch(chooser,/Start Creating|Go Back|aria-pressed/);
 assert.match(html,/id="ideaReviewStep" hidden>[\s\S]*?id="reviewIdeaOddity"[^>]*alt=""><strong id="reviewIdeaTitle"[\s\S]*?id="chooseAnotherIdea"[^>]*><svg[^>]*aria-hidden="true"[\s\S]*?<span>Go Back<\/span>[\s\S]*?Start Creating/);
}
