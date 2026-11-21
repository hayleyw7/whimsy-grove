// Follow the actual editor layout, not a second width breakpoint.
const phone=matchMedia('(max-width:650px)'),notice=document.getElementById('promptReminder'),home=notice.parentElement,workspace=document.querySelector('.workspace'),toolbox=document.querySelector('.toolbox');
function syncPromptPlacement(){
 if(phone.matches||document.body.hasAttribute('data-oddities-modal')){
  if(notice.nextElementSibling!==workspace)home.insertBefore(notice,workspace);
 }else if(notice.parentElement!==toolbox)toolbox.prepend(notice);
}
phone.addEventListener('change',syncPromptPlacement);
document.addEventListener('grove-picker-layout',syncPromptPlacement);
syncPromptPlacement();
