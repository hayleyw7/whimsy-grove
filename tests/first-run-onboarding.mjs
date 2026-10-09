import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync('public/garden.js','utf8');
const accountCheck=source.slice(source.indexOf('async function checkAccount'),source.indexOf("\n$('#openHelp')"));
const restore=source.slice(source.indexOf('async function restoreCurrentDraft'),source.indexOf('function queueDraft'));
const startup=source.slice(source.indexOf('Promise.all(Object.entries(sources)'));
const immediatePrompt=source.slice(source.indexOf('const earlyGroveChoice='),source.indexOf(';\nPromise.all(Object.entries(sources)'));
const welcome=readFileSync('dist/index.html','utf8');

assert(welcome.includes('href="editor.html?start=1" aria-label="Create">Create</a>'));
assert(startup.includes('if(firstGrove){'));
assert(startup.includes('const choice=earlyGroveChoice?await earlyGroveChoice:null'));
assert(source.indexOf('const earlyGroveChoice=')<source.indexOf('Promise.all(Object.entries(sources)'), 'open the fresh visitor prompt before waiting for sprite sheets');
assert(immediatePrompt.includes('chooseGroveStart()'));
assert(startup.includes('close(\'cancel\')'), 'dismiss a speculative early prompt if a saved History entry proves this is a returning session');
assert(source.includes('if(first)markOnboardingComplete();'));
assert(source.includes('ideas.slice(0,2)'));
assert(source.includes('area.append(freeCreateChoice)'));
assert(source.includes("$('#biomeStep').hidden=false"));

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
    showActivity(){},hideActivity(){},refreshAccountGates(){},syncAchievements(){},renderSprites(){},loadFavorites:async()=>{},
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
for(const width of [390,1280]){
  let opened=0;
  const immediateContext={
    localStorage:{getItem:()=>null},URL,location:{href:'https://hayleyw7.github.io/whimsy-grove/editor.html'},
    onboardingComplete:()=>false,validDraftScene:scene=>!!scene&&Array.isArray(scene.items),sceneNeedsOnboarding:scene=>!scene||scene.items.length===0&&!scene.promptId,
    chooseGroveStart:()=>{opened++;return Promise.resolve({background:'haze',promptId:null});},window:{innerWidth:width},
  };
  vm.runInNewContext(immediatePrompt+';earlyGroveChoice',immediateContext);
  assert.equal(opened,1,`fresh prompt opens immediately at ${width}px before network or sprite work`);
}
{
  let opened=0;
  const saved=makeScene({items:[{id:'cat',uid:'cat-1',x:200,y:250,size:200,flip:false}]});
  const returningContext={
    localStorage:{getItem:key=>key==='spooky-grove-current-guest'?JSON.stringify({scene:saved,editId:'saved'}):null},URL,
    location:{href:'https://hayleyw7.github.io/whimsy-grove/editor.html'},onboardingComplete:()=>false,
    validDraftScene:scene=>!!scene&&Array.isArray(scene.items),sceneNeedsOnboarding:scene=>!scene||scene.items.length===0&&!scene.promptId,
    chooseGroveStart:()=>{opened++;return Promise.resolve(null);},window:{innerWidth:390},
  };
  vm.runInNewContext(immediatePrompt+';earlyGroveChoice',returningContext);
  assert.equal(opened,0,'a returning local grove skips the immediate chooser even without a visit marker');
}
{
  let opened=0;
  const interruptedContext={localStorage:{getItem:()=>null},URL,location:{href:'https://hayleyw7.github.io/whimsy-grove/editor.html'},
    onboardingComplete:()=>false,validDraftScene:scene=>!!scene&&Array.isArray(scene.items),sceneNeedsOnboarding:scene=>!scene||scene.items.length===0&&!scene.promptId,
    chooseGroveStart:()=>{opened++;return Promise.resolve(null);},window:{innerWidth:390}};
  vm.runInNewContext(immediatePrompt+';earlyGroveChoice',interruptedContext);
  assert.equal(opened,1,'a visit marker written before first choice does not delay onboarding after reload');
}
{
  let opened=0;
  const completedContext={localStorage:{getItem:()=>null},URL,location:{href:'https://hayleyw7.github.io/whimsy-grove/editor.html'},
    onboardingComplete:()=>true,validDraftScene:scene=>!!scene&&Array.isArray(scene.items),sceneNeedsOnboarding:scene=>!scene||scene.items.length===0&&!scene.promptId,
    chooseGroveStart:()=>{opened++;return Promise.resolve(null);},window:{innerWidth:390}};
  vm.runInNewContext(immediatePrompt+';earlyGroveChoice',completedContext);
  assert.equal(opened,0,'completed onboarding skips the early chooser');
}
console.log('PASS: immediate mobile/desktop first-run prompt, reload before completing onboarding, storage failure fallback, empty legacy drafts, History, saved groves, and returning sessions');
