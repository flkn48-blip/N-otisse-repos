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

/* ===== Défilement fluide (Lenis) et texte qui se remplit au défilement =====
   Les deux effets sont désactivés si le visiteur a demandé à réduire les animations
   dans son système (réglage d'accessibilité « Réduire les animations »). */
(function(){
var reduit=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduit){return;}

/* --- Lenis : la page glisse et ralentit en douceur (souris et pavé tactile ; au doigt, défilement natif) --- */
var lenis=null;
if(window.Lenis){
/* Les listes qui défilent toutes seules (menu des mois du calendrier) gardent leur défilement normal */
Array.prototype.forEach.call(document.querySelectorAll('.nt-mois-menu'),function(m){m.setAttribute('data-lenis-prevent','');});
lenis=new Lenis({lerp:0.09,smoothWheel:true});
window.ntLenis=lenis;
var boucle=function(t){lenis.raf(t);requestAnimationFrame(boucle);};
requestAnimationFrame(boucle);
/* Liens vers une partie de la même page (#calendrier, #partenaires…) : glissement jusqu'à la section, sous le menu fixe */
document.addEventListener('click',function(e){
var a=e.target.closest&&e.target.closest('a[href*="#"]');
if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey){return;}
var u=new URL(a.href,location.href);
if(u.pathname!==location.pathname||!u.hash||u.hash.length<2){return;}
var cible=document.getElementById(decodeURIComponent(u.hash.slice(1)));
if(!cible){return;}
e.preventDefault();
var tete=document.querySelector('.nt-head');
lenis.scrollTo(cible,{offset:-((tete?tete.offsetHeight:0)+8)});
history.pushState(null,'',u.hash);
});
}

/* --- Texte qui se remplit : chaque mot passe du sable clair à sa couleur normale au fil du défilement --- */
function decouper(el){
var mots=[];
(function parcourir(n){
Array.prototype.slice.call(n.childNodes).forEach(function(c){
if(c.nodeType===3){
var morceaux=c.textContent.split(/(\s+)/),frag=document.createDocumentFragment();
morceaux.forEach(function(m){
if(!m){return;}
if(/^\s+$/.test(m)){frag.appendChild(document.createTextNode(m));return;}
var s=document.createElement('span');s.className='nt-mot';s.textContent=m;frag.appendChild(s);mots.push(s);
});
c.parentNode.replaceChild(frag,c);
}else if(c.nodeType===1){parcourir(c);}
});
})(el);
return mots;
}
var blocs=Array.prototype.slice.call(document.querySelectorAll('[data-remplir]')).map(function(el){
el.classList.add('nt-remplir');
return {el:el,mots:decouper(el)};
});
if(!blocs.length){return;}
var attente=false;
function maj(){
attente=false;
var vh=window.innerHeight,debut=vh*0.88,fin=vh*0.38;
blocs.forEach(function(b){
var r=b.el.getBoundingClientRect();
var p=(debut-r.top)/((debut-fin)+r.height*0.6);
p=Math.max(0,Math.min(1,p));
var n=Math.round(p*b.mots.length);
b.mots.forEach(function(m,i){m.classList.toggle('is-on',i<n);});
});
}
function demander(){if(!attente){attente=true;requestAnimationFrame(maj);}}
window.addEventListener('scroll',demander,{passive:true});
window.addEventListener('resize',demander);
maj();
})();

/* ===== Menu : l'élément surligné suit la section affichée =====
   Sur une page qui a plusieurs entrées dans le menu (Calendrier et Actualités sur la page Actualités,
   Équipe et Partenaires sur la page Équipe), on surligne celle de la section visible à l'écran. */
(function(){
function init(){
var nav=document.querySelector('.nt-nav');
if(!nav){return;}
var ici=location.pathname.replace(/index\.html$/,'');
var liens=Array.prototype.slice.call(nav.querySelectorAll('a:not(.nt-nav-cta)')).map(function(a){
var u=new URL(a.href,location.href);
return {a:a,meme:u.pathname.replace(/index\.html$/,'')===ici,cible:u.hash?document.getElementById(decodeURIComponent(u.hash.slice(1))):null};
}).filter(function(l){return l.meme;});
var avecSection=liens.filter(function(l){return l.cible;});
if(!avecSection.length){return;}
var sansSection=liens.filter(function(l){return !l.cible;})[0]||null;
var tete=document.querySelector('.nt-head');
function actif(l){
liens.forEach(function(x){
var on=x===l;
x.a.classList.toggle('is-actif',on);
if(on){x.a.setAttribute('aria-current','page');}else{x.a.removeAttribute('aria-current');}
});
}
var attente=false;
function maj(){
attente=false;
var seuil=(tete?tete.offsetHeight:0)+window.innerHeight*0.3;
var choisi=sansSection||avecSection[0];
avecSection.forEach(function(l){if(l.cible.getBoundingClientRect().top<=seuil){choisi=l;}});
/* tout en bas de la page, la dernière section est forcément celle qu'on regarde */
if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4){
var visibles=avecSection.filter(function(l){return l.cible.getBoundingClientRect().top<window.innerHeight;});
if(visibles.length){choisi=visibles[visibles.length-1];}
}
actif(choisi);
}
window.addEventListener('scroll',function(){if(!attente){attente=true;requestAnimationFrame(maj);}},{passive:true});
window.addEventListener('resize',maj);
maj();
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
