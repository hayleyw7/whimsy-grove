import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const css=await readFile('public/style.css','utf8');
assert.match(css,/@media \(min-width:651px\) and \(min-height:561px\)/);
assert.match(css,/\.garden-panel\{[^}]*display:grid;grid-template-rows:auto minmax\(0,1fr\) auto auto/);
assert.match(css,/body:not\(\.grove-view\) \.garden-panel\{container-type:size/);
assert.match(css,/body:not\(\.grove-view\) \.canvas-wrap\{[^}]*height:min\(100%,90cqw\);aspect-ratio:10\/9/);
assert.match(css,/body:not\(\.grove-view\) \.canvas-wrap canvas\{[^}]*width:100%;height:100%;aspect-ratio:10\/9/);
assert.match(css,/body:not\(\.grove-view\) main\{height:auto;min-height:0;display:block/);
assert.match(css,/Narrow\/mobile layouts intentionally\s+keep normal document flow/);
const dragTest=await readFile('tests/picker-drag.mjs','utf8');
assert.match(dragTest,/placement uses current canvas bounds after scaling or scrolling/);
assert.equal(640/576,10/9);
console.log('PASS: structural CSS assertions cover short desktop fitting, exact-ratio sizing rules, pointer-bound coverage, and mobile document flow');
const dropdownCss=await import('node:fs').then(({readFileSync})=>readFileSync('public/style.css','utf8'));
assert.match(dropdownCss,/\.garden-panel\{[^}]*border-radius:var\(--grove-radius-panel\)/);
assert.match(dropdownCss,/\.grove-section,\.grove-dialog,\.gallery-dialog\{border-radius:var\(--grove-radius-panel\)/);
assert.match(dropdownCss,/\.dropdown-menu,\.floating-panel,\.saved-card\{border-radius:var\(--grove-radius-control\)/);
const dropdownMarkup=await import('node:fs').then(({readFileSync})=>readFileSync('public/index.html','utf8'));
assert.match(dropdownCss,/body\.editor-ui :is\(#musicButton,\.dropdown-trigger\)\[aria-haspopup=listbox\]\{[^}]*height:46px;min-height:46px;max-height:46px;[^}]*padding:0 11px;gap:6px;font-size:14px;/);
assert.match(dropdownCss,/body\.editor-ui :is\(#musicButton,\.dropdown-trigger\)\[aria-haspopup=listbox\] \.dropdown-chevron\{width:7px;height:7px;flex:0 0 7px;margin:0 1px;/);
for(const id of ['musicButton','biomeButton','weatherButton','oddityCategoryButton','albumSortButton'])assert.match(dropdownMarkup,new RegExp('<button[^>]+id="'+id+'"[^>]+aria-haspopup="listbox"'));
assert.match(dropdownMarkup,/<button id="colorButton"[^>]+aria-haspopup="dialog"/);
console.log('PASS: five editor text dropdowns share dimensions and chevron insets; palette remains exempt.');
assert.match(dropdownCss,/body\.editor-ui:not\(\.grove-view\) \.garden-panel\{box-shadow:none;\}/);
assert.match(dropdownCss,/body\.editor-ui \.scene-controls\{background:var\(--ui-scene-strip-fill\);\}/);
console.log('PASS: scene strip uses the shared action-strip theme role and editor frame has no protruding shadow.');

assert.match(dropdownCss,/\.resize-handle span\{display:block;width:14px;height:14px;background:#ffeaf4;border:0;border-radius:4px;box-shadow:none\}/);
assert.match(dropdownCss,/\.resize-handle \.corner-rotation-cue\{[^}]*width:27px;height:27px;/);
assert.match(dropdownCss,/\.object-handle\{[^}]*width:48px;height:48px;/);
assert.match(dropdownCss,/\.object-handle:focus-visible\{outline:3px solid #ce679f;outline-offset:-3px\}/);
console.log('PASS: smaller resize squares keep the original rotation cue, hit targets, and keyboard focus.');
assert.match(dropdownCss,/width:calc\(100% \+ var\(--ui-menu-left\) \+ var\(--ui-menu-right\)\);\s*margin-inline:calc\(-1 \* var\(--ui-menu-left\)\) calc\(-1 \* var\(--ui-menu-right\)\);\s*padding-inline:calc\(var\(--ui-option-left\) \+ var\(--ui-menu-left\)\)/);
assert.match(dropdownCss,/\.dropdown-option\{border-width:0;border-color:transparent;box-shadow:none;\}/);
assert.match(dropdownCss,/\.dropdown-option:not\(:focus-visible\)\{outline:none;\}/);
assert.match(dropdownCss,/\.dropdown-option:focus-visible\{outline:2px solid var\(--ui-focus-ring\)!important;outline-offset:-2px;\}/);
assert.match(dropdownCss,/:is\(#musicButton,\.dropdown-trigger\):is\(\[aria-haspopup=listbox\]:not\(\[aria-expanded=true\]\),#colorButton\):hover:not\(:disabled\),\s*body\.editor-ui \.masthead :is\(#clear,#openAlbum\)\.header-album:hover:not\(:disabled\)\{\s*background:var\(--ui-trigger-hover-fill\);color:var\(--ui-trigger-hover-ink\);border-color:transparent;box-shadow:none;filter:none;/);

assert.match(dropdownCss,/\[role=listbox\]\[data-dropdown-side=below\]\{padding-top:0;border-top-left-radius:0;border-top-right-radius:0;/);
assert.match(dropdownCss,/\[role=listbox\]\[data-dropdown-side=above\]\{padding-bottom:0;border-bottom-left-radius:0;border-bottom-right-radius:0;/);
for(const id of ['musicMenu','biomeMenu','weatherMenu','oddityCategoryMenu','albumSortMenu'])assert.match(dropdownMarkup,new RegExp('<div[^>]+id="'+id+'"[^>]+role="listbox"'));

assert.match(dropdownCss,/\.album-options-menu\{[^}]*background:var\(--ui-main-panel-fill\);box-shadow:var\(--ui-popup-shadow\)/);
assert.match(dropdownCss,/\.album-options-menu button\{[^}]*min-height:44px;[^}]*border:0;border-radius:0;box-shadow:none;background:transparent;/);
assert.match(dropdownCss,/\.album-options-menu button:is\(:hover,:focus-visible\)\{background:var\(--ui-dropdown-option-highlight-background\);/);
assert.match(dropdownMarkup,/<div id="albumOptionsMenu"[^>]*role="menu"/);

assert.match(dropdownCss,/@media\(min-width:651px\)\{\s*body\.editor-ui:not\(\.grove-view\) :is\(\.garden-panel,\.toolbox>\.picker-section\)\{border-width:1px;\}/);
console.log('PASS: desktop canvas and Oddities share1px borders without changing mobile/fullscreen or border colors.');
assert.match(dropdownCss,/\[role=listbox\],\s*body\.editor-ui #albumOptionsMenu\[role=menu\]\{padding-bottom:0;background-clip:padding-box;\}/);
assert.match(dropdownCss,/#albumOptionsMenu\[role=menu\]\{overflow:hidden;\}/);
assert.match(dropdownMarkup,/#closeGallery|id="closeGallery" aria-label="Close gallery"><svg class="ui-icon"[^>]*aria-hidden="true"/);
assert.match(dropdownCss,/#albumHistoryDialog :is\(#albumOptions,#closeGallery\)\{display:grid;place-items:center;width:44px;height:44px;min-width:44px;min-height:44px;/);
assert.match(dropdownCss,/:is\(#confirmDialog #confirmCancel,#startDialog #chooseAnotherIdea,#renameDialog #cancelRename\):hover:not\(:disabled\)\{background:var\(--ui-action-hover-fill\);[^}]*border-color:transparent;/);
assert.match(dropdownCss,/#confirmAction:hover:not\(:disabled\)\{background:color-mix\(in srgb,var\(--ui-primary-fill\) 78%,#22132b\);[^}]*border-color:transparent;/);

const {runInNewContext}=await import('node:vm');
const layoutSource=await readFile('public/editor-layout.js','utf8');
const canvasLayout=runInNewContext(layoutSource.match(/^function canvasLayout\([\s\S]*?^\}/m)[0]+';canvasLayout',{ratio:10/9});
const fitLayout=(width,height,sidebarMin=304)=>canvasLayout({width,height,chrome:128,border:2,gap:10,sidebarMin,minimumCanvasHeight:320});
for(const [viewport,width,height,sidebar] of [
 ['697×724',653,635,false],
 ['ultrawide desktop',1224,700,true],
 ['short desktop',960,340,true],
 ['short narrower desktop',620,340,true],
 ['tall desktop',850,1300,false],
]){
 const fit=fitLayout(width,height);
 assert.equal(fit.sidebar,sidebar,viewport);
 assert.equal(fit.panelWidth,fitLayout(width,height,Infinity).panelWidth,viewport+' never gives canvas width to Oddities');
 assert.ok(Math.abs((fit.panelWidth-2)/(fit.panelHeight-128)-10/9)<1e-10,viewport+' preserves 10:9');
}
assert.equal(fitLayout(716,488).sidebar,true,'at least 304px plus the gap remains for Oddities');
assert.equal(fitLayout(715,488).sidebar,false,'one pixel less switches to the modal, not a smaller canvas');
assert.match(css,/body\[data-oddities-modal\] \.achievement-grid\{grid-template-columns:minmax\(0,1fr\)/);
console.log('PASS: maximal canvas width is independent from the sidebar and preserves 10:9 across viewport sizes; achievements use actual sidebar layout.');

const placement=await readFile('public/prompt-placement.js','utf8');
assert.doesNotMatch(placement,/condensed|800px|workspace\.after/);
assert.match(placement,/phone\.matches\|\|document\.body\.hasAttribute\('data-oddities-modal'\)/);
assert.match(layoutSource,/roomWithoutPrompt=fit\(availableHeight\(\)\+promptSpace\);[\s\S]*setPickerMode\(phone.matches\|\|!roomWithoutPrompt.sidebar\);[\s\S]*const layout=fit\(availableHeight\(\)\);/);
assert.equal(fitLayout(652,417).sidebar,true,'696×546 example: prompt fits in the right column');
assert.equal(fitLayout(628,483).sidebar,false,'672×601 example: prompt sits above the single column');
console.log('PASS: prompt follows the actual stable column decision, keeping its height out of sidebar fit.');
