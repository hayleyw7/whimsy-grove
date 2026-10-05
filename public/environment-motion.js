'use strict';
(() => {
const W=1200,H=1080,TAU=Math.PI*2,cache=new WeakMap(),masks=new WeakMap();
// Regions refer to the final cover-cropped illustration, not the source image.
// Only existing scenery is sampled. Placed items are composited after this pass.
const regions={
 none:[],void:[],space:[{kind:'sky',box:[.04,.01,.98,.99],travel:12,period:96000}],attic:[{kind:'sky',polygon:[[.1793,.07395],[.19062,.07815],[.17474,.10588],[.159606,.10084]],travel:10,feather:3}],greenhouse:[{kind:'sky',box:[.479,.185,.489,.205],travel:10,feather:3}],basement:[],cave:[],'abandoned-prison':[],'haunted-house':[],
 'backyard-garden':[{kind:'sky',box:[.27,.01,.78,.44],travel:28}],
 'corn-maze':[{kind:'sky',box:[.31,.01,.78,.12],travel:20}],
 desert:[{kind:'sky',box:[.10,.01,.90,.43]}],
 forest:[{kind:'sky',box:[.46,.17,.61,.27],travel:20}],
 graveyard:[{kind:'sky',box:[.35,.01,.84,.23],travel:20}],
 jungle:[{kind:'sky',box:[.31,.02,.65,.44],travel:38}],
 'pumpkin-patch':[{kind:'sky',box:[.17,.01,.87,.43]}],
 'sandy-dunes':[{kind:'sky',box:[.03,.01,.97,.48]}],
 steampunk:[{kind:'sky',box:[.31,.01,.61,.16],travel:25}],
 wonderland:[{kind:'sky',box:[.22,.01,.80,.18],travel:34}],
 'gnome-hollow':[{kind:'sky',box:[.40,.03,.72,.24],travel:28}],
 'frozen-lake':[{kind:'sky',box:[.04,.01,.96,.34]}],
 rooftop:[{kind:'sky',box:[.10,.01,.88,.21],travel:46}],
 ruins:[{kind:'sky',box:[.30,.01,.82,.28],travel:46}],
 haze:[{kind:'sky',box:[.02,.01,.98,.62],travel:44,maxTravel:44}],
 river:[{kind:'sky',box:[.15,.01,.93,.36]}],
 beach:[{kind:'sky',box:[.20,.01,.81,.39]}],
 'tide-pools':[{kind:'sky',box:[.20,.01,.96,.40]}],
 volcano:[{kind:'sky',box:[.16,.01,.66,.42],travel:38}],
 heaven:[{kind:'sky',box:[.35,.01,.75,.60],travel:25}],
 swamp:[{kind:'sky',box:[.42,.01,.66,.17],travel:20},{kind:'water',polygon:[[.22,.47],[.74,.47],[.83,.54],[.80,.68],[.62,.75],[.39,.73],[.21,.64]],amplitude:1.5,feather:8}], 'under-bridge':[{kind:'sky',box:[.45,.295,.58,.325],travel:16,feather:4},{kind:'water',box:[.28,.475,.71,.525],amplitude:1}], 'crystal-cavern':[{kind:'water',box:[.54,.415,.64,.437],amplitude:.8},{kind:'water',box:[.20,.470,.275,.500],amplitude:.8}], 'ember-river':[],hell:[],factory:[],underwater:[]
};
regions.river.push({kind:'water',polygon:[[.27,.663],[.45,.651],[.59,.657],[.66,.682],[.80,.712],[.98,.718],[.98,.742],[.82,.731],[.67,.707],[.54,.681],[.36,.678]],amplitude:1.4,feather:4});
regions.beach.push({kind:'water',box:[.28,.510,.77,.590],amplitude:2});
regions['tide-pools'].push({kind:'water',box:[.47,.463,.83,.478],amplitude:.7},{kind:'water',box:[.39,.607,.69,.630],amplitude:.8},{kind:'water',box:[.13,.847,.26,.875],amplitude:1});
regions['ember-river'].push({kind:'sky',box:[.28,.01,.69,.12],travel:28},{kind:'lava',box:[.42,.680,.72,.702],amplitude:1},{kind:'lava',box:[.63,.536,.81,.554],amplitude:.8},{kind:'fall',box:[.203,.520,.230,.565],amplitude:.7},{kind:'fall',box:[.873,.360,.891,.443],amplitude:.7});
regions.hell.push({kind:'sky',box:[.33,.01,.64,.21],travel:20},{kind:'fall',box:[.078,.413,.098,.497],amplitude:.6},{kind:'fall',box:[.846,.560,.870,.611],amplitude:.7},{kind:'fall',box:[.938,.403,.951,.476],amplitude:.6});
regions.factory.push({kind:'steam',box:[.320,.150,.350,.210],travel:8},{kind:'steam',box:[.685,.225,.715,.290],travel:8});
regions.underwater.push({kind:'light',box:[.04,.01,.96,.145],amplitude:1.8},{kind:'light',box:[.45,.20,.55,.62],amplitude:1});
regions.volcano.push({kind:'steam',box:[.76,.05,.97,.33],travel:10});
const smooth=value=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};
function canvas(width,height){const value=document.createElement('canvas');value.width=width;value.height=height;return value;}
function maskFor(region){if(masks.has(region))return masks.get(region);const points=region.polygon,box=region.box||[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))], [l,t,r,b]=box,x=Math.floor(l*W),y=Math.floor(t*H),width=Math.ceil((r-l)*W),height=Math.ceil((b-t)*H),mask=canvas(width,height),m=mask.getContext('2d'),feather=region.feather||Math.max(3,Math.min(32,width*.1,height*.2));
if(points){const polygon=points.map(p=>[p[0]*W-x,p[1]*H-y]),pixels=m.createImageData(width,height);for(let py=0;py<height;py++)for(let px=0;px<width;px++){const cx=px+.5,cy=py+.5;let inside=false,distance=Infinity;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [ax,ay]=polygon[j],[bx,by]=polygon[i];if((ay>cy)!==(by>cy)&&cx<(bx-ax)*(cy-ay)/(by-ay)+ax)inside=!inside;const dx=bx-ax,dy=by-ay,q=Math.max(0,Math.min(1,((cx-ax)*dx+(cy-ay)*dy)/(dx*dx+dy*dy||1)));distance=Math.min(distance,Math.hypot(cx-ax-q*dx,cy-ay-q*dy));}if(inside){const at=(py*width+px)*4;pixels.data[at]=pixels.data[at+1]=pixels.data[at+2]=255;pixels.data[at+3]=Math.round(smooth(distance/feather)*255);}}m.putImageData(pixels,0,0);}else{m.fillStyle='#fff';m.fillRect(0,0,width,height);m.globalCompositeOperation='destination-in';let g=m.createLinearGradient(0,0,width,0);g.addColorStop(0,'transparent');g.addColorStop(feather/width,'#fff');g.addColorStop(1-feather/width,'#fff');g.addColorStop(1,'transparent');m.fillStyle=g;m.fillRect(0,0,width,height);g=m.createLinearGradient(0,0,0,height);g.addColorStop(0,'transparent');g.addColorStop(feather/height,'#fff');g.addColorStop(1-feather/height,'#fff');g.addColorStop(1,'transparent');m.fillStyle=g;m.fillRect(0,0,width,height);}const data={x,y,width,height,mask};masks.set(region,data);return data;}
function prepare(source,scene){let data=cache.get(source);if(data)return data;data={patches:(regions[scene.background]||[]).map((region,index)=>{const shape=maskFor(region);return{...region,...shape,index,work:canvas(shape.width,shape.height)};})};cache.set(source,data);return data;}
function paintPatch(ctx,source,patch,time,opacity=1){const {x,y,width,height,work,mask,kind,index}=patch,g=work.getContext('2d');g.clearRect(0,0,width,height);g.save();if(kind==='sky'||kind==='steam'){const period=patch.period||48000+index*13000,phase=((time%period)+period)%period/period,travel=kind==='sky'?Math.min(patch.travel||25,patch.maxTravel||25):patch.travel||10,offset=phase*travel,fade=1-smooth((phase-.86)/.14);g.drawImage(source,-x+(kind==='sky'?offset:0),-y-(kind==='steam'?offset:0));g.globalAlpha=1;g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0);g.restore();ctx.save();ctx.globalAlpha=opacity*fade;ctx.drawImage(work,x,y);ctx.restore();return;}
const amplitude=patch.amplitude||2.2,speed=kind==='lava'||kind==='fall'?9000:kind==='light'?11000:6000,phase=time/speed*TAU;for(let sy=0;sy<height;sy+=6){const sh=Math.min(6,height-sy),row=y+sy,dx=kind==='fall'?0:Math.sin(row/45-phase)*amplitude+Math.sin(row/93-phase*.5)*amplitude*.45,dy=kind==='fall'?Math.sin(row/24-phase)*amplitude:kind==='lava'?Math.sin(row/77-phase)*1.2:0;g.drawImage(source,x-dx,row-dy,width,sh,0,sy,width,sh);}g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0);g.restore();ctx.save();ctx.globalAlpha=opacity;ctx.drawImage(work,x,y);ctx.restore();}
function draw(ctx,scene,time,source,shortLoop=false){const {patches}=prepare(source,scene);if(!patches.length)return;const loopTime=((time%3000)+3000)%3000,blend=shortLoop?smooth((loopTime-2000)/1000):0;for(const patch of patches){paintPatch(ctx,source,patch,shortLoop?loopTime:time,1-blend);if(blend)paintPatch(ctx,source,patch,0,blend);}}
window.GroveEnvironment={regions,draw,hasMotion:scene=>!!regions[scene.background]?.length};
})();
