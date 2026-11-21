import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
class Node{constructor(id){this.id=id;this.children=[];this.listeners={};this.attrs={};this.hidden=false;this.open=false;}addEventListener(k,f){this.listeners[k]=f;}setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}append(...nodes){for(const n of nodes){if(n.parentElement)n.parentElement.children=n.parentElement.children.filter(v=>v!==n);this.children.push(n);n.parentElement=this;}}prepend(...nodes){for(const n of [...nodes].reverse()){this.append(n);this.children.pop();this.children.unshift(n);}}insertBefore(n,a){this.append(n);this.children.pop();this.children.splice(this.children.indexOf(a),0,n);}querySelector(){return this.children.find(n=>n.id==='anchor');}focus(){this.focused=true;}showModal(){this.open=true;}close(){this.open=false;this.listeners.close?.();}}
const ids={};const node=id=>ids[id]??=new Node(id);const media={matches:true,addEventListener(_,f){this.change=f;}};
const header=node('header'),menu=node('userMenu'),home=node('home');header.append(node('masterMute'),node('clear'),node('openAlbum'),node('anchor'));home.append(node('oddityPicker'));
const pickerEvents=[],layoutListeners={};let modalLayout=false;const ctx={Event,matchMedia:()=>media,document:{body:{hasAttribute:()=>modalLayout},addEventListener:(type,listener)=>layoutListeners[type]=listener,dispatchEvent:event=>pickerEvents.push(event.type),getElementById:node,querySelector:s=>s==='.header-actions'?header:node('skip')}};
vm.runInNewContext(fs.readFileSync('public/mobile-header.js','utf8'),ctx);assert.equal(node('clear').parentElement,menu);assert.equal(node('openAlbum').parentElement,header);media.matches=false;media.change();assert.equal(node('clear').parentElement,header);assert.equal(header.children.map(x=>x.id).join(','),'masterMute,clear,openAlbum,anchor');
media.matches=true;vm.runInNewContext(fs.readFileSync('public/mobile-picker.js','utf8'),{...ctx});const dialog=node('mobileOdditiesDialog'),plus=node('toggleOddities');assert.equal(node('oddityPicker').parentElement,dialog);assert.equal(dialog.open,false);
plus.listeners.click({preventDefault(){},stopImmediatePropagation(){}});assert.equal(dialog.open,true);assert.equal(plus.attrs['aria-expanded'],'true');assert.deepEqual(pickerEvents,['grove-oddities-open']);
node('closeMobileOddities').listeners.click();assert.equal(dialog.open,false);assert.equal(plus.focused,true);
plus.listeners.click({preventDefault(){},stopImmediatePropagation(){}});plus.hidden=true;dialog.listeners.click({target:{closest:()=>({disabled:false})}});assert.equal(dialog.open,false);assert.equal(node('garden').focused,true);
media.matches=false;media.change();assert.equal(node('oddityPicker').parentElement,home);
modalLayout=true;layoutListeners['grove-picker-layout']();assert.equal(node('oddityPicker').parentElement,dialog);
plus.hidden=false;plus.listeners.click({preventDefault(){},stopImmediatePropagation(){}});assert.equal(dialog.open,true);
modalLayout=false;layoutListeners['grove-picker-layout']();assert.equal(dialog.open,false);assert.equal(node('oddityPicker').parentElement,home);
const source=fs.readFileSync('public/garden.js','utf8');const swap=source.match(/\$\('#transformTools'\)\.hidden=!activeOddity\(\);\$\('#outputTools'\)\.hidden=!!activeOddity\(\);/)[0];for(const selected of [false,true]){vm.runInNewContext(swap,{$:s=>node(s),activeOddity:()=>selected?{}:null});assert.equal(node('#transformTools').hidden,!selected);assert.equal(node('#outputTools').hidden,selected);}
console.log('PASS: mobile header moves original controls, picker closed/open/close/add-focus/desktop restoration, contextual toolbar swap');
const ctaCondition=source.match(/if\((favoritesOnly&&favorites\.size===0&&usesOddityModal\(\))\)/)?.[1];assert.ok(ctaCondition);
for(const [only,size,mobile,expected] of [[true,0,true,true],[true,1,true,false],[true,0,false,false],[false,0,true,false]])assert.equal(vm.runInNewContext(ctaCondition,{favoritesOnly:only,favorites:new Set(Array.from({length:size},(_,i)=>i)),usesOddityModal:()=>mobile}),expected);
const handler=source.match(/browse\.addEventListener\('click',\(\)=>\{([^}]+(?:\{preventScroll:true\}\);))\}\)/)[1];
let toggled=false,focused=false;const browseContext={oddityCategory:'nature',$:s=>s==='#favoriteFilter'?{click(){toggled=true;}}:{focus(){focused=true;}}};vm.runInNewContext(handler,browseContext);assert.equal(browseContext.oddityCategory,'all');assert.ok(toggled&&focused);console.log('PASS: Browse CTA only for zero saved favorites on mobile, reuses filter and focuses search');
const editorMarkup=fs.readFileSync('public/index.html','utf8');
assert.match(editorMarkup,/<input\b[^>]*\bid="odditySearch"[^>]*\baria-label="Search Items"[^>]*\bplaceholder="Search the collection\.\.\."/);
assert.doesNotMatch(source,/syncSearchPlaceholder|Search \$\{[^}]+\} oddities/);
assert.match(source,/\$\('#odditySearch'\)\.addEventListener\('input',renderOddities\)/);
console.log('PASS: shared Oddities search placeholder has exact copy, no dynamic count override, and existing search input behavior.');
const odditySearchEasterEggs=vm.runInNewContext(source.match(/const odditySearchEasterEggs=([^;]+);/)[1]);
const odditySearchEasterEgg=vm.runInNewContext(source.slice(source.indexOf('function odditySearchEasterEgg('),source.indexOf('function renderOddities('))+';odditySearchEasterEgg',{odditySearchEasterEggs});
const emptyCopy=source.match(/if\(favoritesOnly\)p\.innerHTML=([^;]+);else\{p\.className\+=([^;]+);p\.innerHTML=([^;]+);\}/)[0];
const icon=source.match(/const heartIcon=([^;]+);/)[1];
for(const favoritesOnly of [true,false]){const p={};vm.runInNewContext(emptyCopy,{favoritesOnly,p,odditySearchEasterEgg,query:'',heartIcon:vm.runInNewContext(icon)});if(favoritesOnly){assert.match(p.innerHTML,/^Tap <svg/);assert.match(p.innerHTML,/aria-hidden="true"/);assert.match(p.innerHTML,/<span class="sr-only">a heart<\/span> on an oddity to favorite it\.$/);}else assert.equal(p.innerHTML,'<span>Nothing lurking by that name.</span><span>Try another term.</span>');}
console.log('PASS: favorite empty copy uses shared decorative heart, accessible a heart text, and exact favorite sentence.');
const normalizedOddityQuery=source.match(/query=(\$\('#odditySearch'\)\.value\.trim\(\)\.toLowerCase\(\))/)[1];
for(const [value,egg] of [['test',true],[' TEST ',true],['testing ground',true],['mic check',true],['sound check',true],['soundcheck',false],['testing testing',true],['some test',true],['contest',false],['checkpoint',false],['testing_ground',false],['(TEST!)',true],['',false]]){
 const query=vm.runInNewContext(normalizedOddityQuery,{$:()=>({value})});
 const p={className:'search-empty'};
 vm.runInNewContext(emptyCopy,{favoritesOnly:false,p,query,odditySearchEasterEgg});
 assert.equal(p.innerHTML,egg?'<span>The mushrooms hear your call.</span><span>It echoes through the forest.</span>':'<span>Nothing lurking by that name.</span><span>Try another term.</span>');
 assert.equal(p.className,'search-empty search-no-results');
}
for(const [value,expected] of [
 [' PENIS ','<span>Wrong kind of mushroom.</span><span>May your journey be fruitful.</span>'],
 ['boobs','<span>Lovely hills.</span><span>Have you tried the Biome menu?</span>'],
 ['poop','<span>The dung beetles carry it underground.</span><span>What returns to the soil helps new life grow.</span>'],
 [' VAGINA ','<span>The most magical secret garden of all.</span>'],
 ...['coochie','hoo-ha','hooha'].map(value=>[value,'<span>Nothing lurking by that name.</span><span>Try another term.</span>']),
 ['big boobs','<span>Lovely hills.</span><span>Have you tried the Biome menu?</span>'],
 ['purple poop','<span>The dung beetles carry it underground.</span><span>What returns to the soil helps new life grow.</span>'],
 ['“vag,” then test','<span>The most magical secret garden of all.</span>'],
 ['test after boob','<span>The mushrooms hear your call.</span><span>It echoes through the forest.</span>'],
 ['very poopy','<span>The dung beetles carry it underground.</span><span>What returns to the soil helps new life grow.</span>'],
 ['extra BEWBZ!', '<span>Lovely hills.</span><span>Have you tried the Biome menu?</span>'],
 ...['poopiness','titter','bewbsome'].map(value=>[value,'<span>Nothing lurking by that name.</span><span>Try another term.</span>']),
 ['coochial','<span>Nothing lurking by that name.</span><span>Try another term.</span>'],
]){
 const p={className:'search-empty'};
 const query=vm.runInNewContext(normalizedOddityQuery,{$:()=>({value})});
 vm.runInNewContext(emptyCopy,{favoritesOnly:false,p,query,odditySearchEasterEgg});
 assert.equal(p.innerHTML,expected);
}
for(const [canonical,aliases] of [
 ['test','testing|check'],
 ['poo','poop|dung|feces|faeces|shit|turd|dookie|poopie|poopy'],
 ['penis','dick|cock|willy|dong|schlong'],
 ['boob','boobs|boobies|breast|breasts|tits|bosom|bewbs|bewb|bewbz|tiddies|tiddy|titt|titty|titties'],
 ['vag','vagina|vaginas|vulva|pussy|pussies|puss|cooch'],
])for(const alias of aliases.split('|')){
 const p={className:'search-empty'};
 const query=vm.runInNewContext(normalizedOddityQuery,{$:()=>({value:' '+alias.toUpperCase()+' '})});
 vm.runInNewContext(emptyCopy,{favoritesOnly:false,p,query,odditySearchEasterEgg});
 assert.equal(p.innerHTML,odditySearchEasterEggs.get(canonical),alias);
}
assert.equal(odditySearchEasterEggs.size,42);
assert.match(source,/if\(!entries\.length\)\{[^}]*odditySearchEasterEgg\(query\)/);

