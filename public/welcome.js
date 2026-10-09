// Wait for the decorative sheets before a single, deliberate entrance.
const root=document.documentElement;
if(root.classList.contains('welcome-loading')){
  const ear=document.getElementById('welcomeEarMotion');
  let earTimer;
  const scheduleEar=()=>{clearTimeout(earTimer);if(ear&&root.classList.contains('welcome-enter')&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches)earTimer=setTimeout(()=>{ear.querySelector('animate').beginElement();scheduleEar();},7000+Math.random()*3000);};
  const pause=()=>{const paused=document.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches;root.classList.toggle('welcome-paused',paused);if(ear){if(paused){clearTimeout(earTimer);ear.pauseAnimations();}else{ear.unpauseAnimations();scheduleEar();}}};
  document.addEventListener('visibilitychange',pause);
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
  // A missing script, slow connection, failed image, or reduced-motion change
  // must never leave the decorations permanently hidden.
  if(root.classList.contains('welcome-loading')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)root.classList.add('welcome-enter');
  root.classList.remove('welcome-loading');
  scheduleEar();
}
