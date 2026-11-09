(function(){
function init(){
var c=document.querySelector('.nt-pilules');
if(!c){return;}
c.classList.add('js-pil');
function voir(){c.classList.add('is-vu');}
if('IntersectionObserver' in window){
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){voir();io.disconnect();}});},{threshold:.3});
io.observe(c);
}else{voir();}
var ps=c.querySelectorAll('.nt-pilule');
Array.prototype.forEach.call(ps,function(p){
p.addEventListener('click',function(){
var o=p.classList.contains('is-ouvert');
Array.prototype.forEach.call(ps,function(q){q.classList.remove('is-ouvert');});
if(!o){p.classList.add('is-ouvert');}
});
});
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