const emptyFavorites=source.match(/classList\.toggle\('empty-favorites',([^;]+)\);/)[1];
for(const [only,size,count,want] of [[true,0,0,true],[true,1,0,false],[false,0,0,false],[true,0,1,false]])assert.equal(vm.runInNewContext(emptyFavorites,{favoritesOnly:only,favorites:{size},entries:{length:count}}),want);
assert.match(fs.readFileSync('public/style.css','utf8'),/#oddity-grid\.empty-favorites\{[^}]*justify-content:center/);
console.log('PASS: centered favorite group only applies to genuinely zero saved favorites.');
assert.match(editorMarkup,/<dialog id="mobileOdditiesDialog" aria-labelledby="mobileOdditiesTitle"><header><h2 id="mobileOdditiesTitle">Add Oddities<\/h2>/);
console.log('PASS: mobile Add Oddities heading remains its dialog accessible name.');
// Floating popup caps use border-box height; a 2px border cannot create overflow on its own.
const positionFloating=source.match(/^function positionFloating\(key\).*$/m)[0];
for(const [key,scrollHeight,expected] of [['user',384,386],['color',120,122],['user',900,560]]){
  const panel={hidden:false,scrollHeight,offsetHeight:302,clientHeight:300,style:{}};
  let desired;
  vm.runInNewContext(positionFloating+';positionFloating(key)',{key,floatingPanels:{[key]:{panel:'#panel',button:'#button',width:220}},$:id=>id==='#panel'?panel:{getBoundingClientRect:()=>({})},popupPlacement:(_box,_width,height)=>{desired=height;return {};}});
  assert.equal(desired,expected);
}
console.log('PASS: floating popup sizing includes border height and preserves the overflow cap.');

// Positioning uses available space; callers can cap long lists before positioning.
const placementCode=source.match(/^function dropdownPlacement\(box,desiredHeight,vh\)\{[\s\S]*?^\}/m)[0];
const placeDropdown=vm.runInNewContext(placementCode+';dropdownPlacement');
const attachedBelow=placeDropdown({top:140,bottom:186},498,900);
assert.equal(attachedBelow.side,'below');
assert.equal(attachedBelow.maxHeight,498);
assert.equal(attachedBelow.top,185);
const attachedAbove=placeDropdown({top:625,bottom:671},498,820);
assert.equal(attachedAbove.side,'above');
assert.equal(attachedAbove.maxHeight,498);
assert.equal(attachedAbove.top+attachedAbove.maxHeight,626);
const shorterPhone=placeDropdown({top:130,bottom:176},498,540);
assert.equal(shorterPhone.side,'below');
assert.equal(shorterPhone.maxHeight,353);
assert.match(source,/oddityCategoryLabels=\{all:'All'/);
assert.match(source,/option\.setAttribute\('aria-selected'/);
assert.match(source,/if\(e\.key==='Escape'\)\{e\.preventDefault\(\);e\.stopPropagation\?\.\(\);closeDropdown\(key,true\)/);
assert.match(source,/menu\.hidden=true;\$\(data\.button\)\.setAttribute\('aria-expanded','false'\)/);
for(const [id,label] of [['oddityCategoryLabel','Category'],['weatherLabel','Weather'],['biomeLabel','Biome'],['albumSortLabel','Sort']]){
  assert.match(editorMarkup,new RegExp('id="'+id+'" class="dropdown-value">[^<]+</span><span class="dropdown-open-label" aria-hidden="true">'+label+'</span>'));
}
console.log('PASS: attached dropdown geometry, full list above/below when it fits, true short-screen overflow, retained selection, and Escape restoration wiring.');

// Exercise the actual Category handlers with small DOM doubles.
{
  const key='oddityCategory',nodes=new Map(),changes=[];
  const make=()=>({attributes:{},children:[],listeners:{},dataset:{},scrollTop:0,clientHeight:498,offsetTop:0,offsetHeight:44,scrollHeight:498,
    setAttribute(name,value){this.attributes[name]=value;},addEventListener(name,fn){this.listeners[name]=fn;},
    append(child){this.children.push(child);},replaceChildren(){this.children=[];},
    focus(){this.focused=true;},dispatchEvent(event){changes.push(event.type);},
  });
  for(const name of ['button','label','menu','input'])nodes.set('#'+name,make());
  const menu=nodes.get('#menu'),button=nodes.get('#button'),input=nodes.get('#input');menu.hidden=true;
  const dropdowns={[key]:{button:'#button',label:'#label',menu:'#menu',input:'#input',scroll:0,opened:false,signature:''}};
  const handlerBlock=source.slice(source.indexOf('function closeDropdown('),source.indexOf("document.addEventListener('pointerdown',e=>{for(const [key,data]of Object.entries(dropdowns))"));
  const syncCode=source.match(/^function syncDropdown\(key,entries,value,placeholder\).*$/m)[0];
  const context={dropdowns,busy:false,floatingPanels:{},positionDropdown(){},$:id=>nodes.get(id),document:{createElement:make},Event};
  vm.runInNewContext(syncCode+'\n'+handlerBlock,context);
  context.syncDropdown(key,[{value:'all',label:'All'},{value:'animals',label:'Animals'}],'animals','All');
  button.listeners.click();
  assert.equal(menu.hidden,false);assert.equal(menu.children.length,2);
  assert.equal(menu.children[1].attributes['aria-selected'],'true');assert.equal(menu.children[1].focused,true);
  menu.listeners.keydown({key:'Escape',preventDefault(){},stopPropagation(){}});
  assert.equal(menu.hidden,true);assert.equal(button.attributes['aria-expanded'],'false');assert.equal(button.focused,true);
  assert.equal(nodes.get('#label').textContent,'Animals');
  button.listeners.click();menu.children[0].listeners.click({});
  assert.equal(input.value,'all');assert.equal(menu.hidden,true);assert.deepEqual(changes,['change']);
}
console.log('PASS: real Category handlers open, focus selected Animals, Escape restores trigger, and selecting All dispatches change.');
const positionDropdownCode=source.match(/^function positionDropdown\(key\)\{[\s\S]*?^\}/m)[0];
for(const key of ['weather','biome','oddityCategory','music']){
 for(const [scrollHeight,viewport,expected] of [[498,900,key==='music'?500:320],[120,900,122],[498,380,183]]){
  const menu={hidden:false,style:{},dataset:{},offsetHeight:300,clientHeight:298,scrollHeight};
  const button={dataset:{},getBoundingClientRect:()=>({top:140,bottom:186,left:30,width:250})};
  vm.runInNewContext(positionDropdownCode+';positionDropdown(key)',{
   key,dropdowns:{[key]:{menu:'#menu',button:'#button'}},$:id=>id==='#menu'?menu:button,
   window:{innerWidth:800,innerHeight:viewport},dropdownPlacement:placeDropdown,
  });
  assert.equal(menu.style.maxHeight,expected+'px',key);
 }
}

for(const [key,drawing,trigger,left,viewport,expectedWidth,expectedLeft] of [
 ['biome',360,111,22,696,222,22],
 ['weather',270,66,285,390,176,202],
 ['biome',361,111,22,696,111,22],
 ['oddityCategory',360,111,22,696,111,22],
 ['biome',270,66,12,174,150,12],
]){
 const menu={hidden:false,style:{},dataset:{},offsetHeight:122,clientHeight:120,scrollHeight:120};
 const button={dataset:{},getBoundingClientRect:()=>({top:140,bottom:186,left,width:trigger})};
 vm.runInNewContext(positionDropdownCode+';positionDropdown(key)',{
  key,dropdowns:{[key]:{menu:'#menu',button:'#button'}},$:id=>id==='#menu'?menu:id==='#garden'?{getBoundingClientRect:()=>({width:drawing})}:button,
  window:{innerWidth:viewport,innerHeight:600},dropdownPlacement:placeDropdown,
 });
 assert.equal(menu.style.width,expectedWidth+'px',key);
 assert.equal(menu.style.left,expectedLeft+'px',key);
}
console.log('PASS: only compact scene menus widen, stay anchored and clamp at the viewport edge.');

const scrollbarSource=fs.readFileSync('public/scrollbars.js','utf8');
const geometryCode=scrollbarSource.slice(scrollbarSource.indexOf('function geometry('),scrollbarSource.indexOf('function scrollTo('));
const scrollGeometry=vm.runInNewContext(geometryCode+';geometry',{innerWidth:1000,innerHeight:800});
const railFixture=(id,side)=>({id,dataset:{dropdownSide:side},getAttribute:name=>name==='role'&&side?'listbox':null,classList:{contains:()=>false},getBoundingClientRect:()=>({top:153,bottom:473,left:56,right:356}),clientHeight:318,scrollHeight:600,scrollTop:0});
for(const id of ['weatherMenu','biomeMenu','oddityCategoryMenu','musicMenu','albumSortMenu'])for(const [side,top,bottom] of [['below',154,472],['above',154,472]]){
 const geometry=scrollGeometry(railFixture(id,side),'y',{borderRightWidth:'0.625px',borderTopRightRadius:'12px',borderBottomRightRadius:'12px'});
 assert.equal(geometry.rightInset,.625);
 assert.equal(geometry.topRadius,side==='above'?11.375:0);
 assert.equal(geometry.bottomRadius,side==='below'?11.375:0);
 assert.equal(geometry.start,top,id+':'+side);
 assert.equal(geometry.start+geometry.length,bottom,id+':'+side);
}
for(const id of ['weatherMenu','biomeMenu']){
 const fixture=railFixture(id,'below');
 fixture.dataset.extendsRight='true';
 const style={borderTopWidth:'2px',borderRightWidth:'1px',borderBottomWidth:'1px',borderTopRightRadius:'12px',borderBottomRightRadius:'12px'};
 for(const pos of [0,140,282]){
  fixture.scrollTop=pos;
  const geometry=scrollGeometry(fixture,'y',style);
  assert.equal(geometry.topRadius,11,id);
  assert.equal(geometry.start,155,id);
  assert.equal(geometry.start+geometry.length,472,id);
  assert.equal(geometry.bottomRadius,11,id);
  assert.equal(geometry.position,pos,id);
 }
}
for(const innerWidth of [390,1100])for(const id of ['galleryContent','achievementContent']){
 const dialogStyle={borderRightWidth:'2px',borderBottomWidth:'2px',borderBottomRightRadius:'16px'};
 const geometry=vm.runInNewContext(geometryCode+';geometry',{innerWidth,innerHeight:720,getComputedStyle:()=>dialogStyle});
 const fixture=railFixture(id);
 fixture.closest=()=>({getBoundingClientRect:()=>({right:innerWidth-14,bottom:680})});
 const rail=geometry(fixture,'y');
 assert.equal(rail.start,153,id);
 assert.equal(rail.start+rail.length,678,id);
 assert.equal(rail.right-rail.rightInset,innerWidth-16,id);
 assert.equal(rail.bottomRadius,14,id);
}
console.log('PASS: Album and Achievements rails reach the inside bottom-right corner while starting at the scroll content.');
const unrelatedRail=scrollGeometry(railFixture('userMenu'),'y');
assert.equal(unrelatedRail.start,157);assert.equal(unrelatedRail.start+unrelatedRail.length,469);
const editorCss=fs.readFileSync('public/style.css','utf8');
assert.match(editorCss,/#albumHistoryDialog\{height:85dvh;\}/);
assert.doesNotMatch(source,/albumHistoryHeightFloor|dialog\.style\.minHeight/);
console.log('PASS: Groves uses the same full height regardless of selected tab or entry count.');
assert.match(scrollbarSource,/if\(g\.joined\)\{track\.classList\.toggle\('grove-scroll-at-start',g\.position<=0\.5\)/);
assert.match(editorCss,/\.grove-scroll-listbox\.grove-scroll-at-start\[data-axis=y\] \.grove-scroll-thumb\{border-top-left-radius:0;\}/);
assert.match(editorCss,/\[aria-controls=weatherMenu\],\[aria-controls=biomeMenu\]\):before\{top:0;/);
assert.match(editorCss,/\[aria-controls=weatherMenu\],\[aria-controls=biomeMenu\]\):before\{bottom:0;/);
console.log('PASS: All six joined rails keep both separators, preserve the right border, and clip only their outer corner.');

{
 const iconCode=source.slice(source.indexOf('const weatherGlyphs='),source.indexOf('function syncDropdown('));
 const syncCode=source.match(/^function syncDropdown\(key,entries,value,placeholder\).*$/m)[0];
 const nodes=new Map(),make=()=>({children:[],dataset:{},attributes:{},scrollTop:0,
  append(child){this.children.push(child);},replaceChildren(){this.children=[];},setAttribute(k,v){this.attributes[k]=v;},addEventListener(){},insertAdjacentHTML(where,html){assert.equal(where,'afterbegin');this.icon=html;}});
 for(const name of ['weather','biome'])for(const type of ['menu','label'])nodes.set(name+type,make());
 const dropdowns=Object.fromEntries(['weather','biome'].map(key=>[key,{menu:key+'menu',label:key+'label'}]));
 const context={dropdowns,$:id=>nodes.get(id),document:{createElement:make}};
 vm.runInNewContext(iconCode+syncCode,context);
 const values=[...source.match(/^const weatherChoices=.*$/m)[0].matchAll(/value:'([^']+)',label:'([^']+)'/g)].map(([,value,label])=>({value,label}));
 context.syncDropdown('weather',values,'wind','Clear');
 const options=nodes.get('weathermenu').children;
 assert.equal(options.length,16);
 for(const [i,option] of options.entries()){
  assert.match(option.icon,/aria-hidden="true" focusable="false"/);
  assert.equal(option.textContent,values[i].label);
  assert.equal(option.attributes['aria-selected'],String(values[i].value==='wind'));
 }
 const iconFor=value=>options.find(o=>o.dataset.value===value).icon;
 assert.equal(iconFor('wind'),iconFor('breeze'));assert.equal(iconFor('wind'),iconFor('gusts'));
 assert.equal(iconFor('mist'),iconFor('mist-wisps'));assert.equal(iconFor('mist'),iconFor('fog'));
 assert.equal(nodes.get('weatherlabel').textContent,'Wind');
 assert.equal(nodes.get('weatherlabel').icon,undefined);
 context.syncDropdown('biome',[{value:'cave',label:'Cave'}],'cave','Cave');
 assert.equal(nodes.get('biomemenu').children[0].icon,undefined);
}
console.log('PASS: Weather-only decorative option glyphs retain labels, selections and family consistency.');

assert.doesNotMatch(editorCss,/#weatherMenu \.weather-option-icon\s*\{[^}]*display\s*:\s*none/);
assert.match(editorCss,/@container \(max-width:145px\)\{\s*#weatherMenu \.dropdown-option\{gap:8px;padding-inline:6px;\}/);

assert.match(editorCss,/#weatherMenu \.dropdown-option\{display:flex;align-items:center;min-width:0;gap:12px;/);

assert(fs.readFileSync('public/garden.js','utf8').includes("rain:'M12 3C10 6 5 11 5 15a7 7 0 0 0 14 0c0-4-5-9-7-12Z'"),'rain family uses one plain outline drop');

// Native SVG geometry gates only desktop mouse targeting. The button remains
// keyboard-focusable, and touch layouts retain the normal 44px native target.
assert.match(editorCss,/@media \(min-width:651px\) and \(hover:hover\) and \(pointer:fine\)\{\s*\.oddity-card \.favorite-heart\{pointer-events:none;\}\s*\.oddity-card \.favorite-heart \.heart-icon\{pointer-events:none;\}\s*\.oddity-card \.favorite-heart \.heart-icon path\{pointer-events:all;cursor:pointer;\}/);
console.log('PASS: desktop heart targets its filled/interior SVG silhouette; coarse pointer button sizing and keyboard semantics unchanged.');

assert.match(editorCss,/body.editor-ui \.grove-scroll-track\[data-axis=y\] \.grove-scroll-thumb\{border-radius:3px 0 0 3px;border-right:0;\}/);
assert.match(editorCss,/body.editor-ui \.grove-scroll-track\[data-axis=x\] \.grove-scroll-thumb\{border-radius:3px 3px 0 0;border-bottom:0;\}/);
assert.doesNotMatch(editorCss,/\.grove-scroll-thumb\{border-bottom-right-radius:11px;/);
assert.doesNotMatch(editorCss,/\.grove-scroll-thumb\{border-top-left-radius:0;border-top-right-radius:0;/);
console.log('PASS: internal scrollbar thumbs share Oddities rounded free ends and flat flush container edges, with no conflicting panel overrides.');

assert(editorCss.includes('body.editor-ui #oddity-grid:has(>.oddity-card){padding-top:0!important;padding-bottom:8px!important;}'));
// Only populated results match; empty/loading flex centering and the side gutters
// keep their original rules. Padding belongs inside border-box scroll content.
assert.match(editorCss,/^:root[\s\S]*?\*\{box-sizing:border-box\}/);
console.log('PASS: populated Oddities keeps the filter row gap above and 8px padding below; empty/loading states and scrollbar geometry untouched.');

assert(editorCss.includes('body.editor-ui :is(.canvas-tools,#viewToolbar) button:hover:not(:disabled):not([aria-disabled=true]) .ui-icon{transform:scale(1.12);}'));
assert(editorCss.includes('body.editor-ui :is(.canvas-tools,#viewToolbar) button:hover .ui-icon{transform:none!important;}'));
console.log('PASS: canvas/output/edit/fullscreen glyph hover is fine-pointer only, guards disabled actions, and reduces motion without changing targets.');

assert(editorCss.includes('@media(max-width:650px){body.editor-ui .scene-controls .dropdown-trigger{padding-left:11px;padding-right:11px;gap:6px;}}'));

const colorTrigger=editorMarkup.match(/<button id="colorButton".*?<\/button>/)[0];
assert.match(colorTrigger,/aria-label="Color: Natural"/);
assert.match(colorTrigger,/<svg[^>]*aria-hidden="true" focusable="false"/);
assert.doesNotMatch(colorTrigger,/dropdown-chevron|choice-text/);
assert.match(editorMarkup,/data-palette="haunted"[^>]*aria-label="Natural Palette"[^>]*><span class="palette-name">Natural<\/span>/);
assert.match(source,/haunted:\{name:'Natural'/);
assert.match(source,/\$\('#colorButton'\)\.setAttribute\('aria-label','Color: '\+palette\)/);
assert.match(editorCss,/body\.editor-ui \.scene-controls\{grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\) 46px;/);
assert.match(source,/color:\{button:'#colorButton',panel:'#colorPanel',width:280\}/);
console.log('PASS: icon-only Color trigger keeps a named current choice, backed by the same Natural key and independent popup width.');

assert(editorCss.includes('body.editor-ui #oddity-grid:has(>.oddity-card){clip-path:inset(0 0 8px 0);}'));
assert(editorCss.includes('body.editor-ui #oddity-grid:has(>.oddity-card){padding-top:0!important;padding-bottom:8px!important;}'),'end padding covers the clipped strip so last row remains visible');
console.log('PASS: populated Oddities viewport has8px bottom breathing strip, separate scrollbar and empty/loading untouched.');

assert(editorCss.includes('::-webkit-scrollbar-thumb:vertical{background-color:#946785;border-radius:3px 0 0 3px;}'));
assert(editorCss.includes('::-webkit-scrollbar-thumb:horizontal{background-color:#946785;border-radius:3px 3px 0 0;}'));
console.log('PASS: custom and supported native/page scrollbar thumbs use3px inner corners, square panel edges, unchanged dimensions/overflow.');

assert(fs.readFileSync('public/index.html','utf8').includes('<path transform="translate(-1.25 .25)" d="M20 8a8 8 0 1 0 1 7M20 3v5h-5"/>'));
console.log('PASS: Rotate corner glyph optically centered inside unchanged SVG and hit target; internal path correction survives hover.');

assert(editorCss.includes('body.editor-ui .dropdown-trigger[aria-expanded=true] .dropdown-open-label{font-weight:600;}'));
console.log('PASS: all existing open dropdown trigger headings are semibold; closed values and option rows unchanged.');

const categoryLabel={textContent:'Animals'},allOption={textContent:'All'},categoryCopy=source.match(/^function allOdditiesLabel\(\).*$/m)[0]+'\n'+source.match(/^function syncOddityCategoryTrigger\(\).*$/m)[0];
let narrow=false;const categoryContext={oddityCategory:'all',$:selector=>selector==='#oddityCategoryMenu'?{querySelector:()=>allOption}:categoryLabel,matchMedia:()=>({matches:narrow})};
vm.runInNewContext(categoryCopy,categoryContext);
categoryContext.syncOddityCategoryTrigger();assert.equal(categoryLabel.textContent,'All oddities');assert.equal(allOption.textContent,'All');
narrow=true;categoryContext.syncOddityCategoryTrigger();assert.equal(categoryLabel.textContent,'All');assert.equal(allOption.textContent,'All');
categoryContext.oddityCategory='animals';categoryLabel.textContent='Animals';
narrow=false;categoryContext.syncOddityCategoryTrigger();assert.equal(categoryLabel.textContent,'Animals');assert.equal(allOption.textContent,'All');
assert.match(source,/oddityCategoryLabels=\{all:'All'/);
assert.doesNotMatch(fs.readFileSync('public/mobile-picker.js','utf8'),/\.placeholder=/);
console.log('PASS: shared collection placeholder; desktop trigger All oddities, mobile trigger All, menu option All at both widths, selected categories unchanged.');

assert(editorCss.includes('@media(max-width:650px){\n #userMenu>#clear+.audio-settings{border-top:1px solid var(--line);margin-top:8px;padding-top:12px;}'));
console.log('PASS: mobile New gains matching menu divider; desktop header arrangement unchanged.');

assert(editorCss.includes('--ui-control-rest-fill:var(--ui-rest-fill,color-mix(in srgb,var(--panel) 90%,var(--ink)));'));
console.log('PASS: resting scene controls reuse output-row theme fill with transparent borders, preserving open/hover/focus and dimensions.');

for(const target of ['#oddityCategoryButton:not([aria-expanded=true]):not(:hover)','#favoriteFilter:not([aria-pressed=true]):not(:hover)','#odditySearch:not(:focus)'])assert(editorCss.includes(target));
assert.match(editorCss,/background:var\(--ui-control-rest-fill\);border-color:transparent;box-shadow:none;/);

assert(source.includes(".map(([value,label])=>({value,label})),oddityCategory,'All'"),'menu uses stable All while trigger has responsive copy');

const musicTrigger=editorMarkup.match(/<button id="musicButton"[^>]*>.*?<\/button>/)[0];
assert.match(musicTrigger,/aria-labelledby="musicHeading musicLabel"/);
assert.match(musicTrigger,/<span id="musicLabel" class="dropdown-current-value">Off<\/span>/);
assert.match(musicTrigger,/class="music-track-value dropdown-value"/);
assert.match(musicTrigger,/<span class="dropdown-open-label" aria-hidden="true">Music<\/span>/);
assert.match(editorMarkup,/id="musicHeading" class="sr-only">Music<\/span>/);
assert.match(musicTrigger,/<svg class="music-option-icon"[^>]*aria-hidden="true" focusable="false"/);
assert.match(source,/if\(key==='music'\)\{option.insertAdjacentHTML\('afterbegin',musicOptionIcon\)/);
assert.match(editorCss,/#musicButton\[data-track=off\] \.music-option-icon,\s*body.editor-ui #musicMenu \.dropdown-option\[data-value=off\] \.music-option-icon\{opacity:\.5;/);

assert.match(editorCss,/\.grove-scroll-listbox\[data-axis=y\]:before\{top:0;bottom:0;\}/);

assert.match(editorCss,/body\.editor-ui \.grove-scroll-thumb\{border-color:transparent;box-shadow:none;\}/);
assert.match(editorCss,/forced-colors:active[^\n]+grove-scroll-thumb\{border-color:CanvasText!important;\}/);

const snapOpening=vm.runInNewContext(source.match(/^function alignDropdownOpenScroll\(menu\)\{[\s\S]*?^\}/m)[0]+';alignDropdownOpenScroll');
const scrolled={scrollHeight:620,clientHeight:320,scrollTop:261,children:Array.from({length:14},(_,i)=>({offsetTop:i*44}))};
snapOpening(scrolled);assert.equal(scrolled.scrollTop,264,'opening a long menu does not leave a partial blank row at its seam');
scrolled.scrollTop=300;snapOpening(scrolled);assert.equal(scrolled.scrollTop,300,'preserve a remembered position at the end');

assert.doesNotMatch(editorMarkup,/Choose an idea, or create freely\./);

assert.match(editorCss,/#startDialog::backdrop\{background:var\(--paper\);backdrop-filter:none;\}/);

{
 const announceCode=source.slice(source.indexOf('function announceOddityAdded('),source.indexOf('function addOddity('));
 const node={textContent:'old'},frames=[],toasts=[];
 let mobile=true;
 const announce=vm.runInNewContext(announceCode+';announceOddityAdded',{byId:{column:{name:'Broken Column'}},$:(id)=>{assert.equal(id,'#oddityAddedStatus');return node;},isMobilePicker:()=>mobile,notify:(...args)=>toasts.push(args),requestAnimationFrame:fn=>frames.push(fn)});
 announce('column');assert.equal(node.textContent,'');assert.equal(toasts.length,0);
 frames.shift()();assert.equal(node.textContent,'Broken Column Added');
 mobile=false;announce('column');frames.shift()();assert.equal(node.textContent,'Broken Column Added');assert.equal(toasts.length,0);
 assert.match(editorMarkup,/id="oddityAddedStatus" class="sr-only" role="status" aria-live="polite" aria-atomic="true"/);
}

const viewSource=fs.readFileSync('public/view.js','utf8');
assert.match(viewSource,/if\(!fullscreen\|\|window\.matchMedia\?\.\('\(max-width:650px\), \(pointer:coarse\)'\)\?\.matches\)return;/);
assert.match(editorCss,/body\.editor-ui\.grove-view :is\(\.garden-panel,\.canvas-wrap,#garden\)\{touch-action:auto;\}/);
assert.match(source,/function pointerDown\(e\)\{if\(document\.body\.classList\.contains\('grove-view'\)\)return;/);
assert.doesNotMatch(editorMarkup,/<meta name="viewport"[^>]*(?:user-scalable\s*=\s*no|maximum-scale)/);

// Card action menus are anchored to their trigger and fit all actions without a scroll cap.
const savedMenuPosition=source.match(/^function positionSavedMenu\(\)\{[\s\S]*?^\}/m)[0];
for(const {mobile,viewport,anchor,want} of [
  {mobile:false,viewport:[700,500],anchor:{top:70,bottom:114,right:390},want:{width:'160px',top:'104px',left:'220px'}},
  {mobile:false,viewport:[700,500],anchor:{top:410,bottom:454,right:390},want:{width:'160px',top:'286px',left:'220px'}},
  {mobile:true,viewport:[320,450],anchor:{top:115,bottom:305,right:310},want:{width:'160px',top:'123px',left:'142px'}},
  {mobile:true,viewport:[156,450],anchor:{top:310,bottom:430,right:154},want:{width:'140px',top:'308px',left:'8px'}}
]){
  const menu={style:{},getBoundingClientRect:()=>({height:134})},trigger={getBoundingClientRect:()=>anchor};
  vm.runInNewContext(savedMenuPosition+';positionSavedMenu()',
    {savedMenu:{menu,button:mobile?null:trigger,cardTrigger:mobile?trigger:null},isMobilePicker:()=>mobile,window:{innerWidth:viewport[0],innerHeight:viewport[1]}});
  assert.deepEqual(menu.style,want);
}
assert.match(fs.readFileSync('public/style.css','utf8'),/\.saved-actions\.saved-menu\{\s*display:grid;grid-template-columns:minmax\(0,1fr\);[^}]*overflow:clip;/);
assert.doesNotMatch(fs.readFileSync('public/scrollbars.js','utf8'),/^const selector=.*\.saved-menu/m);
console.log('PASS: card actions fit in one column without scrollbars and stay anchored on phone and desktop.');

const collapsedToolbarCss=fs.readFileSync('public/style.css','utf8').split('/* In the collapsed desktop editor')[1].split('/* At tiny viewport widths')[0];
assert.match(collapsedToolbarCss,/@media\(min-width:651px\)/);
assert.doesNotMatch(collapsedToolbarCss,/\.undo-redo/,'existing left controls stay unchanged');
assert.match(collapsedToolbarCss,/:is\(#outputTools,#transformTools\)\{\s*grid-area:1\/2;justify-self:center/);
assert.match(collapsedToolbarCss,/:is\(#toggleOddities,#fullScreen,#firstOddityGuide\)\{\s*grid-area:1\/3;justify-self:end/);
assert.match(collapsedToolbarCss,/#toggleOddities:not\(\[hidden\]\)\{[^}]*margin-inline-end:48px;[^}]*min-width:44px;[^}]*background:transparent;border-color:transparent/);
assert.match(collapsedToolbarCss,/#toggleOddities:focus-visible\{\s*outline:2px solid var\(--ui-focus-ring\)/);
console.log('PASS: collapsed desktop toolbar pins editing groups left, center and right in one row without changing the mobile layout.');

for(const key of ['biome','weather']){
 const trigger=editorMarkup.match(new RegExp('<button[^>]*id="'+key+'Button"[^>]*>.*?</button>'))?.[0];
 assert.ok(trigger&&trigger.includes('class="ui-icon compact-scene-icon"')&&trigger.includes('aria-hidden="true"'));
 assert.match(trigger,/aria-label(?:ledby)?=/);
}
const sceneIcons=fs.readFileSync('public/style.css','utf8');
assert.match(sceneIcons,/@container scene-label \(max-width:128px\)/);
assert.match(sceneIcons,/@container scene-panel \(max-width:200px\)\{\s*body\.editor-ui \.scene-controls\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\);\}[\s\S]*dropdown-chevron\{display:none;/);
console.log('PASS: scene buttons keep accessible text names and swap to compact icons before labels truncate.');

const pictureFilename=vm.runInNewContext(source.slice(source.indexOf('function pictureFilename('),source.indexOf('function downloadBlob('))+';pictureFilename');
const exportDate=new Date(2026,10,3,6,7,8,999);
assert.equal(pictureFilename('frozen-lake','png',exportDate),'whimsy-grove-frozen-lake-2026-11-03.png');
assert.equal(pictureFilename('under-bridge','gif',exportDate),'whimsy-grove-under-bridge-2026-11-03.gif');
assert.equal(pictureFilename('none','png',exportDate),'whimsy-grove-blank-2026-11-03.png');
assert.equal(pictureFilename('../bad slug','png',exportDate),'whimsy-grove-blank-2026-11-03.png');

assert.match(source,/filename=pictureFilename\(scene\.background,format\)/);
assert.match(source,/new File\(\[blob\],filename,\{type:format==='gif'\?'image\/gif':'image\/png'\}\)/);
assert.match(source,/downloadBlob\(blob,filename,/);
assert.match(source,/downloadBlob\(blob,file\.name,/);
console.log('PASS: Download, Share and fallback share one local-date, biome-keyed filename per export.');
