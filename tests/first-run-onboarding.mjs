import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync('public/garden.js','utf8');
const restore=source.slice(source.indexOf('async function restoreCurrentDraft'),source.indexOf('function queueDraft'));
const startup=source.slice(source.indexOf('Promise.all(Object.entries(sources)'));
const welcome=readFileSync('dist/index.html','utf8');

assert(welcome.includes('href="editor.html?start=1" aria-label="Create">Create</a>'));
assert(startup.includes('if(firstGrove)await startNewGrove(true);'));
assert(source.includes('if(first)markOnboardingComplete();'));
assert(source.includes('ideas.slice(0,2)'));
assert(source.includes('area.append(freeCreateChoice)'));
assert(source.includes("$('#biomeStep').hidden=false"));

const makeScene=({items=[],promptId=null,background='forest'}={})=>({
  version:2,creationId:'creation-id',items,promptId,promptHidden:false,
  palette:'haunted',background,weather:[],motion:true,motionPreference:'auto'
});
async function restoreState({local=null,history=[],complete=false}={}){
  const state=makeScene();
  let historyQueries=0,marked=false,queued=false;
  const writes=[];
  const context={
    accountChecked:true,signedIn:false,draftScope:null,draftCloudReady:false,
    localDraft:()=>local,
    request:async path=>{
      assert(path.startsWith('/api/drawings?collection=history'));
      historyQueries++;
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
console.log('PASS: fresh Create flow, empty legacy drafts, History, saved groves, and reload after onboarding');
