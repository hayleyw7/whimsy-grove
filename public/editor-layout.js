const workspace=document.querySelector('.workspace');
const panel=document.querySelector('.garden-panel');
const fit=matchMedia('(min-width:651px) and (min-height:561px)');
const number=value=>parseFloat(value)||0;
let queued=false;
function sync(){
 queued=false;
 if(!workspace||!panel)return;
 if(!fit.matches||document.body.classList.contains('grove-view')){delete workspace.dataset.canvasFit;workspace.style.removeProperty('--canvas-column-width');workspace.style.removeProperty('--editor-height');return;}
 const style=getComputedStyle(panel),grid=getComputedStyle(workspace);
 const borderX=number(style.borderLeftWidth)+number(style.borderRightWidth);
 let used=number(style.borderTopWidth)+number(style.borderBottomWidth)+number(style.paddingTop)+number(style.paddingBottom);
 for(const selector of ['.scene-controls','.canvas-tools']){
  const element=panel.querySelector(selector);if(!element)continue;
  const s=getComputedStyle(element);if(s.display==='none'||s.position==='absolute')continue;
  used+=element.getBoundingClientRect().height+number(s.marginTop)+number(s.marginBottom);
 }
 const sidebarMin=innerWidth<=800?260:304;
 const available=Math.max(0,workspace.clientWidth-number(grid.columnGap)-sidebarMin);
 const naturalHeight=Math.max(0,available-borderX)*9/10+used;
 workspace.style.setProperty('--editor-height',naturalHeight+'px');
 const heightCap=Math.max(0,workspace.clientHeight-used)*10/9+borderX;
 const width=Math.max(0,Math.min(available,heightCap));
 const value=(Math.round(width*100)/100)+'px';
 if(workspace.style.getPropertyValue('--canvas-column-width')!==value)workspace.style.setProperty('--canvas-column-width',value);
 workspace.dataset.canvasFit='';
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(sync);}}
const observer=new ResizeObserver(schedule);
for(const element of [workspace,...panel.querySelectorAll('.scene-controls,.canvas-tools')])if(element)observer.observe(element);
new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
fit.addEventListener('change',schedule);addEventListener('resize',schedule);schedule();
