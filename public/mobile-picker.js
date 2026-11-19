const mobile=matchMedia('(max-width:650px)'),picker=document.getElementById('oddityPicker'),home=picker.parentElement,plus=document.getElementById('toggleOddities'),dialog=document.getElementById('mobileOdditiesDialog'),close=document.getElementById('closeMobileOddities');
function closePicker(){if(dialog.open)dialog.close();}
function syncPicker(){closePicker();if(mobile.matches){dialog.append(picker);plus.setAttribute('aria-haspopup','dialog');plus.setAttribute('aria-expanded','false');}else{home.append(picker);plus.removeAttribute('aria-haspopup');plus.removeAttribute('aria-expanded');}}
function openPicker(event){if(!mobile.matches)return;event.preventDefault();event.stopImmediatePropagation();dialog.showModal();plus.setAttribute('aria-expanded','true');close.focus({preventScroll:true});}
plus.addEventListener('click',openPicker,true);
document.querySelector('.skip-links a[href="#oddityPicker"]').addEventListener('click',openPicker,true);
close.addEventListener('click',closePicker);
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closePicker();}const oddityTile=event.target.closest('.oddity-tile,.oddity-drag-handle');if(oddityTile&&!oddityTile.disabled)closePicker();});
dialog.addEventListener('close',()=>{plus.setAttribute('aria-expanded','false');const target=plus.hidden?document.getElementById('garden'):plus;target.focus({preventScroll:true});});
mobile.addEventListener('change',syncPicker);syncPicker();
