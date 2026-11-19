// Keep inspiration beside the desktop catalogue, while preserving the phone layout.
const desktop=matchMedia('(min-width:651px)'),notice=document.getElementById('promptReminder'),home=notice.parentElement,workspace=document.querySelector('.workspace'),toolbox=document.querySelector('.toolbox');
function syncPromptPlacement(){if(desktop.matches){toolbox.prepend(notice);}else{home.insertBefore(notice,workspace);}}
desktop.addEventListener('change',syncPromptPlacement);syncPromptPlacement();
