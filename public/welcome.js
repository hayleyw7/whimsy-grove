// Wait for the decorative sheets before a single, deliberate entrance.
const root=document.documentElement;
if(root.classList.contains('welcome-loading')){
  const pause=()=>root.classList.toggle('welcome-paused',document.hidden);
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
}
