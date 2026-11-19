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
assert(source.includes('ideas.slice(0,2)'));
assert(source.includes('area.append(freeCreateChoice)'));
assert(source.includes("$('#biomeStep').hidden=false"));
{
 const freeCreate=source.slice(source.indexOf('function chooseFreeCreate('),source.indexOf('function syncNewBiome('));
 const finish=source.slice(source.indexOf('function finishGroveSetup('),source.indexOf('async function startNewGrove('));
 const dialog={open:true,returnValue:'cancel',close(){this.open=false;this.closeCount=(this.closeCount||0)+1;}};
 const context={dialog,$:id=>{assert.equal(id,'#startDialog');return dialog;},displayedIdeas:[{biome:'forest'},{biome:'bridge'}],biomeNames:['none','forest','bridge','cave'],selectedIdea:'old',selectedBiome:'old',scrollNewGroveToTop(){}};
 vm.runInNewContext(freeCreate+finish+';chooseFreeCreate();chooseFreeCreate();',context);
 assert.equal(context.selectedBiome,'cave');assert.equal(context.selectedIdea,null);
 assert.equal(dialog.returnValue,'start');assert.equal(dialog.closeCount,1);
 dialog.open=true;context.biomeNames=['none','forest','bridge'];
 vm.runInNewContext('chooseFreeCreate();',context);
 assert.equal(context.selectedBiome,'haze','Haze is the fallback with no eligible random biome');
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
  assert.match(html,/id="oddity-grid"[^>]*><p id="odditiesLoading" class="oddities-boot-status" role="status" aria-live="polite"><span class="boot-mushroom" aria-hidden="true"><img src="assets\/loading-mushroom\.svg" alt="" width="40" height="40">(?:<i><\/i>){3}<\/span><span>Loading Oddities\.\.\.<\/span><\/p>/);
  const renderer=source.slice(source.indexOf('function renderOddities()'),source.indexOf('function drawSprite('));
  assert(renderer.includes('el.replaceChildren();'),'first card or empty-state render removes startup status');
  assert(source.includes('function renderOddities(){if(!catalogReady)return;'),'pending catalog retains loading status even when storage refreshes');
  assert.match(css,/#oddity-grid:has\(\.oddities-boot-status\)\{display:flex!important;align-items:center;justify-content:center;/);
  assert.match(css,/body:not\(\.grove-view\) \.toolbox\{display:none!important;\}/,'closed mobile picker stays hidden from initial paint');
  assert(startup.includes("status.textContent='Oddities could not load. Refresh to try again.'"),'failed catalog load does not claim it is still loading');
  console.log('PASS: pre-JS centered Oddities status is replaced by first render, hidden with mobile picker, and reports startup failure');
}

assert.match(readFileSync('public/index.html','utf8'),/class="dialog-symbol" aria-hidden="true"><img id="confirmNewMushroom" src="assets\/loading-mushroom\.svg" alt="" width="40" height="40"><span id="confirmOtherSymbol" hidden>☾<\/span>/);
assert.match(source,/newGrove=kind!=='restore'&&kind!=='randomize';\$\('#confirmNewMushroom'\)\.hidden=!newGrove;\$\('#confirmOtherSymbol'\)\.hidden=newGrove;/);

assert(source.includes("$('#confirmCancel').textContent=newGrove?'Cancel':'Keep Creating'"));
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

assert(readFileSync('public/index.html','utf8').includes('Start with a random biome. Follow your own imagination.'));
assert.match(readFileSync('public/index.html','utf8'),/id="shuffleIdeas"[\s\S]*?<span>More Ideas<\/span><\/button>/);
