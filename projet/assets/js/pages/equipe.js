/* Équipe : défilement continu des logos partenaires.
   On fait défiler le cadre (scrollLeft) plutôt que d'animer en CSS, pour que le blanc
   des logos reste fondu dans le fond lin (mix-blend-mode). La série est doublée dans le HTML :
   quand on a défilé d'une demi-largeur, on revient au début sans saut visible. */
/* Partenaires : la liste vient de l'espace membres (NT.api). Les logos écrits dans la page servent de secours. */
(function(){
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function colonne(p,cache){
var img=NT.img(p.logo_url);
var contenu=img?'<img loading="lazy" decoding="async" src="'+esc(img)+'" alt="'+(cache?'':esc(p.name))+'">':'<span class="nt-logo-nom">'+esc(p.name)+'</span>';
var lien=/^https?:\/\//i.test(p.url||'')&&!cache?'<a href="'+esc(p.url)+'" target="_blank" rel="noopener noreferrer">'+contenu+'<span class="nt-sr"> (nouvel onglet)</span></a>':contenu;
return '<div'+(cache?' aria-hidden="true"':'')+' class="wp-block-column"><figure class="wp-block-image">'+lien+'</figure></div>';
}
function init(){
var piste=document.querySelector('.nt-logos');
if(!piste||!window.NT||!NT.api){return;}
NT.api.partners().then(function(l){
l=l||[];
var section=document.getElementById('partenaires');
if(!l.length){if(section){section.hidden=true;}return;}
if(section){section.hidden=false;}
/* la série est écrite deux fois pour que le défilement boucle sans saut */
piste.innerHTML=l.map(function(p){return colonne(p,false);}).join('')+l.map(function(p){return colonne(p,true);}).join('');
}).catch(function(){});
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();

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
