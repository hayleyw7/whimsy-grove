'use strict';
(() => {
const W=1200,H=1080,LOOP=3000,TAU=Math.PI*2;
const styles={none:'none',void:'none',haze:'pollen',forest:'leaves',jungle:'leaves','backyard-garden':'leaves',greenhouse:'leaves','gnome-hollow':'leaves','pumpkin-patch':'leaves','corn-maze':'leaves',ruins:'leaves',swamp:'swamp','under-bridge':'dust',river:'water',beach:'water','tide-pools':'water','frozen-lake':'snow',underwater:'bubbles',space:'stars',rooftop:'stars',heaven:'mist',hell:'embers',volcano:'embers','ember-river':'embers',steampunk:'steam',wonderland:'pollen',attic:'dust',basement:'dust','haunted-house':'dust','abandoned-prison':'dust',factory:'dust',cave:'dust','crystal-cavern':'crystal',desert:'sand','sandy-dunes':'sand',graveyard:'mist'};
function random(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function phase(time){return ((time%LOOP)+LOOP)%LOOP/LOOP;}
function band(ctx,y,alpha,color='255,255,255'){const g=ctx.createLinearGradient(0,y-110,0,y+110);g.addColorStop(0,`rgba(${color},0)`);g.addColorStop(.5,`rgba(${color},${alpha})`);g.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=g;ctx.fillRect(0,y-110,W,220);}
function draw(ctx,scene,time,palette,drawSprite,shortLoop=false){const r=random((scene.seed||8921)+741+[...scene.background].reduce((sum,c)=>sum+c.charCodeAt(0)*17,0)),t=phase(time),style=styles[scene.background]||'none',weather=scene.weather||[],mono=scene.palette==='monochrome';ctx.save();
// Advance the legacy seeded stream so selected weather keeps its original paths.
const consumed={leaves:28,pollen:60,dust:60,sand:60,stars:88,crystal:81,swamp:48,embers:60,bubbles:40,water:21,snow:weather.includes('snow')?0:56}[style]||0;for(let i=0;i<consumed;i++)r();ctx.globalAlpha=1;
if(weather.includes('thunderstorm')){const shade=ctx.createLinearGradient(0,0,0,H*.55),shadeTint=mono?'58,58,58':'57,48,78';shade.addColorStop(0,`rgba(${shadeTint},.18)`);shade.addColorStop(1,`rgba(${shadeTint},0)`);ctx.fillStyle=shade;ctx.fillRect(0,0,W,H*.55);}
if(weather.some(value=>['rain','drizzle','heavy-rain','thunderstorm'].includes(value))){const drizzle=weather.includes('drizzle'),heavy=weather.includes('heavy-rain')||weather.includes('thunderstorm');for(let i=0;i<(drizzle?44:heavy?200:72);i++){const x=r()*W,startY=r()*(H+40)-20,q=((weather.includes('thunderstorm')?t*2:t)+r())%1,width=(drizzle?4.5:heavy?4.2:5)+r()*(drizzle?1.5:heavy?1.8:2),height=(drizzle?19:heavy?30:20)+r()*(drizzle?6:heavy?15:8),travel=(drizzle?150:heavy?540:192)+r()*(drizzle?48:heavy?180:72),y=(startY+q*travel)%(H+40)-20,alpha=((drizzle?.62:heavy?.55:.45)+r()*(drizzle?.12:.18))*Math.sin(q*Math.PI)**2;ctx.globalAlpha=alpha;const tint=mono?'183,183,183':heavy?'154,177,208':'177,196,220',glow=ctx.createLinearGradient(x-width,y,x+width,y);glow.addColorStop(0,`rgba(${tint},0)`);glow.addColorStop(.32,`rgba(${tint},1)`);glow.addColorStop(.68,`rgba(${tint},1)`);glow.addColorStop(1,`rgba(${tint},0)`);ctx.fillStyle=glow;ctx.beginPath();ctx.moveTo(x,y-height*.55);ctx.bezierCurveTo(x-width*.15,y-height*.25,x-width,y+height*.05,x-width,y+height*.2);ctx.bezierCurveTo(x-width,y+height*.58,x+width,y+height*.58,x+width,y+height*.2);ctx.bezierCurveTo(x+width,y+height*.05,x+width*.15,y-height*.25,x,y-height*.55);ctx.closePath();ctx.fill();}}
if(weather.includes('snow')){for(let i=0;i<230;i++){const x=r()*W,y=r()*H,q=(t+r())%1,radius=3+r()*5.5;ctx.beginPath();ctx.arc(x+Math.sin(q*TAU)*12,y+(q-.5)*130,radius,0,TAU);ctx.globalAlpha=.45*Math.sin(q*Math.PI);ctx.strokeStyle=palette.ink;ctx.lineWidth=1.7;ctx.stroke();ctx.globalAlpha=.92*Math.sin(q*Math.PI);ctx.fillStyle=mono?'#fff':'#fffefa';ctx.fill();}}

if(weather.includes('blizzard')){for(let i=0;i<380;i++){const startX=r()*W,startY=r()*H,q=(t+r())%1,radius=3+r()*5,travel=480+r()*180,x=(startX+q*travel+Math.sin(q*TAU)*18)%(W+30)-15,y=(startY+q*(510+r()*180))%(H+30)-15;ctx.globalAlpha=(.68+r()*.25)*Math.sin(q*Math.PI);ctx.fillStyle=mono?'#fff':'#eef5ff';ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.fill();}}
if(weather.includes('fog')){const fogTime=shortLoop?Math.sin(t*TAU)/(TAU*12):phase(time/10);ctx.globalAlpha=1;for(let i=0;i<3;i++)band(ctx,H*(.42+i*.22)+Math.sin((fogTime+i*.24)*TAU)*40,.46+.1*Math.sin((fogTime+i*.31)*TAU));}

if(weather.includes('flurries')){for(let i=0;i<40;i++){const x=r()*W,startY=r()*H,q=(t+r())%1,radius=4.5+r()*3,y=(startY+q*150)%(H+20)-10,drift=Math.sin(q*TAU)*14;ctx.globalAlpha=(.62+r()*.18)*Math.sin(q*Math.PI)**2;const glow=ctx.createRadialGradient(x+drift,y,0,x+drift,y,radius);glow.addColorStop(0,mono?'#fff':'#fffefa');glow.addColorStop(.42,mono?'#fff':'#fffefa');glow.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x+drift,y,radius,0,TAU);ctx.fill();}}
if(weather.includes('mist')){ctx.globalAlpha=1;for(let i=0;i<2;i++)band(ctx,H*(.73+i*.17)+Math.sin((t+i*.38)*TAU)*10,.25+.04*Math.sin((t+i*.27)*TAU),mono?'232,232,232':'224,222,236');}
// Soft, narrow layers over more of the scene; old mist remains Haze.
if(weather.includes('mist-wisps')){
 const tint=mono?'239,239,239':'232,234,246',edge=mono?'110,110,110':'108,113,132';
 for(let i=0;i<6;i++){
  const q=((shortLoop?0:phase(time/4))+i*.173+.18)%1,rx=240+i%3*48,ry=24+i%3*5;
  const x=-rx+q*(W+rx*2)+(shortLoop?Math.sin((t+i*.11)*TAU)*30:0),y=H*(.28+i*.105)+Math.sin((t+i*.21)*TAU)*12;
  ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);ctx.globalAlpha=.36*Math.sin(q*Math.PI)**2;
  const soft=ctx.createRadialGradient(0,0,0,0,0,1);
  soft.addColorStop(0,`rgba(${tint},1)`);soft.addColorStop(.48,`rgba(${edge},.8)`);soft.addColorStop(1,`rgba(${tint},0)`);
  ctx.fillStyle=soft;ctx.fillRect(-1,-1,2,2);ctx.restore();
 }
}
if(weather.includes('smoke')){
 const tint=mono?'105,105,105':'103,102,108',rim=mono?'191,191,191':'190,189,195',smokeTime=shortLoop?t:phase(time/3);
 for(let plume=0;plume<2;plume++)for(let i=0;i<7;i++){
  const q=(smokeTime+i/7+plume*.26)%1,rx=38+q*87,ry=30+q*42;
  const x=W*(plume?.72:.28)+q*80+Math.sin((q+plume*.19)*TAU)*42*q,y=H*(plume?.85:.94)-q*360;
  ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);ctx.globalAlpha=.68*Math.sin(q*Math.PI)**1.6;
  const soft=ctx.createRadialGradient(0,0,0,0,0,1);
  soft.addColorStop(0,`rgba(${tint},1)`);soft.addColorStop(.5,`rgba(${rim},.85)`);soft.addColorStop(1,`rgba(${tint},0)`);
  ctx.fillStyle=soft;ctx.fillRect(-1,-1,2,2);ctx.restore();
 }
}
if(weather.includes('smog')){
 const tint=mono?'125,125,125':'128,122,87',strength=.23+.025*Math.sin(t*TAU);
 ctx.globalAlpha=1;const veil=ctx.createLinearGradient(0,0,W*.18,H);
 veil.addColorStop(0,`rgba(${tint},.03)`);veil.addColorStop(.38,`rgba(${tint},${strength})`);veil.addColorStop(.77,`rgba(${tint},${strength+.075})`);veil.addColorStop(1,`rgba(${tint},.16)`);
 ctx.fillStyle=veil;ctx.fillRect(0,0,W,H);
}
if(weather.some(value=>['breeze','wind'].includes(value))){const breeze=!weather.includes('wind'),cycle=breeze?9000:6000,lifetime=breeze?6000:3000,spacing=breeze?600:750,burstAt=(time+900)%cycle;ctx.lineCap='round';for(let gust=0;gust<3;gust++){const q=(burstAt-gust*spacing)/lifetime,visible=q>0&&q<1,x=-520+q*(W+1040),baseY=H*(.18+gust*.30),strength=visible?Math.sin(q*Math.PI)**2:0;for(let line=0;line<5;line++){const length=410+r()*110,y=baseY+line*17,bend=14+line*3;if(!visible)continue;const glow=ctx.createLinearGradient(x-length/2,y,x+length/2,y),tint=mono?'151,151,151':'140,159,189';glow.addColorStop(0,`rgba(${tint},0)`);glow.addColorStop(.38,`rgba(${tint},1)`);glow.addColorStop(1,`rgba(${tint},0)`);ctx.globalAlpha=strength*(.52+(4-line)*.075);ctx.lineWidth=5.5+(4-line);ctx.strokeStyle=glow;ctx.beginPath();ctx.moveTo(x-length/2,y);ctx.bezierCurveTo(x-length*.18,y-bend,x+length*.18,y-bend,x+length/2,y);ctx.stroke();}}}

// A clustered burst crosses quickly, then leaves a full second of quiet.
// The phase offset gives still/reduced-motion renders a representative active burst.
if(weather.includes('gusts')&&!weather.includes('wind')){const burstAt=(time+450)%LOOP;ctx.lineCap='round';for(let gust=0;gust<9;gust++){const age=burstAt-gust*150,q=age/750,visible=q>0&&q<1,x=-520+q*(W+1040),baseY=H*(.12+(gust%5)*.18),strength=visible?Math.sin(q*Math.PI):0;for(let line=0;line<5;line++){const length=580+r()*180,y=baseY+line*15,bend=18+line*4;if(!visible)continue;const glow=ctx.createLinearGradient(x-length/2,y,x+length/2,y),tint=mono?'160,160,160':'151,174,207';glow.addColorStop(0,`rgba(${tint},0)`);glow.addColorStop(.32,`rgba(${tint},1)`);glow.addColorStop(1,`rgba(${tint},0)`);ctx.globalAlpha=strength*(.64+(4-line)*.075);ctx.lineWidth=7.5+(4-line);ctx.strokeStyle=glow;ctx.beginPath();ctx.moveTo(x-length/2,y);ctx.bezierCurveTo(x-length*.18,y-bend,x+length*.18,y-bend,x+length/2,y);ctx.stroke();}}}

if(weather.includes('thunderstorm')){const period=12000,at=((time%period)+period)%period,double=at>=6000,second=at>=9500,center=double?(second?10000:9000):3000,halfWidth=double?400:700,distance=Math.abs(at-center),pulse=distance<halfWidth?(1+Math.cos(distance/halfWidth*Math.PI))/2:0,boltX=W*(double?(second?.78:.65):.25),boltSize=double?(second?360:310):255;if(pulse>0){ctx.globalAlpha=pulse*.08*(boltSize/255);ctx.fillStyle=mono?'#e9e9e9':'#e9e6f2';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;const glow=ctx.createRadialGradient(boltX,H*.15,0,boltX,H*.15,W*.52);const flashTint=mono?'186,186,186':'184,177,207';glow.addColorStop(0,`rgba(${flashTint},${pulse*.11})`);glow.addColorStop(1,`rgba(${flashTint},0)`);ctx.fillStyle=glow;ctx.fillRect(0,0,W,H*.52);ctx.globalAlpha=pulse*.45;drawSprite?.(ctx,'lightning',boltX,boltSize-35,boltSize,false,palette.hue||0,false,palette.filter||'');}}
ctx.restore();}
window.GroveMotion={styles,loop:LOOP,draw,hasMotion:scene=>!!window.GroveEnvironment?.hasMotion(scene)||scene.weather?.some(x=>['rain','drizzle','heavy-rain','thunderstorm','snow','flurries','fog','mist','mist-wisps','smoke','smog','breeze','wind','gusts','blizzard'].includes(x))};
})();
