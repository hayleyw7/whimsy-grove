// On embedded builds, the device orientation can differ from the iframe shape.
(() => {
 const root=document.documentElement;
 const coarse=matchMedia('(pointer: coarse)');
 const landscape=matchMedia('(orientation: landscape)');
 const device=window.screen?.orientation;
 const ua=navigator.userAgent;
 const isMobileDevice=/Android|iPhone|iPad|iPod/i.test(ua)||/Macintosh/i.test(ua)&&navigator.maxTouchPoints>1;
 function sync(){
  const landscapeDevice=/^(portrait|landscape)-/.test(device?.type||'')?device.type.startsWith('landscape'):
   Number.isFinite(window.orientation)?Math.abs(window.orientation)===90:landscape.matches;
  root.classList.toggle('mobile-landscape',landscapeDevice&&(coarse.matches||isMobileDevice));
 }
 window.addEventListener('keydown',event=>{if(root.classList.contains('mobile-landscape'))event.stopImmediatePropagation();},true);
 for(const signal of [coarse,landscape,device])signal?.addEventListener?.('change',sync);
 for(const event of ['orientationchange','resize','pageshow'])window.addEventListener(event,sync);
 sync();
})();
