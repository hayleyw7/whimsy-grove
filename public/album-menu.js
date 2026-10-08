const button=document.getElementById('albumOptions'),menu=document.getElementById('albumOptionsMenu'),wrap=document.getElementById('albumOptionsWrap'),dialog=document.getElementById('galleryDialog');
const items=()=>[...menu.querySelectorAll('[role="menuitem"]')].filter(item=>!item.disabled);
function close(restore=false){const wasOpen=!menu.hidden;menu.hidden=true;button.setAttribute('aria-expanded','false');if(restore&&wasOpen&&!wrap.hidden)button.focus();}
function open(last=false){if(wrap.hidden)return;menu.hidden=false;button.setAttribute('aria-expanded','true');const list=items();(last?list.at(-1):list[0])?.focus();}
button.addEventListener('click',()=>menu.hidden?open():close(true));
button.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open(event.key==='ArrowUp');}});
menu.addEventListener('keydown',event=>{const list=items(),index=list.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?list.length-1:(index+(event.key==='ArrowDown'?1:-1)+list.length)%list.length;list[next]?.focus();}else if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);}else if(event.key==='Tab')close(true);});
menu.addEventListener('click',event=>{if(event.target.closest('[role="menuitem"]'))close(true);});
document.addEventListener('pointerdown',event=>{if(!wrap.contains(event.target))close();});
document.addEventListener('focusin',event=>{if(!wrap.contains(event.target))close();});
document.addEventListener('grove-album-options-close',()=>close(true));
dialog.addEventListener('close',()=>close());
