(function(){
function init(){
var h=document.querySelector('.nt-head');
if(!h){return;}
var b=h.querySelector('.nt-burger');
var liens=h.querySelectorAll('.nt-nav a');
if(b){b.addEventListener('click',function(){var o=h.classList.toggle('is-open');b.setAttribute('aria-expanded',o?'true':'false');b.setAttribute('aria-label',o?'Fermer le menu':'Ouvrir le menu');});}
Array.prototype.forEach.call(liens,function(a){a.addEventListener('click',function(){h.classList.remove('is-open');if(b){b.setAttribute('aria-expanded','false');}});});
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
