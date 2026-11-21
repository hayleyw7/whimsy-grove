const workspace=document.querySelector('.workspace');
const panel=document.querySelector('.garden-panel');
const phone=matchMedia('(max-width:650px)');
const shortWindow=matchMedia('(max-height:400px)');
const number=value=>parseFloat(value)||0;
const ratio=10/9;
const compactToolbarWidth=400,oneRowToolbarHeight=61,twoRowToolbarHeight=100;
function setToolbarRows(compact){panel.toggleAttribute('data-compact-toolbar',compact);}
let queued=false;

function canvasLayout({width,height,chrome,border,gap,sidebarMin,minimumCanvasHeight=320}){
 // The canvas receives only the vertical space left after fixed editor chrome.
 // Very short windows use the normal scrolling layout below the fit breakpoint.
 const usableHeight=Math.max(0,height-chrome);
 const panelWidth=Math.min(width,usableHeight*ratio+border);
 const panelHeight=(panelWidth-border)/ratio+chrome;
 return {panelWidth,panelHeight,sidebar:width-panelWidth-gap>=sidebarMin};
}
function setPickerMode(modal){
 if(document.body.hasAttribute('data-oddities-modal')===modal)return;
 document.body.toggleAttribute('data-oddities-modal',modal);
 document.dispatchEvent(new Event('grove-picker-layout'));
}
function sync(){
 queued=false;
 if(!workspace||!panel||document.body.classList.contains('grove-view'))return;
 // Let very short viewports use the normal document flow. The matching CSS
 // breakpoint restores page scrolling so the controls and catalogue can
 // keep their natural height instead of being squeezed into the canvas fit.
 if(shortWindow.matches){
  delete workspace.dataset.canvasFit;
  workspace.style.removeProperty('--editor-height');
  workspace.parentElement.style.removeProperty('--canvas-column-width');
  setToolbarRows(!phone.matches&&panel.clientWidth<compactToolbarWidth);
  setPickerMode(phone.matches);
  return;
 }
 const style=getComputedStyle(panel),grid=getComputedStyle(workspace);
 const border=number(style.borderLeftWidth)+number(style.borderRightWidth);
 let chrome=number(style.borderTopWidth)+number(style.borderBottomWidth)+number(style.paddingTop)+number(style.paddingBottom)+2*number(style.rowGap);
 for(const element of panel.querySelectorAll('.scene-controls,.canvas-tools')){
  const s=getComputedStyle(element);
  if(s.display==='none'||s.position==='absolute')continue;
  chrome+=element.getBoundingClientRect().height+number(s.marginTop)+number(s.marginBottom);
 }
 const main=workspace.parentElement;
 const availableHeight=()=>document.documentElement.clientHeight-(workspace.getBoundingClientRect().top+window.scrollY)-number(getComputedStyle(main).paddingBottom);
 const prompt=document.getElementById('promptReminder');
 const promptBeforeWorkspace=prompt&&!prompt.hidden&&prompt.nextElementSibling===workspace&&prompt.parentElement===main;
 const promptStyle=promptBeforeWorkspace&&getComputedStyle(prompt);
 const promptSpace=promptStyle?prompt.getBoundingClientRect().height+number(promptStyle.marginTop)+number(promptStyle.marginBottom):0;
 const fixedChrome=chrome-(!phone.matches&&panel.hasAttribute('data-compact-toolbar')?twoRowToolbarHeight-oneRowToolbarHeight:0);
 const fit=height=>{
  const args={width:workspace.clientWidth,height,chrome:fixedChrome,border,gap:number(grid.columnGap),sidebarMin:304};
  const singleRow=canvasLayout(args),compact=!phone.matches&&singleRow.panelWidth<compactToolbarWidth;
  return {...(compact?canvasLayout({...args,chrome:fixedChrome+twoRowToolbarHeight-oneRowToolbarHeight}):singleRow),compact};
 };
 // The prompt only takes canvas space in single-column mode. Test the
 // two-column fit without it so moving it cannot flip the mode again.
 const roomWithoutPrompt=fit(availableHeight()+promptSpace);
 setPickerMode(phone.matches||!roomWithoutPrompt.sidebar);
 const layout=fit(availableHeight());
 setToolbarRows(layout.compact);
 main.style.setProperty('--canvas-column-width',layout.panelWidth+'px');
 workspace.style.setProperty('--editor-height',Math.ceil(layout.panelHeight)+'px');
 workspace.dataset.canvasFit='';
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(sync);}}
const observer=new ResizeObserver(schedule);
for(const element of [workspace,document.getElementById('promptReminder'),...panel.querySelectorAll('.scene-controls,.canvas-tools')])if(element)observer.observe(element);
new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
phone.addEventListener('change',schedule);shortWindow.addEventListener('change',schedule);addEventListener('resize',schedule);schedule();
