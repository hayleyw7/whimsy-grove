// Keep the welcome page in step with the editor's saved motion preference.
const root=document.documentElement;
const motionMedia=window.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false};
const motionPreferenceKey='spooky-grove-motion-v1';
function animationsEnabled(){
  if(motionMedia.matches)return false;
  try{
    const saved=JSON.parse(localStorage.getItem(motionPreferenceKey)||'null');
    if(typeof saved==='boolean')return saved;
  }catch{}
  return !motionMedia.matches;
}
if(root.classList.contains('welcome-waiting')){
  const ear=document.getElementById('welcomeEarMotion');
  let earTimer,earTwitchCount=0;
  const scheduleEar=()=>{
    clearTimeout(earTimer);
    if(!ear||!root.classList.contains('welcome-ambient')||document.hidden||!animationsEnabled())return;
    const delay=earTwitchCount===0?2500:6000+Math.random()*3000;
    earTimer=setTimeout(()=>{
      ear.querySelector('animate')?.beginElement();
      earTwitchCount++;
      scheduleEar();
    },delay);
  };
  const pause=()=>{
    const paused=document.hidden||!animationsEnabled();
    root.classList.toggle('welcome-paused',paused);
    if(!ear)return;
    if(paused){
      clearTimeout(earTimer);
      ear.pauseAnimations();
    }else{
      ear.unpauseAnimations();
      scheduleEar();
    }
  };
  document.addEventListener('visibilitychange',pause);
  motionMedia.addEventListener?.('change',pause);
  window.addEventListener('storage',event=>{
    if(event.key===motionPreferenceKey)pause();
  });
  pause();
  const spriteSheets=[...document.querySelectorAll('.grove .sprite')].map(sprite=>[sprite,getComputedStyle(sprite).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1]]);
  const sheets=new Set(spriteSheets.map(([,src])=>src).filter(Boolean)),decoded=new Set();
  const loads=[...sheets].map(src=>new Promise(resolve=>{
    const image=new Image();
    image.onload=async()=>{try{await image.decode();decoded.add(src);}catch{}resolve();};
    image.onerror=resolve;
    image.src=src;
  }));
  let timeout;
  clearTimeout(window.welcomeRevealTimer);
  const remaining=Math.max(0,(window.welcomeRevealDeadline||Date.now()+(motionMedia.matches?1700:2500))-Date.now());
  await Promise.race([Promise.allSettled(loads),new Promise(resolve=>{timeout=setTimeout(resolve,remaining);})]);
  clearTimeout(timeout);
  if(root.classList.contains('welcome-static')){
    for(const [sprite,src] of spriteSheets)if(src&&!decoded.has(src))sprite.classList.add('welcome-sheet-missing');
  }
  root.classList.remove('welcome-waiting');
  const ambient=()=>{root.classList.remove('welcome-stagger');root.classList.add('welcome-ambient');pause();};
  if(animationsEnabled()){
    root.classList.add('welcome-stagger');
    setTimeout(ambient,1150);
  }else ambient();
}
