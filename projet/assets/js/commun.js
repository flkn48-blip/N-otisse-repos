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

(function(){
function init(){
var boites=document.querySelectorAll('.nt-has-sub');
Array.prototype.forEach.call(boites,function(b){
var btn=b.querySelector('.nt-sub-btn');
if(!btn){return;}
btn.addEventListener('click',function(e){
e.stopPropagation();
var o=!b.classList.contains('is-open');
Array.prototype.forEach.call(boites,function(x){x.classList.remove('is-open');var k=x.querySelector('.nt-sub-btn');if(k){k.setAttribute('aria-expanded','false');}});
b.classList.toggle('is-open',o);
btn.setAttribute('aria-expanded',o?'true':'false');
});
});
document.addEventListener('click',function(e){
Array.prototype.forEach.call(boites,function(x){if(!x.contains(e.target)){x.classList.remove('is-open');var k=x.querySelector('.nt-sub-btn');if(k){k.setAttribute('aria-expanded','false');}}});
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){Array.prototype.forEach.call(boites,function(x){x.classList.remove('is-open');});}});
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
