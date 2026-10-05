'use strict';
(() => {
const W=1200,H=1080,LOOP=3000,TAU=Math.PI*2;
const styles={none:'none',void:'none',haze:'pollen',forest:'leaves',jungle:'leaves','backyard-garden':'leaves',greenhouse:'leaves','gnome-hollow':'leaves','pumpkin-patch':'leaves','corn-maze':'leaves',ruins:'leaves',swamp:'swamp','under-bridge':'dust',river:'water',beach:'water','tide-pools':'water','frozen-lake':'snow',underwater:'bubbles',space:'stars',rooftop:'stars',heaven:'mist',hell:'embers',volcano:'embers','ember-river':'embers',steampunk:'steam',wonderland:'pollen',attic:'dust',basement:'dust','haunted-house':'dust','abandoned-prison':'dust',factory:'dust',cave:'dust','crystal-cavern':'crystal',desert:'sand','sandy-dunes':'sand',graveyard:'mist'};
function random(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function phase(time){return ((time%LOOP)+LOOP)%LOOP/LOOP;}
function band(ctx,y,alpha,color='255,255,255'){const g=ctx.createLinearGradient(0,y-110,0,y+110);g.addColorStop(0,`rgba(${color},0)`);g.addColorStop(.5,`rgba(${color},${alpha})`);g.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=g;ctx.fillRect(0,y-110,W,220);}
function draw(ctx,scene,time,palette,drawSprite){const r=random((scene.seed||8921)+741+[...scene.background].reduce((sum,c)=>sum+c.charCodeAt(0)*17,0)),t=phase(time),style=styles[scene.background]||'none',weather=scene.weather||[],mono=scene.palette==='monochrome';ctx.save();
// Advance the legacy seeded stream so selected weather keeps its original paths.
const consumed={leaves:28,pollen:60,dust:60,sand:60,stars:88,crystal:81,swamp:48,embers:60,bubbles:40,water:21,snow:weather.includes('snow')?0:56}[style]||0;for(let i=0;i<consumed;i++)r();ctx.globalAlpha=1;
if(weather.includes('rain')){ctx.lineCap='round';const drops=Array.from({length:290},()=>({x:r()*W,y:(r()*H+t*H)%H,length:26+r()*25}));for(const pass of [{color:palette.ink,width:5,alpha:.38},{color:mono?'#f5f5f5':'#f1f8ff',width:2.8,alpha:.86}]){ctx.strokeStyle=pass.color;ctx.lineWidth=pass.width;ctx.globalAlpha=pass.alpha;ctx.beginPath();for(const {x,y,length}of drops){ctx.moveTo(x,y);ctx.lineTo(x,y+length);}ctx.stroke();}}
if(weather.includes('snow')){for(let i=0;i<230;i++){const x=r()*W,y=r()*H,q=(t+r())%1,radius=3+r()*5.5;ctx.beginPath();ctx.arc(x+Math.sin(q*TAU)*12,y+(q-.5)*130,radius,0,TAU);ctx.globalAlpha=.45*Math.sin(q*Math.PI);ctx.strokeStyle=palette.ink;ctx.lineWidth=1.7;ctx.stroke();ctx.globalAlpha=.92*Math.sin(q*Math.PI);ctx.fillStyle=mono?'#fff':'#fffefa';ctx.fill();}}
if(weather.includes('fog')){ctx.globalAlpha=1;for(let i=0;i<3;i++)band(ctx,H*(.42+i*.22)+Math.sin((t+i*.24)*TAU)*40,.46+.1*Math.sin((t+i*.31)*TAU));}
ctx.restore();}
window.GroveMotion={styles,loop:LOOP,draw,hasMotion:scene=>!!window.GroveEnvironment?.hasMotion(scene)||scene.weather?.some(x=>['rain','snow','fog'].includes(x))};
})();
