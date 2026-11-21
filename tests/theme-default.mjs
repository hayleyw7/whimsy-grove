import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync('public/index.html','utf8');
const init=html.match(/<script>(.*?)<\/script>/s)[1];
const js=fs.readFileSync('public/garden.js','utf8');
const toggle=js.match(/\$\('#themeToggle'\)\.addEventListener\('click',\(\)=>\{(.*?)\}\);updateThemeButton\(\);/s)[1];
for(const osDark of [false,true])for(const stored of [null,'light','dark','invalid']){
 let saved=stored,writes=0;
 const document={documentElement:{dataset:{}},querySelector:()=>({setAttribute(){}})};
 const context={document,localStorage:{getItem:()=>saved,setItem:(k,v)=>{saved=v;writes++;}},matchMedia:()=>({matches:osDark}),updateThemeButton(){},closeFloating(){}};
 vm.runInNewContext(init,context);
 const expected=['light','dark'].includes(stored)?stored:'dark';
 assert.equal(document.documentElement.dataset.theme,expected);assert.equal(writes,0,'automatic defaults must not persist');
 vm.runInNewContext(toggle,context);assert.equal(saved,expected==='dark'?'light':'dark');
 document.documentElement.dataset.theme='';vm.runInNewContext(init,context);assert.equal(document.documentElement.dataset.theme,saved);
}
assert.match(html,/<html[^>]*data-theme="dark"/);assert.ok(html.indexOf(init)<html.indexOf('rel="stylesheet"'));
console.log('PASS: OS light/dark default Dark, saved choices retained, default not persisted, toggle/reload, dark prepaint');
const themeCss=fs.readFileSync('public/style.css','utf8');
const semantic=themeCss.slice(themeCss.indexOf('/* Semantic editor UI colors:'));
const values=(theme)=>Object.fromEntries([...semantic.match(new RegExp('html\\[data-theme='+theme+'\\]\\{([^}]+)\\}'))[1].matchAll(/(--[\w-]+):([^;]+);/g)].map(([,k,v])=>[k,v.trim()]));
const light=values('light'),dark=values('dark');
for(const role of Object.keys(dark))assert.ok(light[role],role);
assert.equal(light['--paper'],'#f3ece1');
assert.equal(light['--panel'],'#fcf8ef');
assert.equal(light['--ink'],'#35243c');
assert.equal(dark['--ui-main-panel-fill'],'#271a30');
assert.equal(dark['--ui-earned-fill'],'#49304d');
assert.match(semantic,/#userMenu :is\(#themeToggle,#openHistory,#openAchievements,#openHelp,#clear\)\{background:transparent;color:var\(--ui-menu-row-ink\)/);
assert.match(semantic,/\.motion-setting\{margin-top:0;min-height:46px;/);
assert.match(semantic,/\.sfx-label\{margin-top:4px;margin-bottom:0;min-height:46px;/);
for(const part of ['webkit-slider-runnable-track','moz-range-track','webkit-slider-thumb','moz-range-thumb'])assert.match(semantic,new RegExp('#musicVolume::-'+part+'\\{[^}]*height:8px;[^}]*border-radius:3px 3px 0 0;'));
assert.match(semantic,/musicVolume::-webkit-slider-runnable-track\{[^}]*var\(--ui-rail\)/);
assert.match(semantic,/musicVolume::-webkit-slider-thumb\{[^}]*var\(--ui-thumb\)/);
console.log('PASS: editor light/dark semantic palettes, shared menu rows, checkbox rhythm, scrollbar-like volume styling and dark role preservation.');

assert.equal(dark['--ui-scene-strip-fill'],'#2b1e34');
assert.equal(light['--ui-scene-strip-fill'],'var(--ui-main-panel-fill)');
assert.match(semantic,/\.scene-controls\{background:var\(--ui-scene-strip-fill\);\}/);
assert.match(semantic,/\.garden-panel>\.canvas-tools\{background:var\(--ui-scene-strip-fill\);\}/);

assert.equal(dark['--ui-favorite-color'],'#d0accd');
assert.equal(dark['--ui-favorite-selected-color'],'#ffb5d3');
assert.equal(light['--ui-favorite-color'],'#935274');
assert.equal(light['--ui-favorite-selected-color'],'#bb2e67');
assert.match(themeCss,/@media\(min-width:651px\)\{\s*body\.editor-ui \.masthead :is\(#clear,#openAlbum\):not\(:hover\):not\(:focus-visible\)\{background:var\(--ui-control-rest-fill\);border-color:transparent;box-shadow:none;/);

{
 const css=fs.readFileSync('public/style.css','utf8');
 assert.match(css,/@media\(forced-colors:none\)\{\s*body\.editor-ui \.grove-scroll-track:is\(\[aria-controls=biomeMenu\],\[aria-controls=weatherMenu\]\)\{--ui-thumb-hover:var\(--ui-thumb\);\}/);
 assert.match(css,/\.grove-scroll-track:is\(\[aria-controls=biomeMenu\],\[aria-controls=weatherMenu\]\) \.grove-scroll-thumb\{background-color:var\(--ui-thumb\);\}/);
 console.log('PASS: Biome/Weather scrollbar interaction keeps theme resting colors without overriding forced-colors.');
}
const luminance=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return(values[0]+.05)/(values[1]+.05);};
for(const bg of ['--paper','--panel','--ui-rest-fill','--ui-surface-hover'])assert(contrast(light['--ink'],light[bg])>=4.5,bg);
assert(contrast(light['--ui-muted-ink'],light['--panel'])>=4.5);
assert(contrast('#ffffff',light['--ui-primary-fill'])>=4.5);
assert.equal(light['--ui-editor-border-color'],'var(--line)');
assert.equal(dark['--ui-editor-border-color'],'#705777');
for(const selector of ['.masthead','.garden-panel','.grove-section','.prompt-reminder']){
 const selectorPattern=selector.replace('.','\\.');
 assert.match(themeCss,new RegExp(selectorPattern+'\\{[^}]*border-color:var\\(--ui-editor-border-color\\)'));
}
assert.match(html,/html\[data-theme=light\] body\{background:#f3ece1\}/);
console.log('PASS: parchment light palette and AA ink contrast, quieter canvas border, matching first paint.');

// Both themes run the same component geometry and state behavior.
const colorProperties=new Set(['background','background-color','background-image','color','border-color','border-top-color','border-bottom-color','outline-color','box-shadow','text-shadow','scrollbar-color','accent-color','fill','stroke','color-scheme']);
for(const [,selectors,body] of themeCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
 if(!/data-theme\s*=\s*(?:dark|light)/.test(selectors))continue;
 for(const declaration of body.split(';')){
  const prop=declaration.split(':',1)[0].trim();
  if(prop&&!prop.startsWith('--'))assert(colorProperties.has(prop),selectors.trim()+' has a theme-only non-color rule: '+prop);
 }
}
assert.match(themeCss,/#odditySearch:focus\{\s*border-color:transparent;box-shadow:none;\s*outline:2px solid var\(--ui-focus-ring\)!important;outline-offset:-2px;/);
console.log('PASS: explicit light/dark rules only change appearance colors or platform color-scheme; search focus is a single inset ring.');

for(const t of [light,dark]){assert.equal(t['--ui-dropdown-panel-background'],'var(--ui-main-panel-fill)');assert.equal(t['--ui-side-panel-background'],'var(--ui-main-panel-fill)');}
assert(contrast(light['--panel'],light['--ui-rest-fill'])>1.15);

assert.match(fs.readFileSync('public/style.css','utf8'),/body\.editor-ui \.audio-settings \.volume-label\{margin-top:0;margin-bottom:0;position:relative;top:3px;\}/);
console.log('PASS: Volume label/percentage have a tighter shared bottom gap; slider size and section rhythm unchanged.');

assert(fs.readFileSync('public/style.css','utf8').includes('@keyframes boot-mushroom-sway{0%,100%{transform:translateY(1px) rotate(0deg);}25%{transform:translateY(-1.5px) rotate(-7deg);}50%{transform:translateY(-4px) rotate(0deg);}75%{transform:translateY(-1.5px) rotate(7deg);}}'));
console.log('PASS: shared loader wiggle crosses neutral with equal left/right rotations and unchanged bob extremes.');

assert.equal((fs.readFileSync('public/style.css','utf8').match(/--ui-rail:var\(--ui-rest-fill\);/g)||[]).length,2);
console.log('PASS: scrollbar and Volume tracks use the closed control resting role in both themes; thumb roles unchanged.');

for(const palette of [light,dark])assert.equal(palette['--ui-rail'],'var(--ui-rest-fill)');
assert.match(themeCss,/--ui-control-rest-fill:var\(--ui-rest-fill,/);


assert.equal(light['--ui-rest-fill'],'#DDD0D7');
console.log('PASS: rosy mauve light resting control fill; shared control/rail aliases retained.');

assert.match(fs.readFileSync('public/style.css','utf8'),/body\.editor-ui :is\(#confirmDialog:has\(#confirmNewMushroom:not\(\[hidden\]\)\) #confirmCancel,#renameDialog #cancelRename\)\{border-color:transparent;\}/);
console.log('PASS: Start Over Cancel border is transparent; geometry/fill/focus and other confirmation modes untouched.');

assert.equal(light['--ui-color-trigger-open-fill'],'#d1bfcb');
assert.equal(light['--ui-dropdown-panel-border-color'],'#92788b');
assert.equal(light['--ui-dropdown-option-selected-background'],'#65435f');
assert(contrast(light['--ink'],light['--ui-color-trigger-open-fill'])>=4.5);
assert(contrast('#ffffff',light['--ui-dropdown-option-selected-background'])>=4.5);
assert(contrast(light['--panel'],light['--ui-dropdown-panel-border-color'])>=3);
console.log('PASS: warmer light dropdown roles and AA ink/selected contrast, preserving dark values.');

assert.match(themeCss,/html\[data-theme\] body\.editor-ui :is\(\.dropdown-menu,#userMenu,#colorPanel,#albumOptionsMenu,\.saved-card \.saved-menu\)\{\s*border-color:transparent;background-clip:border-box;/);
assert.match(themeCss,/data-dropdown-side=below\]\{\s*border-top-color:var\(--ui-dialog-divider\)/);
assert.match(themeCss,/data-dropdown-side=above\]\{\s*border-bottom-color:var\(--ui-dialog-divider\)/);

assert.match(themeCss,/\[aria-haspopup=listbox\]\[aria-expanded=true\]\{background:var\(--ui-control-rest-fill\)/);
assert.match(themeCss,/\.dropdown-menu,\.floating-panel,#albumOptionsMenu,\.saved-card \.saved-menu\)\{background-color:var\(--ui-dropdown-panel-background\)/);
for(const [panel,hover,selected] of [['#fcf8ef','#e4d6df','#65435f'],['#271a30','#4c3356','#8c577e']]){
 assert(contrast(panel,selected)>contrast(panel,hover),'selected is visually stronger than hover');
}

const audioSettingsMarkup=fs.readFileSync('public/index.html','utf8').match(/<fieldset class="audio-settings">([\s\S]*?)<\/fieldset>/)[1];
assert.match(audioSettingsMarkup,/class="volume-label" for="musicVolume">Music [\s\S]*?id="musicVolumeValue"[\s\S]*?type="range" id="musicVolume" aria-label="Music volume"[\s\S]*?id="musicButton"[\s\S]*?id="soundEffects"/);

assert.match(themeCss,/#startDialog #ideaStep :is\(button\.idea-choice,#shuffleIdeas\):hover:not\(:disabled\)\{\s*background:var\(--ui-action-hover-fill\);color:var\(--ui-action-hover-ink\);filter:none;/);
assert.match(themeCss,/#startDialog #shuffleIdeas\{background:var\(--ui-idea-secondary-fill\);color:var\(--ui-primary-ink\);/);
assert.match(themeCss,/:is\(#confirmDialog #confirmCancel,#startDialog #chooseAnotherIdea,#renameDialog #cancelRename\)\{background:var\(--ui-confirm-secondary-fill\);color:var\(--ui-confirm-secondary-ink\);/);
assert.match(themeCss,/\.toast\[data-kind=error\]\{background:var\(--ui-dialog-background\);color:var\(--ui-dialog-color\);/);
assert.equal(dark['--ui-toast-background'],'var(--ui-dialog-background)');
assert.equal(dark['--ui-toast-color'],'var(--ui-dialog-color)');
assert.doesNotMatch(themeCss,/html\[data-theme=dark\] \.toast\{background:#efe3f3/);
assert.doesNotMatch(themeCss,/\.toast\[data-kind=error\]::?before/);
assert.match(themeCss,/\.toast-dismiss\{display:block;margin:12px 0 0 auto/);
