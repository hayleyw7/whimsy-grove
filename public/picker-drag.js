// Pointer dragging is transient: the scene changes only after a valid drop.
export function installPickerDrag({picker,canvas,canStart,preview,place,doc=document,win=window}){
 let gesture=null,suppressed=null,frame=0;
 const target=e=>e.target.closest?.('.stamp, .stamp-drag-handle');
 const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height,inside:r.width>0&&r.height>0&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom};};
 function paint(){if(!gesture?.active)return;const g=gesture,p=point(g),art=preview(g.id);g.image.style.left=g.clientX+'px';g.image.style.top=g.clientY+'px';g.image.style.width=art.width+'px';g.image.style.height=art.height+'px';g.image.style.opacity=p.inside?'.8':'.4';g.image.classList.toggle('outside-canvas',!p.inside);}
 function scroll(){if(!gesture?.active)return;const y=gesture.clientY,delta=y<44?-10:y>win.innerHeight-44?10:0;if(delta)win.scrollBy(0,delta);paint();frame=win.requestAnimationFrame(scroll);}
 function end(event,cancel=false){const g=gesture;if(!g||event?.pointerId!==undefined&&event.pointerId!==g.pointerId)return;gesture=null;win.cancelAnimationFrame(frame);g.image?.remove();if(g.button.hasPointerCapture?.(g.pointerId))g.button.releasePointerCapture(g.pointerId);if(g.active){suppressed={button:g.button,until:Date.now()+700};event?.preventDefault?.();if(!cancel&&canStart()){const p=point(event);if(p.inside)place(g.id,p.x,p.y);}}}
 picker.addEventListener('pointerdown',e=>{const button=target(e);if(gesture){end(null,true);return;}if(!button||button.disabled||!picker.contains(button)||e.button!==0||!e.isPrimary||!canStart())return;if(e.pointerType==='touch'&&!button.classList.contains('stamp-drag-handle'))return;gesture={id:button.dataset.id,button,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,clientX:e.clientX,clientY:e.clientY,active:false};button.setPointerCapture(e.pointerId);if(e.pointerType==='touch')e.preventDefault();});
 doc.addEventListener('pointermove',e=>{const g=gesture;if(!g||g.pointerId!==e.pointerId)return;g.clientX=e.clientX;g.clientY=e.clientY;if(!canStart()){end(e,true);return;}if(!g.active&&Math.hypot(e.clientX-g.startX,e.clientY-g.startY)>=6){g.active=true;const art=preview(g.id);g.image=doc.createElement('img');g.image.src=art.src;g.image.alt='';g.image.className='picker-drag-preview';g.image.setAttribute('aria-hidden','true');doc.body.append(g.image);scroll();}if(g.active){e.preventDefault();paint();}},{passive:false});
 doc.addEventListener('pointerup',e=>end(e));
 doc.addEventListener('pointercancel',e=>end(e,true));
 picker.addEventListener('lostpointercapture',e=>end(e,true));
 picker.addEventListener('dragstart',e=>{if(target(e))e.preventDefault();});
 const suppressClick=e=>!!(suppressed&&Date.now()<suppressed.until&&e.detail!==0);
 doc.addEventListener('pointerdown',()=>{suppressed=null;},true);
 doc.addEventListener('click',e=>{if(suppressClick(e)){e.preventDefault();e.stopImmediatePropagation();suppressed=null;}},true);
 doc.addEventListener('keydown',e=>{if(gesture&&e.key==='Escape'){e.preventDefault();e.stopPropagation();end(null,true);}},true);
 win.addEventListener('blur',()=>end(null,true));
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)end(null,true);});
 return {suppressClick};
}
