// Keep the welcome page in step with the editor's saved motion preference.
const root=document.documentElement;
const motionMedia=window.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false};
const motionPreferenceKey='spooky-grove-motion-v1';
function animationsEnabled(){
  try{
    const saved=JSON.parse(localStorage.getItem(motionPreferenceKey)||'null');
    if(typeof saved==='boolean')return saved;
  }catch{}
  return !motionMedia.matches;
}
if(root.classList.contains('welcome-loading')){
  const ear=document.getElementById('welcomeEarMotion');
  let earTimer,earTwitchCount=0;
  const scheduleEar=()=>{
    clearTimeout(earTimer);
    if(!ear||!root.classList.contains('welcome-enter')||document.hidden||!animationsEnabled())return;
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
  const sheets=new Set([...document.querySelectorAll('.grove .sprite')].map(sprite=>getComputedStyle(sprite).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1]).filter(Boolean));
  const loads=[...sheets].map(src=>new Promise(resolve=>{
    const image=new Image();
    image.onload=async()=>{try{await image.decode();}catch{}resolve();};
    image.onerror=resolve;
    image.src=src;
  }));
  let timeout;
  await Promise.race([Promise.allSettled(loads),new Promise(resolve=>{timeout=setTimeout(resolve,2500);})]);
  clearTimeout(timeout);
  clearTimeout(window.welcomeRevealTimer);
  if(root.classList.contains('welcome-loading')&&animationsEnabled()){
    root.classList.add('welcome-enter');
    for(const sprite of document.querySelectorAll('.grove .sprite')){
      const arrival=getComputedStyle(sprite).getPropertyValue('--arrival');
      const delay=arrival.endsWith('ms')?parseFloat(arrival):parseFloat(arrival||'0')*1000;
      setTimeout(()=>sprite.classList.add('is-visible'),Number.isFinite(delay)?delay:0);
    }
  }
  root.classList.remove('welcome-loading');
  scheduleEar();
}
