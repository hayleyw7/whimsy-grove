// Move the existing buttons, preserving their handlers and enabled state.
const mobile=matchMedia('(max-width:650px)'),header=document.querySelector('.header-actions'),menu=document.getElementById('userMenu'),anchor=header.querySelector('.user-control'),newButton=document.getElementById('clear'),albumButton=document.getElementById('openAlbum');
function syncHeader(){if(mobile.matches){menu.prepend(newButton);header.insertBefore(albumButton,anchor);}else{header.insertBefore(newButton,anchor);header.insertBefore(albumButton,anchor);}}
mobile.addEventListener('change',syncHeader);syncHeader();
