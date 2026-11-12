/* Équipe : défilement continu des logos partenaires.
   On fait défiler le cadre (scrollLeft) plutôt que d'animer en CSS, pour que le blanc
   des logos reste fondu dans le fond lin (mix-blend-mode). La série est doublée dans le HTML :
   quand on a défilé d'une demi-largeur, on revient au début sans saut visible. */
(function(){
var VITESSE=40; /* pixels par seconde */
function init(){
var cadre=document.querySelector('.nt-logos-cadre');
var piste=cadre&&cadre.querySelector('.nt-logos');
if(!piste){return;}
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){return;}
var pos=0,avant=null,pause=false;
cadre.addEventListener('mouseenter',function(){pause=true;});
cadre.addEventListener('mouseleave',function(){pause=false;});
function pas(t){
if(avant!==null&&!pause){
var moitie=piste.scrollWidth/2;
pos+=VITESSE*Math.min(t-avant,100)/1000;
if(moitie>0&&pos>=moitie){pos-=moitie;}
cadre.scrollLeft=pos;
}
avant=t;
requestAnimationFrame(pas);
}
requestAnimationFrame(pas);
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
